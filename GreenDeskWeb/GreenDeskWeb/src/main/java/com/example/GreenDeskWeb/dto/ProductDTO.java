package com.example.GreenDeskWeb.dto;


import lombok.Data;

import java.util.List;

@Data
public class ProductDTO {
    private Long id;
    private String name;
    private double price;
    private double deliveryPrice;
    private String image;
    private String description;
    private List<String> gallery;
    private List<String> achievements;
    private boolean isNew;
    private Long categoryId;
    private String categoryTitle;
}

