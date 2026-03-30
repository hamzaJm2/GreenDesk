package com.example.GreenDeskWeb.entites;

import com.example.GreenDeskWeb.enums.ProductCategory;
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

    private String image;
    private String longDescription ;
    private String shortDescription;

    @ElementCollection
    @CollectionTable(name = "product_strengths", joinColumns = @JoinColumn(name = "product_id"))
    @Column(name = "strength_text")
    private List<String> strengths = new ArrayList<>();

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
    @Enumerated(EnumType.STRING)
    private ProductCategory productCategory;

    private boolean isNew;

    @OneToMany(mappedBy = "product", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<ProductTabContent> tabs = new ArrayList<>();

    @OneToMany(mappedBy = "product", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<ProductAttribute> attributes = new ArrayList<>();

    @OneToMany(mappedBy = "product", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<ProductVariant> variants = new ArrayList<>();
}