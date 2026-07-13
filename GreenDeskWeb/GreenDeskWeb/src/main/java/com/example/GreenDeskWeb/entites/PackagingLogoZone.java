package com.example.GreenDeskWeb.entites;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "packaging_logo_zone")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PackagingLogoZone {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "packaging_template_id", nullable = false)
    private PackagingTemplate packagingTemplate;

    @Column(name = "svg_group_id", nullable = false)
    private String svgGroupId;

    @Column(nullable = false)
    private String label;

    @Column(name = "display_order")
    private Integer displayOrder;
}