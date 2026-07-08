package com.example.GreenDeskWeb.dto;

import lombok.Data;

@Data
public class MarkingZoneDTO {
    private Long id;
    private String nom;
    private String masquePng;
    private boolean zoomActive;
    private double defaultXPercent;
    private double defaultYPercent;
    private double defaultScalePercent;
    private double paddingPercent;
    private int displayOrder;
}