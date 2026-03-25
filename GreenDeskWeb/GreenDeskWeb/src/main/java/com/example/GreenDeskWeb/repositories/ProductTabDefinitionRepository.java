package com.example.GreenDeskWeb.repositories;

import com.example.GreenDeskWeb.entites.ProductTabDefinition;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface ProductTabDefinitionRepository extends JpaRepository<ProductTabDefinition,Long> {
    Optional<ProductTabDefinition> findByTabKey(String tabKey);
}
