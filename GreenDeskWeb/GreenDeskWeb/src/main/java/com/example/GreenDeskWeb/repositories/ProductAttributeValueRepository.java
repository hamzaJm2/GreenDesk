package com.example.GreenDeskWeb.repositories;

import com.example.GreenDeskWeb.entites.ProductAttributeValue;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ProductAttributeValueRepository extends JpaRepository<ProductAttributeValue,Long> {
}
