package com.example.GreenDeskWeb.entites;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.ArrayList;
import java.util.List;

@Entity
@Data
@NoArgsConstructor
@AllArgsConstructor
public class IconRule {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String label;
    private String iconId;

    @ElementCollection
    @CollectionTable(name = "icon_rule_keywords", joinColumns = @JoinColumn(name = "rule_id"))
    @Column(name = "keyword")
    private List<String> keywords = new ArrayList<>();
}