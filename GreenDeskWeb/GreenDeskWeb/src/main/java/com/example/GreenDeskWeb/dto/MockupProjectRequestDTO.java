package com.example.GreenDeskWeb.dto;

import lombok.Data;

import java.util.ArrayList;
import java.util.List;

@Data
public class MockupProjectRequestDTO {
    private String nomProjet;
    private List<Long> produitsSelectionnes = new ArrayList<>();
    private List<Long> colorisSelectionnes = new ArrayList<>();
    private String brouillonMaquette;
    private String logoPrincipalId;
    private String clientRef;
    private String couleurs; // JSON string
}