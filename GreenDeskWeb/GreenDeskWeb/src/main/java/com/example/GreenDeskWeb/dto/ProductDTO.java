package com.example.GreenDeskWeb.dto;


import com.example.GreenDeskWeb.enums.ProductCategory;
import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.ArrayList;
import java.util.List;


@Data
@AllArgsConstructor
@NoArgsConstructor
public class ProductDTO {
    private Long id;
    private String name;
    private ProductCategory category;
    private String categoryTitle;
    private String image;
    private String description;
    private List<String> gallery;
    private List<String> achievements;
    @JsonProperty("new")
    private boolean isNew;
    private Long categoryId;
    private double price;
    private List<ProductTabContentDTO> tabs = new ArrayList<>();
    private List<ProductAttributeDTO> attributes = new ArrayList<>();
    private List<ProductVariantDTO> variants = new ArrayList<>();
}

