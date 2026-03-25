package com.example.GreenDeskWeb.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class ProductVariantDTO {
    private Long id;
    private List<ProductAttributeValueDTO> values;
    private double extraPrice;
    private double finalPrice;
    private boolean isActive;
    private String label;
}