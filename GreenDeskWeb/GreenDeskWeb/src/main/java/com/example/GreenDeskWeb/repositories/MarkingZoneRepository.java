package com.example.GreenDeskWeb.repositories;

import com.example.GreenDeskWeb.entites.MarkingZone;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface MarkingZoneRepository extends JpaRepository<MarkingZone, Long> {
    List<MarkingZone> findByProductIdOrderByDisplayOrderAsc(Long productId);
    void deleteByProductId(Long productId);
}