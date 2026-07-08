package com.example.GreenDeskWeb.entites;

import com.example.GreenDeskWeb.entites.User;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Data
@NoArgsConstructor
@AllArgsConstructor
public class MockupProject {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String nomProjet;
    private String statut = "brouillon";

    @OneToMany(mappedBy = "project", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<MockupLogo> logos = new ArrayList<>();

    private String logoPrincipalId;

    @ElementCollection
    @CollectionTable(name = "mockup_project_products", joinColumns = @JoinColumn(name = "project_id"))
    @Column(name = "product_id")
    private List<Long> produitsSelectionnes = new ArrayList<>();

    @ElementCollection
    @CollectionTable(name = "mockup_project_coloris", joinColumns = @JoinColumn(name = "project_id"))
    @Column(name = "coloris_id")
    private List<Long> colorisSelectionnes = new ArrayList<>();

    @Column(columnDefinition = "TEXT")
    private String brouillonMaquette;

    private LocalDateTime dateMiseAJour = LocalDateTime.now();

    private String clientRef;

    @Column(columnDefinition = "TEXT")
    private String couleurs;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id")
    private User owner;
}