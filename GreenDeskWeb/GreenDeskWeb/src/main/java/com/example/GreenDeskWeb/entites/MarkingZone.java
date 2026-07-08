package com.example.GreenDeskWeb.entites;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Data
@NoArgsConstructor
@AllArgsConstructor
public class MarkingZone {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "product_id")
    private Product product;

    private String nom;
    private String masquePng;
    private boolean zoomActive;
    private double defaultXPercent;
    private double defaultYPercent;
    private double defaultScalePercent;
    private double paddingPercent;
    private int displayOrder;
}