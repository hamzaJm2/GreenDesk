package com.example.GreenDeskWeb.services.MarkingZoneService;

import com.example.GreenDeskWeb.dto.MarkingZoneDTO;
import com.example.GreenDeskWeb.entites.MarkingZone;
import com.example.GreenDeskWeb.entites.Product;
import com.example.GreenDeskWeb.mappers.MarkingZoneMapper;
import com.example.GreenDeskWeb.repositories.MarkingZoneRepository;
import com.example.GreenDeskWeb.repositories.ProductRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class MarkingZoneServiceImpl implements MarkingZoneService {

    private final MarkingZoneRepository markingZoneRepository;
    private final ProductRepository productRepository;
    private final MarkingZoneMapper markingZoneMapper;

    @Override
    public List<MarkingZoneDTO> getByProductId(Long productId) {
        return markingZoneMapper.toDtoList(
                markingZoneRepository.findByProductIdOrderByDisplayOrderAsc(productId)
        );
    }

    @Override
    public MarkingZoneDTO create(Long productId, MarkingZoneDTO dto) {
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new RuntimeException("Produit introuvable : " + productId));
        MarkingZone zone = markingZoneMapper.toEntity(dto);
        zone.setProduct(product);
        return markingZoneMapper.toDto(markingZoneRepository.save(zone));
    }

    @Override
    public MarkingZoneDTO update(Long id, MarkingZoneDTO dto) {
        MarkingZone zone = markingZoneRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Zone introuvable : " + id));
        zone.setNom(dto.getNom());
        zone.setMasquePng(dto.getMasquePng());
        zone.setZoomActive(dto.isZoomActive());
        zone.setDefaultXPercent(dto.getDefaultXPercent());
        zone.setDefaultYPercent(dto.getDefaultYPercent());
        zone.setDefaultScalePercent(dto.getDefaultScalePercent());
        zone.setPaddingPercent(dto.getPaddingPercent());
        zone.setDisplayOrder(dto.getDisplayOrder());
        return markingZoneMapper.toDto(markingZoneRepository.save(zone));
    }

    @Override
    public void delete(Long id) {
        markingZoneRepository.deleteById(id);
    }
}