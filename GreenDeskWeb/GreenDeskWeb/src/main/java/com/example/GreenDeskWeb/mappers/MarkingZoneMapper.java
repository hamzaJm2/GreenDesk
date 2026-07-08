package com.example.GreenDeskWeb.mappers;

import com.example.GreenDeskWeb.dto.MarkingZoneDTO;
import com.example.GreenDeskWeb.entites.MarkingZone;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

import java.util.List;

@Mapper(componentModel = "spring")
public interface MarkingZoneMapper {

    @Mapping(target = "id", source = "id")
    MarkingZoneDTO toDto(MarkingZone entity);

    @Mapping(target = "product", ignore = true)
    MarkingZone toEntity(MarkingZoneDTO dto);

    List<MarkingZoneDTO> toDtoList(List<MarkingZone> entities);
}