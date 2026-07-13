package com.example.GreenDeskWeb.entites;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "packaging_template")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PackagingTemplate {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "product_id", nullable = false)
    private Long productId;

    @Column(nullable = false)
    private String name;

    /** Chemin relatif du SVG à plat, ex: "uploads/packaging/svg/flexy_boite_1720871234.svg" */
    @Column(name = "svg_flat_path", nullable = false)
    private String svgFlatPath;

    /** Chemin relatif du SVG 2D/perspective (optionnel) */
    @Column(name = "svg_perspective_path")
    private String svgPerspectivePath;

    @Column(name = "viewbox_width")
    private Double viewBoxWidth;

    @Column(name = "viewbox_height")
    private Double viewBoxHeight;

    @Column(nullable = false)
    @Builder.Default
    private boolean active = true;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @OneToMany(mappedBy = "packagingTemplate", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<PackagingColorGroup> colorGroups = new ArrayList<>();

    @OneToMany(mappedBy = "packagingTemplate", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<PackagingLogoZone> logoZones = new ArrayList<>();

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}
