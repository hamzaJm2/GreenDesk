package com.example.GreenDeskWeb.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.antlr.v4.runtime.misc.NotNull;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class PricingGridRequestDTO {

    private String deliveryDays;
    private String notes;


    private List<BaseVariantDTO> baseVariants;

    private List<OptionGroupDTO> optionGroups = new ArrayList<>();
    private List<ShippingTierDTO> shippingTiers = new ArrayList<>();
    private List<TaxEntryDTO> taxes = new ArrayList<>();

    @Data
    public static class BaseVariantDTO {

        private String name;         // "Sans marquage"
        private int displayOrder;
        private String deliveryDays;// 0, 1, 2, 3...


        private List<BaseVariantTierDTO> tiers;
    }

    @Data
    public static class BaseVariantTierDTO {

        private int qty;

        private BigDecimal unitPrice;
    }
    @Data
    public static class OptionGroupDTO {

        private String name;
        private boolean required;
        private Integer additionalWeeks;

        private List<OptionTierDTO> tiers;
    }

    @Data
    public static class OptionTierDTO {

        private int qty;
        private BigDecimal surcharge; // null = Offert !
    }

    @Data
    public static class ShippingTierDTO {

        private int qty;
        @NotNull
        private BigDecimal fixedCost;
        private String zone; // "FR", "Zone1", "Zone2"
    }

    @Data
    public static class TaxEntryDTO {

        private String taxName;
        @NotNull
        private BigDecimal amountPerUnit;
    }
}