package com.example.GreenDeskWeb.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class PricingGridResponseDTO {

    private Long id;
    private Long productId;
    private String productName;
    private String deliveryDays;
    private String notes;

    private List<BaseVariantDTO> baseVariants;
    private List<OptionGroupDTO> optionGroups;
    private List<ShippingTierDTO> shippingTiers;
    private List<TaxEntryDTO> taxes;

    // Quantités disponibles extraites automatiquement
    private List<Integer> availableQties;

    @Data
    public static class BaseVariantDTO {

        private String name;         // "Sans marquage"
        private int displayOrder;
        private String deliveryDays; // 0, 1, 2, 3...


        private List<BaseVariantTierDTO> tiers;
    }

    @Data
    public static class BaseVariantTierDTO {

        private int qty;

        private BigDecimal unitPrice;
    }

    @Data
    public static class OptionGroupDTO {
        private Long id;
        private String name;
        private boolean required;
        private Integer additionalWeeks;
        private List<OptionTierDTO> tiers;
    }

    @Data
    public static class OptionTierDTO {
        private Long id;
        private int qty;
        private BigDecimal surcharge;
        private boolean isOffert;
    }

    @Data
    public static class ShippingTierDTO {
        private Long id;
        private int qty;
        private BigDecimal fixedCost;
        private String zone;
    }

    @Data
    public static class TaxEntryDTO {
        private Long id;
        private String taxName;
        private BigDecimal amountPerUnit;
    }
}