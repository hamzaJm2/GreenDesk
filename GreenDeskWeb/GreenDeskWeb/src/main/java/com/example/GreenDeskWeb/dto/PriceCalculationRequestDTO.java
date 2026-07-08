package com.example.GreenDeskWeb.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.ArrayList;
import java.util.List;

@AllArgsConstructor
@NoArgsConstructor
@Data
public class PriceCalculationRequestDTO {
    private Long selectedBaseVariantId;
    private int qty;
    private String zone; // "FR" par défaut
    private List<Long> selectedOptionGroupIds = new ArrayList<>();
}