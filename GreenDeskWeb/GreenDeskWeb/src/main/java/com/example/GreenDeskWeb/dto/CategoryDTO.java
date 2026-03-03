package com.example.GreenDeskWeb.dto;


import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class CategoryDTO {
    private Long id;
    private String title;
    private String description;
    private String image;
    private String route;
    private String color;
}
