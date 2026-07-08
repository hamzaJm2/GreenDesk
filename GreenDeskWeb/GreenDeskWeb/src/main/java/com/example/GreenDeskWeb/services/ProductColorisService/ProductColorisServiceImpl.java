package com.example.GreenDeskWeb.services.ProductColorisService;

import com.example.GreenDeskWeb.dto.ProductColorisDTO;
import com.example.GreenDeskWeb.entites.Product;
import com.example.GreenDeskWeb.entites.ProductColoris;
import com.example.GreenDeskWeb.mappers.ProductColorisMapper;
import com.example.GreenDeskWeb.repositories.ProductColorisRepository;
import com.example.GreenDeskWeb.repositories.ProductRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class ProductColorisServiceImpl implements ProductColorisService {

    private final ProductColorisRepository productColorisRepository;
    private final ProductRepository productRepository;
    private final ProductColorisMapper productColorisMapper;

    @Override
    public List<ProductColorisDTO> getByProductId(Long productId) {
        return productColorisMapper.toDtoList(
                productColorisRepository.findByProductIdOrderByDisplayOrderAsc(productId)
        );
    }

    @Override
    public List<ProductColorisDTO> getActiveByProductId(Long productId) {
        return productColorisMapper.toDtoList(
                productColorisRepository.findByProductIdAndActifTrue(productId)
        );
    }

    @Override
    public ProductColorisDTO create(Long productId, ProductColorisDTO dto) {
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new RuntimeException("Produit introuvable : " + productId));
        ProductColoris coloris = productColorisMapper.toEntity(dto);
        coloris.setProduct(product);
        return productColorisMapper.toDto(productColorisRepository.save(coloris));
    }

    @Override
    public ProductColorisDTO update(Long id, ProductColorisDTO dto) {
        ProductColoris coloris = productColorisRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Coloris introuvable : " + id));
        coloris.setNom(dto.getNom());
        coloris.setCodeHex(dto.getCodeHex());
        coloris.setImageProduit(dto.getImageProduit());
        coloris.setActif(dto.isActif());
        coloris.setDisplayOrder(dto.getDisplayOrder());
        return productColorisMapper.toDto(productColorisRepository.save(coloris));
    }

    @Override
    public void delete(Long id) {
        productColorisRepository.deleteById(id);
    }
}