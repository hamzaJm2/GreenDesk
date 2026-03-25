package com.example.GreenDeskWeb.repositories;

import com.example.GreenDeskWeb.entites.Product;
import com.example.GreenDeskWeb.entites.ProductVariant;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ProductVariantRepository extends JpaRepository<ProductVariant, Long> {
    List<ProductVariant> findByProduct(Product product);
}

