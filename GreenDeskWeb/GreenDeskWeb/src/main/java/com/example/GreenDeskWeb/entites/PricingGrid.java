package com.example.GreenDeskWeb.entites;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.ArrayList;
import java.util.List;

@Entity
@Data
@NoArgsConstructor
@AllArgsConstructor
public class PricingGrid {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne
    @JoinColumn(name = "product_id", nullable = false)
    private Product product;

    // Ex: "2-3 semaines"
    private String deliveryDays;

    private String notes;

    @OneToMany(mappedBy = "pricingGrid", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<BaseVariant> baseVariants = new ArrayList<>();

    @OneToMany(mappedBy = "pricingGrid", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<OptionGroup> optionGroups = new ArrayList<>();

    @OneToMany(mappedBy = "pricingGrid", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<ShippingTier> shippingTiers = new ArrayList<>();

    @OneToMany(mappedBy = "pricingGrid", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<TaxEntry> taxes = new ArrayList<>();
}