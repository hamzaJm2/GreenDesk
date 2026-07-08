package com.example.GreenDeskWeb.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class ProductMarkingZoneDTO {
    private Long id;
    private String nom;
    private boolean zoomActive;
    private int paddingPercent;
    private String masquePng;
    private int displayOrder;
    private Double largeurZoneMm;
    private Double hauteurZoneMm;
}