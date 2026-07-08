package com.example.GreenDeskWeb.entites;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Data
@NoArgsConstructor
@AllArgsConstructor
public class ProductColoris {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "product_id")
    private Product product;

    private String nom;
    private String codeHex;
    private String imageProduit;
    private String couleurMasquePng;
    private String imageBaseBlanc;
    private boolean couleurPersonnalisable = false;
    private boolean actif = true;
    private int displayOrder;
}