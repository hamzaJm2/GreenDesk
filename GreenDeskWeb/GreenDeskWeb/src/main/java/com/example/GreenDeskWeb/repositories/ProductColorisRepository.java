package com.example.GreenDeskWeb.repositories;

import com.example.GreenDeskWeb.entites.ProductColoris;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ProductColorisRepository extends JpaRepository<ProductColoris, Long> {
    List<ProductColoris> findByProductIdOrderByDisplayOrderAsc(Long productId);
    List<ProductColoris> findByProductIdAndActifTrue(Long productId);
    void deleteByProductId(Long productId);
}
