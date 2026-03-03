package com.example.GreenDeskWeb.mappers;

import com.example.GreenDeskWeb.dto.ProductDTO;
import com.example.GreenDeskWeb.entites.Product;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface ProductMapper {

    ProductDTO ProductToProductDto(Product entity);
}