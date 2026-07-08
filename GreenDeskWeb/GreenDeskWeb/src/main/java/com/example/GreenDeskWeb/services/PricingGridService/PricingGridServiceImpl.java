package com.example.GreenDeskWeb.services.PricingGridService;

import com.example.GreenDeskWeb.dto.PriceCalculationRequestDTO;
import com.example.GreenDeskWeb.dto.PriceCalculationResultDTO;
import com.example.GreenDeskWeb.dto.PricingGridRequestDTO;
import com.example.GreenDeskWeb.dto.PricingGridResponseDTO;
import com.example.GreenDeskWeb.entites.*;
import com.example.GreenDeskWeb.mappers.PriceCalculationMapper;
import com.example.GreenDeskWeb.mappers.PricingGridMapper;
import com.example.GreenDeskWeb.repositories.PricingGridRepository;
import com.example.GreenDeskWeb.repositories.ProductRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.AllArgsConstructor;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

@Service
@AllArgsConstructor
public class PricingGridServiceImpl implements PricingGridService{

    private final PricingGridMapper pricingGridMapper ;
    private final ProductRepository productRepository ;
    private final PricingGridRepository pricingGridRepository ;
    private final PriceCalculationMapper priceCalculationMapper;



    @Override
    public PricingGridResponseDTO createForProduct(Long productId, PricingGridRequestDTO request) {
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new EntityNotFoundException("Produit introuvable : " + productId));

        if (pricingGridRepository.existsByProductId(productId)) {
            throw new IllegalStateException("Ce produit a déjà une grille tarifaire.");
        }

        validateRequest(request);

