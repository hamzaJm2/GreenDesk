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
public class TaxEntry {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "pricing_grid_id")
    private PricingGrid pricingGrid;

    private String taxName; // ex: "DEEE"

    @Column(nullable = false)
    private BigDecimal amountPerUnit; // ex: 0.05
}
