package com.example.GreenDeskWeb.mappers;

import com.example.GreenDeskWeb.dto.ProductDTO;
import com.example.GreenDeskWeb.entites.Product;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface ProductMapper {
    @Mapping(target = "categoryId", source = "category.id")
    @Mapping(target = "categoryTitle", source = "category.title")
    ProductDTO toDto(Product entity);
}