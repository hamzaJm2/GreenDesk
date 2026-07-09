package com.example.GreenDeskWeb.entites;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Data
@NoArgsConstructor
@AllArgsConstructor
public class MockupLogo {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "project_id")
    private MockupProject project;

    private String nomOriginal;
    private String nomFichierStocke;
    private String publicPath;
    private String originalPdfPath;
    private String mimeType;
    private String extension;
    private boolean isVector;
    private String typeApercu = "image";

    private LocalDateTime dateImport = LocalDateTime.now();
}