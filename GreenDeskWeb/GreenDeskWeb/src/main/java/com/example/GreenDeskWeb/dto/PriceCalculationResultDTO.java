package com.example.GreenDeskWeb.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.List;

@NoArgsConstructor
@AllArgsConstructor
@Data
@Builder
public class PriceCalculationResultDTO {
    private int qty;
    private String zone;
    private BigDecimal unitBasePrice;
    private BigDecimal unitOptionSurcharge;
    private BigDecimal unitTax;
    private BigDecimal unitTotal;
    private BigDecimal subtotal;
    private BigDecimal shippingCost;
    private BigDecimal grandTotal;
    private List<String> selectedOptions;
}


