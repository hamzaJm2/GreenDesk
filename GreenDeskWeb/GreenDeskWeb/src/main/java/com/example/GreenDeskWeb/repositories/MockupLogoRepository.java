package com.example.GreenDeskWeb.repositories;

import com.example.GreenDeskWeb.entites.MockupLogo;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface MockupLogoRepository extends JpaRepository<MockupLogo, Long> {
    List<MockupLogo> findByProjectIdOrderByDateImportAsc(Long projectId);
    void deleteByProjectId(Long projectId);
}