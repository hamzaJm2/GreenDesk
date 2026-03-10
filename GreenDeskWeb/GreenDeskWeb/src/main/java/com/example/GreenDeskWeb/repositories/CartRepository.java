package com.example.GreenDeskWeb.repositories;

import com.example.GreenDeskWeb.entites.Cart;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface CartRepository extends JpaRepository<Cart,Long> {
    Optional<Cart> findBySessionId(String sessionId);

}
