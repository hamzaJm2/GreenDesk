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
public class OptionGroup {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "pricing_grid_id")
    private PricingGrid pricingGrid;

    private String name; // ex: "Surcoût emballage personnalisé"

    private boolean required; // option obligatoire ou facultative

    // Délai additionnel en semaines lié à cette option
    private Integer additionalWeeks;

    @OneToMany(mappedBy = "optionGroup", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<OptionTier> tiers = new ArrayList<>();
}