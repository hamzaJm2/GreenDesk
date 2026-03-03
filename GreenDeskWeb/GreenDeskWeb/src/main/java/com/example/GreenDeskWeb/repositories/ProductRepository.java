package com.example.GreenDeskWeb.repositories;

import com.example.GreenDeskWeb.entites.Category;
import com.example.GreenDeskWeb.entites.Product;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ProductRepository extends JpaRepository<Product,Long> {

    List<Product> findByCategory(Category category);

}
