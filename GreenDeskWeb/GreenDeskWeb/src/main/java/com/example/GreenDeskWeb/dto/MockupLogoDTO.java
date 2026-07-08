package com.example.GreenDeskWeb.dto;

import lombok.Data;

import java.time.LocalDateTime;

@Data
public class MockupLogoDTO {
    private Long id;
    private String nomOriginal;
    private String nomFichierStocke;
    private String publicPath;
    private String originalPdfPath;
    private String mimeType;
    private String extension;
    private boolean isVector;
    private String typeApercu;
    private LocalDateTime dateImport;
}