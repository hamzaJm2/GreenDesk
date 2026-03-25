package com.example.GreenDeskWeb.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class ProductTabDefinitionDTO {
    private Long id;
    private String tabKey;
    private String label;
}