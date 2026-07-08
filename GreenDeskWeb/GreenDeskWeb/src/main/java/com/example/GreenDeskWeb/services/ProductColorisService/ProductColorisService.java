package com.example.GreenDeskWeb.services.ProductColorisService;

import com.example.GreenDeskWeb.dto.ProductColorisDTO;

import java.util.List;

public interface ProductColorisService {
    List<ProductColorisDTO> getByProductId(Long productId);
    List<ProductColorisDTO> getActiveByProductId(Long productId);
    ProductColorisDTO create(Long productId, ProductColorisDTO dto);
    ProductColorisDTO update(Long id, ProductColorisDTO dto);
    void delete(Long id);
}