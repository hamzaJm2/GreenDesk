package com.example.GreenDeskWeb.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

public class PackagingTemplateDtos {

    /** Réponse complète pour l'écran de config + le wizard. */
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class PackagingTemplateResponse {
        private Long id;
        private Long productId;
        private String productName;
        private String name;

        /** Chemins sur disque, utiles pour l'admin (ex: input file "remplacer") */
        private String svgFlatPath;
        private String svgPerspectivePath;

        /** Contenu texte brut, lu depuis le disque à la volée, pour le rendu
         *  inline dans le DOM (recoloration + logo en direct côté wizard). */
        private String svgFlatContent;
        private String svgPerspectiveContent;

        private Double viewBoxWidth;
        private Double viewBoxHeight;
        private boolean active;
        private List<ColorGroupDto> colorGroups;
        private List<LogoZoneDto> logoZones;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class PackagingTemplateSummary {
        private Long id;
        private Long productId;
        private String name;
        private int colorGroupCount;
        private int logoZoneCount;
        private boolean active;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ColorGroupDto {
        private Long id;
        private String svgGroupId;
        private String label;
        private String defaultColorHex;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class LogoZoneDto {
        private Long id;
        private String svgGroupId;
        private String label;
    }

    @Data
    public static class SaveLabelsRequest {
        private List<LabelEntry> colorGroupLabels;
        private List<LabelEntry> logoZoneLabels;

        @Data
        public static class LabelEntry {
            private Long id;
            private String label;
        }
    }
}
