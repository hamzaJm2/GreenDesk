package com.example.GreenDeskWeb.mappers;

import com.example.GreenDeskWeb.dto.ProductTabContentDTO;
import com.example.GreenDeskWeb.entites.ProductTabContent;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface ProductTabContentMapper {

    @Mapping(target = "tabId", source = "tab.id")
    @Mapping(target = "tabKey", source = "tab.tabKey")
    @Mapping(target = "tabLabel", source = "tab.label")
    @Mapping(target = "content", source = "content")
    ProductTabContentDTO toDto(ProductTabContent entity);
}