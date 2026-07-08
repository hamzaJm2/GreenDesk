package com.example.GreenDeskWeb.dto;

import lombok.Data;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Data
public class MockupProjectDTO {
    private Long id;
    private String nomProjet;
    private String statut;
    private List<MockupLogoDTO> logos = new ArrayList<>();
    private String logoPrincipalId;
    private List<Long> produitsSelectionnes = new ArrayList<>();
    private List<Long> colorisSelectionnes = new ArrayList<>();
    private String brouillonMaquette;
    private LocalDateTime dateMiseAJour;
    private String clientRef;
    private String couleurs; // JSON string
    private String ownerEmail;
    private String ownerNom;
    private String ownerPrenom;
}