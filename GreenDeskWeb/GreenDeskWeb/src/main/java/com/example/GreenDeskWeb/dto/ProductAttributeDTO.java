package com.example.GreenDeskWeb.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;
@Data
@AllArgsConstructor
@NoArgsConstructor
public class ProductAttributeDTO {
    private Long id;
    private String name;
    private List<ProductAttributeValueDTO> values;
}
