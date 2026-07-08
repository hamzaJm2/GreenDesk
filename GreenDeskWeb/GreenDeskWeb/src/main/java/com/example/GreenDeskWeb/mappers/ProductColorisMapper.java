package com.example.GreenDeskWeb.mappers;

import com.example.GreenDeskWeb.dto.ProductColorisDTO;
import com.example.GreenDeskWeb.entites.ProductColoris;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

import java.util.List;

@Mapper(componentModel = "spring")
public interface ProductColorisMapper {

    ProductColorisDTO toDto(ProductColoris entity);

    @Mapping(target = "product", ignore = true)
    ProductColoris toEntity(ProductColorisDTO dto);

    List<ProductColorisDTO> toDtoList(List<ProductColoris> entities);
}