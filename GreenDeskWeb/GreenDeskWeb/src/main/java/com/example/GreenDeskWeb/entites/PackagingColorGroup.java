package com.example.GreenDeskWeb.entites;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "packaging_color_group")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PackagingColorGroup {

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

    @Column(name = "default_color_hex")
    private String defaultColorHex;

    @Column(name = "display_order")
    private Integer displayOrder;
}