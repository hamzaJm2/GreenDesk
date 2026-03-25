package com.example.GreenDeskWeb.services.ProductService;

import com.example.GreenDeskWeb.dto.CategoryDTO;
import com.example.GreenDeskWeb.dto.ProductDTO;
import com.example.GreenDeskWeb.dto.ProductTabDefinitionDTO;
import com.example.GreenDeskWeb.dto.ProductVariantDTO;

import java.util.List;

public interface ProductService {
    ProductDTO findProductById(Long id);
    List<ProductDTO> findAllProducts();
    List<ProductDTO> findProductsByCategoryId(Long categoryId);
    ProductDTO createProduct(ProductDTO productDTO);

    List<CategoryDTO> findAllCategories();
    List<ProductTabDefinitionDTO> findAllTabDefinitions();
    ProductVariantDTO toggleVariant(Long productId, Long variantId);
    void deleteProduct(Long id);

}
