package com.example.GreenDeskWeb.repositories;


import com.example.GreenDeskWeb.entites.PackagingTemplate;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface PackagingTemplateRepository extends JpaRepository<PackagingTemplate, Long> {

    List<PackagingTemplate> findByProductIdAndActiveTrue(Long productId);

    List<PackagingTemplate> findAllByOrderByProductIdAsc();
}