        PricingGrid grid = pricingGridMapper.PricingGridRequestDTOtoPricingGrid(request, product);
        return pricingGridMapper.PricingGridToPricingGridResponseDTO(pricingGridRepository.save(grid));

    }

    @Override
    public PricingGridResponseDTO updateForProduct(Long productId, PricingGridRequestDTO request) {
        PricingGrid existing = pricingGridRepository.findByProductId(productId)
                .orElseThrow(() -> new EntityNotFoundException(
                        "Aucune grille tarifaire pour le produit : " + productId));

        validateRequest(request);


        existing.getBaseVariants().clear();
        existing.getOptionGroups().clear();
        existing.getShippingTiers().clear();
        existing.getTaxes().clear();

        existing.setDeliveryDays(request.getDeliveryDays());
        existing.setNotes(request.getNotes());


        PricingGrid updated = pricingGridMapper.PricingGridRequestDTOtoPricingGrid(request, existing.getProduct());
        updated.setId(existing.getId());

        return pricingGridMapper.PricingGridToPricingGridResponseDTO(pricingGridRepository.save(updated));

    }

    @Override
    public PricingGridResponseDTO getByProductId(Long productId) {
        PricingGrid grid = pricingGridRepository.findByProductId(productId)
                .orElseThrow(() -> new EntityNotFoundException(
                        "Aucune grille tarifaire pour le produit : " + productId));
        return pricingGridMapper.PricingGridToPricingGridResponseDTO(grid);

    }

    @Override
    public void deleteByProductId(Long productId) {
        PricingGrid grid = pricingGridRepository.findByProductId(productId)
                .orElseThrow(() -> new EntityNotFoundException(
                        "Aucune grille tarifaire pour le produit : " + productId));
        pricingGridRepository.delete(grid);

    }

    @Override
    public PriceCalculationResultDTO calculatePrice(Long productId, PriceCalculationRequestDTO request) {
        PricingGrid grid = pricingGridRepository.findByProductId(productId)
                .orElseThrow(() -> new EntityNotFoundException(
                        "Aucune grille tarifaire pour le produit : " + productId));

        int qty = request.getQty();
        String zone = request.getZone() != null ? request.getZone() : "FR";

        BaseVariant variant = grid.getBaseVariants().stream()
                .filter(v -> v.getId().equals(request.getSelectedBaseVariantId()))
                .findFirst()
                .orElseThrow(() -> new IllegalArgumentException(
                        "Variante de base introuvable : " + request.getSelectedBaseVariantId()));

        BigDecimal unitBase = variant.getTiers().stream()
                .filter(t -> t.getQty() == qty)
                .map(BaseVariantTier::getUnitPrice)
                .findFirst()
                .orElseThrow(() -> new IllegalArgumentException(
                        "Quantité non disponible : " + qty));

        // 2. Surcoûts des options sélectionnées
        BigDecimal totalOptionSurcharge = BigDecimal.ZERO;
        List<String> selectedOptionLabels = new ArrayList<>();

        for (Long optionGroupId : request.getSelectedOptionGroupIds()) {
            OptionGroup group = grid.getOptionGroups().stream()
                    .filter(og -> og.getId().equals(optionGroupId))
                    .findFirst()
                    .orElseThrow(() -> new IllegalArgumentException(
                            "Option introuvable : " + optionGroupId));

            BigDecimal surcharge = group.getTiers().stream()
                    .filter(t -> t.getQty() == qty)
                    .map(OptionTier::getSurcharge)
                    .findFirst()
                    .orElse(BigDecimal.ZERO);

            if (surcharge != null) {
                totalOptionSurcharge = totalOptionSurcharge.add(surcharge);
                selectedOptionLabels.add(group.getName() + " : +" + surcharge + "€");
            } else {
                selectedOptionLabels.add(group.getName() + " : Offert !");
            }
        }

        // 3. Taxes unitaires
        BigDecimal totalTaxPerUnit = grid.getTaxes().stream()
                .map(TaxEntry::getAmountPerUnit)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        // 4. Frais de port fixes
        BigDecimal shippingCost = grid.getShippingTiers().stream()
                .filter(st -> st.getQty() == qty && zone.equals(st.getZone()))
                .map(ShippingTier::getFixedCost)
                .findFirst()
                .orElse(BigDecimal.ZERO);

        // 5. Calcul final
        BigDecimal unitTotal = unitBase.add(totalOptionSurcharge).add(totalTaxPerUnit);
        BigDecimal subtotal = unitTotal.multiply(BigDecimal.valueOf(qty));
        BigDecimal grandTotal = subtotal.add(shippingCost);


        return priceCalculationMapper.valuesToPriceCalculationResultDTO(
                qty,
                unitBase,
                totalOptionSurcharge,
                totalTaxPerUnit,
                unitTotal,
                subtotal,
                shippingCost,
                grandTotal,
                selectedOptionLabels,
                zone
        );
    }


    private void validateRequest(PricingGridRequestDTO request) {

        // Toutes les variantes doivent avoir exactement les mêmes paliers de qtés
        List<Integer> referenceQties = request.getBaseVariants().get(0)
                .getTiers().stream()
                .map(PricingGridRequestDTO.BaseVariantTierDTO::getQty)
                .sorted().toList();

        request.getBaseVariants().forEach(variant -> {
            List<Integer> variantQties = variant.getTiers().stream()
                    .map(PricingGridRequestDTO.BaseVariantTierDTO::getQty)
                    .sorted().toList();

            if (!variantQties.equals(referenceQties)) {
                throw new IllegalArgumentException(
                        "La variante '" + variant.getName() +
                                "' doit avoir les mêmes paliers de quantité que les autres variantes.");
            }
        });

        // Les options doivent aussi utiliser les mêmes qtés
        Set<Integer> baseQtySet = new HashSet<>(referenceQties);
        request.getOptionGroups().forEach(og -> {
            List<Integer> optionQties = og.getTiers().stream()
                    .map(PricingGridRequestDTO.OptionTierDTO::getQty).toList();
            if (!baseQtySet.containsAll(optionQties)) {
                throw new IllegalArgumentException(
                        "L'option '" + og.getName() +
                                "' contient des quantités non définies dans les variantes de base.");
            }
        });
    }
}
