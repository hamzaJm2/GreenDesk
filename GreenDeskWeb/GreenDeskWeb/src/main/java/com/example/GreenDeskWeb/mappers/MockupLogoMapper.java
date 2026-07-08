package com.example.GreenDeskWeb.mappers;

import com.example.GreenDeskWeb.dto.MockupLogoDTO;
import com.example.GreenDeskWeb.entites.MockupLogo;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

import java.util.List;

@Mapper(componentModel = "spring")
public interface MockupLogoMapper {

    MockupLogoDTO toDto(MockupLogo entity);

    @Mapping(target = "project", ignore = true)
    MockupLogo toEntity(MockupLogoDTO dto);

    List<MockupLogoDTO> toDtoList(List<MockupLogo> entities);
}