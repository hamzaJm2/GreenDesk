package com.example.GreenDeskWeb.dto;


import com.example.GreenDeskWeb.enums.ProductCategory;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;


@Data
@AllArgsConstructor
@NoArgsConstructor
public class ProductDTO {
    private Long id;
    private String name;
    private ProductCategory category;
    private String categoryTitle;
    private double deliveryPrice;
    private String image;
    private String description;
    private List<String> gallery;
    private List<String> achievements;
    private boolean isNew;
    private Long categoryId;
    private double price;
}

