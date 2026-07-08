package com.example.GreenDeskWeb.repositories;

import com.example.GreenDeskWeb.entites.PricingGrid;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface PricingGridRepository extends JpaRepository<PricingGrid,Long> {
    boolean existsByProductId(Long productId);
    Optional<PricingGrid> findByProductId(Long productId);

}
