package com.example.GreenDeskWeb.entites;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Data
@NoArgsConstructor
@AllArgsConstructor
public class ProductMarkingZone {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "product_id")
    private Product product;

    private String nom;
    private boolean zoomActive = false;
    private int paddingPercent = 5;
    private String masquePng;
    private int displayOrder;
    private Double largeurZoneMm;
    private Double hauteurZoneMm;
}