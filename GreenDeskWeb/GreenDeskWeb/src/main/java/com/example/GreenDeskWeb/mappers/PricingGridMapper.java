package com.example.GreenDeskWeb.mappers;

import com.example.GreenDeskWeb.dto.PricingGridRequestDTO;
import com.example.GreenDeskWeb.dto.PricingGridResponseDTO;
import com.example.GreenDeskWeb.entites.*;
import org.mapstruct.AfterMapping;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;

@Mapper(componentModel = "spring")
public interface PricingGridMapper {

    /* ============================================================
       ===============   DTO → ENTITY   ===========================
       ============================================================ */

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "product", source = "product")
    @Mapping(target = "deliveryDays", source = "dto.deliveryDays")
    @Mapping(target = "notes", source = "dto.notes")
    @Mapping(target = "baseVariants", source = "dto.baseVariants")
    @Mapping(target = "optionGroups", source = "dto.optionGroups")
    @Mapping(target = "shippingTiers", source = "dto.shippingTiers")
    @Mapping(target = "taxes", source = "dto.taxes")
    PricingGrid PricingGridRequestDTOtoPricingGrid(PricingGridRequestDTO dto, Product product);


    /* --- BaseVariant --- */

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "pricingGrid", ignore = true)
    @Mapping(target = "tiers", source = "tiers")
    BaseVariant BaseVariantDTOtoBaseVariant(PricingGridRequestDTO.BaseVariantDTO dto);


    /* --- BaseVariantTier --- */

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "baseVariant", ignore = true)
    BaseVariantTier BaseVariantTierDTOtoBaseVariantTier(PricingGridRequestDTO.BaseVariantTierDTO dto);


    /* --- OptionGroup --- */

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "pricingGrid", ignore = true)
    @Mapping(target = "tiers", source = "tiers")
    OptionGroup OptionGroupDTOtoOptionGroup(PricingGridRequestDTO.OptionGroupDTO dto);


    /* --- OptionTier --- */

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "optionGroup", ignore = true)
    OptionTier OptionTierDTOtoOptionTier(PricingGridRequestDTO.OptionTierDTO dto);


    /* --- ShippingTier --- */

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "pricingGrid", ignore = true)
    ShippingTier ShippingTierDTOtoShippingTier(PricingGridRequestDTO.ShippingTierDTO dto);


    /* --- TaxEntry --- */

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "pricingGrid", ignore = true)
    TaxEntry TaxEntryDTOtoTaxEntry(PricingGridRequestDTO.TaxEntryDTO dto);


    /* ============================================================
       ===============   ENTITY → RESPONSE DTO   ==================
       ============================================================ */

    @Mapping(target = "productId", source = "product.id")
    @Mapping(target = "productName", source = "product.name")
    @Mapping(target = "baseVariants", source = "baseVariants")
    @Mapping(
            target = "availableQties",
            expression = "java(grid.getBaseVariants() != null && !grid.getBaseVariants().isEmpty() " +
                    "? grid.getBaseVariants().get(0).getTiers().stream()" +
                    ".map(com.example.GreenDeskWeb.entites.BaseVariantTier::getQty)" +
                    ".sorted().toList() " +
                    ": new java.util.ArrayList<>())"
    )
    PricingGridResponseDTO PricingGridToPricingGridResponseDTO(PricingGrid grid);


    /* --- BaseVariant → DTO --- */

    @Mapping(target = "tiers", source = "tiers")
    PricingGridResponseDTO.BaseVariantDTO BaseVariantToBaseVariantDTO(BaseVariant entity);


    /* --- BaseVariantTier → DTO --- */

    PricingGridResponseDTO.BaseVariantTierDTO BaseVariantTierToBaseVariantTierDTO(BaseVariantTier entity);


    /* --- OptionGroup → DTO --- */

    @Mapping(target = "tiers", source = "tiers")
    PricingGridResponseDTO.OptionGroupDTO OptionGroupToOptionGroupDTO(OptionGroup entity);


    /* --- OptionTier → DTO --- */

    @Mapping(target = "offert", expression = "java(entity.getSurcharge() == null)")
    PricingGridResponseDTO.OptionTierDTO OptionTierToOptionTierDTO(OptionTier entity);


    /* --- ShippingTier → DTO --- */

    PricingGridResponseDTO.ShippingTierDTO ShippingTierToShippingTierDTO(ShippingTier entity);


    /* --- TaxEntry → DTO --- */

    PricingGridResponseDTO.TaxEntryDTO TaxEntryToTaxEntryDTO(TaxEntry entity);


    /* ============================================================
       ===============   FIX RELATIONS (AFTER MAPPING) ============
       ============================================================ */

    @AfterMapping
    default void linkChildren(@MappingTarget PricingGrid grid) {

        // BaseVariants + leurs tiers
        if (grid.getBaseVariants() != null) {
            grid.getBaseVariants().forEach(variant -> {
                variant.setPricingGrid(grid);
                if (variant.getTiers() != null) {
                    variant.getTiers().forEach(t -> t.setBaseVariant(variant));
                }
            });
        }

        // Options + leurs tiers
        if (grid.getOptionGroups() != null) {
            grid.getOptionGroups().forEach(g -> {
                g.setPricingGrid(grid);
                if (g.getTiers() != null) {
                    g.getTiers().forEach(t -> t.setOptionGroup(g));
                }
            });
        }

        // Shipping
        if (grid.getShippingTiers() != null) {
            grid.getShippingTiers().forEach(s -> s.setPricingGrid(grid));
        }

        // Taxes
        if (grid.getTaxes() != null) {
            grid.getTaxes().forEach(tx -> tx.setPricingGrid(grid));
        }
    }
}
