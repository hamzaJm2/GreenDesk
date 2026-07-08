package com.example.GreenDeskWeb.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class ProductStrengthDTO {
    private Long id;
    private String titre;
    private String phrase;
    private String iconId;
    private int displayOrder;
}