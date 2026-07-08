package com.example.GreenDeskWeb.dto;

import lombok.Data;

@Data
public class ProductColorisDTO {
    private Long id;
    private String nom;
    private String codeHex;
    private String imageProduit;
    private String couleurMasquePng;
    private String imageBaseBlanc;
    private boolean couleurPersonnalisable;
    private boolean actif;
    private int displayOrder;
}