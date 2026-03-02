package com.example.GreenDeskWeb.dto;


import lombok.Data;

@Data
public class CategoryDTO {
    private Long id;
    private String title;
    private String description;
    private String image;
    private String route;
    private String color;
}
