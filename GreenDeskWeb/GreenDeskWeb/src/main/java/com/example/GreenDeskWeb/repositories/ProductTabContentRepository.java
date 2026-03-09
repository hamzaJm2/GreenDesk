package com.example.GreenDeskWeb.repositories;

import com.example.GreenDeskWeb.entites.ProductTabContent;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ProductTabContentRepository extends JpaRepository<ProductTabContent, Long> {
    List<ProductTabContent> findByProductId(Long productId);
}
