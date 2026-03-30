package com.example.GreenDeskWeb.dto;


import com.example.GreenDeskWeb.enums.ProductCategory;
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
    private ProductCategory productCategory;
    private String color;
    private  int count;
}
