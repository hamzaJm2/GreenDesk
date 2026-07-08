package com.example.GreenDeskWeb.mappers;

import com.example.GreenDeskWeb.dto.MockupProjectDTO;
import com.example.GreenDeskWeb.dto.MockupProjectRequestDTO;
import com.example.GreenDeskWeb.entites.MockupProject;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

import java.util.List;

@Mapper(componentModel = "spring", uses = {MockupLogoMapper.class})
public interface MockupProjectMapper {

    @Mapping(target = "logos", source = "logos")
    @Mapping(target = "ownerEmail", source = "owner.email")
    @Mapping(target = "ownerNom", source = "owner.nom")
    @Mapping(target = "ownerPrenom", source = "owner.prenom")
    MockupProjectDTO toDto(MockupProject entity);

    @Mapping(target = "logos", ignore = true)
    @Mapping(target = "dateMiseAJour", ignore = true)
    MockupProject toEntity(MockupProjectRequestDTO dto);

    List<MockupProjectDTO> toDtoList(List<MockupProject> entities);
}