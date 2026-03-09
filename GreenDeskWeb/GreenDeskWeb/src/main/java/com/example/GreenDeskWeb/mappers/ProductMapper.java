package com.example.GreenDeskWeb.mappers;

import com.example.GreenDeskWeb.dto.ProductDTO;
import com.example.GreenDeskWeb.entites.Product;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;


@Mapper(componentModel = "spring")
public interface ProductMapper {

    @Mapping(target = "category", source = "productCategory")
    @Mapping(target = "categoryId", source = "category.id")
    @Mapping(target = "categoryTitle", source = "category.categoryTitle")
    ProductDTO ProductToProductDto(Product entity);

    @Mapping(target = "productCategory", source = "category")
    @Mapping(target = "category", ignore = true)
    Product ProductDtoToProduct(ProductDTO productDTO);

}


