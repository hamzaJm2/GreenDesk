package com.example.GreenDeskWeb.mappers;


import com.example.GreenDeskWeb.dto.PackagingTemplateDtos;
import com.example.GreenDeskWeb.entites.PackagingColorGroup;
import com.example.GreenDeskWeb.entites.PackagingLogoZone;
import com.example.GreenDeskWeb.entites.PackagingTemplate;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

import java.util.List;

@Mapper(componentModel = "spring")
public interface PackagingMapper {

    // productName, svgFlatContent, svgPerspectiveContent sont remplis
    // manuellement dans le service (pas de champ correspondant sur l'entité)
    @Mapping(target = "productName", ignore = true)
    @Mapping(target = "svgFlatContent", ignore = true)
    @Mapping(target = "svgPerspectiveContent", ignore = true)
    PackagingTemplateDtos.PackagingTemplateResponse toResponse(PackagingTemplate template);

    @Mapping(target = "colorGroupCount", expression = "java(template.getColorGroups().size())")
    @Mapping(target = "logoZoneCount", expression = "java(template.getLogoZones().size())")
    PackagingTemplateDtos.PackagingTemplateSummary toSummary(PackagingTemplate template);

    List<PackagingTemplateDtos.PackagingTemplateSummary> toSummaryList(List<PackagingTemplate> templates);

    PackagingTemplateDtos.ColorGroupDto toColorGroupDto(PackagingColorGroup colorGroup);

    List<PackagingTemplateDtos.ColorGroupDto> toColorGroupDtos(List<PackagingColorGroup> colorGroups);

    PackagingTemplateDtos.LogoZoneDto toLogoZoneDto(PackagingLogoZone logoZone);

    List<PackagingTemplateDtos.LogoZoneDto> toLogoZoneDtos(List<PackagingLogoZone> logoZones);
}
