package com.example.GreenDeskWeb.repositories;

import com.example.GreenDeskWeb.entites.MockupProject;
import com.example.GreenDeskWeb.entites.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface MockupProjectRepository extends JpaRepository<MockupProject, Long> {
    List<MockupProject> findAllByOrderByDateMiseAJourDesc();
    List<MockupProject> findByOwnerOrderByDateMiseAJourDesc(User owner);
    List<MockupProject> findByStatut(String statut);
    List<MockupProject> findByClientRef(String clientRef);
    Optional<MockupProject> findFirstByOrderByDateMiseAJourDesc();
}