package com.example.GreenDeskWeb.entites;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Entity
@Data
@NoArgsConstructor
@AllArgsConstructor
public class ShippingTier {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "pricing_grid_id")
    private PricingGrid pricingGrid;

    @Column(nullable = false)
    private int qty;

    @Column(nullable = false)
    private BigDecimal fixedCost;

    private String zone; // "FR", "Zone1", "Zone2"
}