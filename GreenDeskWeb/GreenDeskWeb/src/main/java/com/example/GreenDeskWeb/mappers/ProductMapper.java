package com.example.GreenDeskWeb.mappers;

import com.example.GreenDeskWeb.dto.*;
import com.example.GreenDeskWeb.entites.*;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;


@Mapper(componentModel = "spring")
public interface ProductMapper {

    @Mapping(target = "category", source = "productCategory")
    @Mapping(target = "categoryId", source = "category.id")
    @Mapping(target = "categoryTitle", source = "category.categoryTitle")
    @Mapping(target = "tabs", source = "tabs")
    @Mapping(target = "attributes", source = "attributes")
    @Mapping(target = "variants", source = "variants")
    ProductDTO ProductToProductDto(Product entity);

    @Mapping(target = "productCategory", source = "category")
    @Mapping(target = "category", ignore = true)
    @Mapping(target = "tabs", ignore = true)
    @Mapping(target = "attributes", ignore = true)
    @Mapping(target = "variants", ignore = true)
    Product ProductDtoToProduct(ProductDTO productDTO);

    // ── ProductTabContentDTO → ProductTabContent ───────────────────────────
    @Mapping(target = "product", ignore = true)  // setté dans le service
    @Mapping(target = "tab", ignore = true)      // setté dans le service
    ProductTabContent ProductTabContentDtoToEntity(ProductTabContentDTO dto);

    // ── ProductAttributeDTO → ProductAttribute ─────────────────────────────
    @Mapping(target = "product", ignore = true)  // setté dans le service
    @Mapping(target = "values", ignore = true)   // géré séparément
    ProductAttribute ProductAttributeDtoToEntity(ProductAttributeDTO dto);

    // ── ProductAttributeValueDTO → ProductAttributeValue ──────────────────
    @Mapping(target = "attribute", ignore = true) // setté dans le service
    ProductAttributeValue ProductAttributeValueDtoToEntity(ProductAttributeValueDTO dto);

    // ── ProductTabContent → ProductTabContentDTO ───────────────────────────
    @Mapping(target = "tabId", source = "tab.id")
    @Mapping(target = "tabKey", source = "tab.tabKey")
    @Mapping(target = "tabLabel", source = "tab.label")
    @Mapping(target = "content", source = "content")
    ProductTabContentDTO ProductTabContentToDto(ProductTabContent entity);

    // ── ProductAttribute → ProductAttributeDTO ─────────────────────────────
    @Mapping(target = "values", source = "values")
    ProductAttributeDTO ProductAttributeToDto(ProductAttribute entity);

    // ── ProductAttributeValue → ProductAttributeValueDTO ──────────────────
    ProductAttributeValueDTO ProductAttributeValueToDto(ProductAttributeValue entity);

    // ── ProductVariant → ProductVariantDTO ─────────────────────────────────
    @Mapping(target = "finalPrice", ignore = true) // calculé dans le service
    @Mapping(target = "label", ignore = true)      // calculé dans le service
    @Mapping(target = "values", source = "values")
    @Mapping(target = "active", source = "active")
    ProductVariantDTO ProductVariantToProductVariantDto(ProductVariant entity);
}


