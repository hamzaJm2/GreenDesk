package com.example.GreenDeskWeb.entites;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

@Entity
@Data
@NoArgsConstructor
@AllArgsConstructor
public class BaseVariant {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "pricing_grid_id")
    private PricingGrid pricingGrid;

    // ex: "Sans marquage", "Marquage bouchon inclus", "Marquage corps inclus"
    @Column(nullable = false)
    private String name;

    private String deliveryDays;

    // Ordre d'affichage dans le tableau
    private int displayOrder;

    @OneToMany(mappedBy = "baseVariant", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<BaseVariantTier> tiers = new ArrayList<>();
}
