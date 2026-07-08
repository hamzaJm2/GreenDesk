package com.example.GreenDeskWeb.repositories;

import com.example.GreenDeskWeb.entites.IconRule;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface IconRuleRepository extends JpaRepository<IconRule, Long> {
    List<IconRule> findAll();
}