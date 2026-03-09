package com.example.GreenDeskWeb.services.ProductTabContentService;


import com.example.GreenDeskWeb.dto.ProductTabContentDTO;

import java.util.List;

public interface ProductTabContentService {
    List<ProductTabContentDTO> getTabsForProduct(Long productId);
}
