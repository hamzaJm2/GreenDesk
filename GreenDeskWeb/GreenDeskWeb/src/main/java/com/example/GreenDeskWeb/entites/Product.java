package com.example.GreenDeskWeb.entites;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.ArrayList;
import java.util.List;

@Entity
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Product {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String name;
    private double price;
    private double deliveryPrice;
    private String image;
    private String description;

    @ElementCollection
    @CollectionTable(name = "product_gallery", joinColumns = @JoinColumn(name = "product_id"))
    @Column(name = "image_path")
    private List<String> gallery = new ArrayList<>();

    @ElementCollection
    @CollectionTable(name = "product_achievements", joinColumns = @JoinColumn(name = "product_id"))
    @Column(name = "achievement_image")
    private List<String> achievements = new ArrayList<>();

    @ManyToOne
    @JoinColumn(name = "category_id")
    private Category category;

    private boolean isNew;

    // getters & setters
}