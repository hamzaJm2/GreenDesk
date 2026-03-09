package com.example.GreenDeskWeb.controllers;

import com.example.GreenDeskWeb.dto.ProductTabContentDTO;
import com.example.GreenDeskWeb.services.ProductTabContentService.ProductTabContentService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/products/tabs")
@RequiredArgsConstructor
public class ProductTabController {

    private final ProductTabContentService tabContentService;

    @GetMapping("/{productId}")
    public List<ProductTabContentDTO> getTabs(@PathVariable Long productId) {
        return tabContentService.getTabsForProduct(productId);
    }
}