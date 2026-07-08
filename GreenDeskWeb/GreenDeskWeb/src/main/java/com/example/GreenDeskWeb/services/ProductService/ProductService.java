package com.example.GreenDeskWeb.services.ProductService;

import com.example.GreenDeskWeb.dto.*;

import java.util.List;

public interface ProductService {
    ProductDTO findProductById(Long id);
    List<ProductDTO> findAllProducts();
    List<ProductDTO> findProductsByCategoryId(Long categoryId);
    ProductDTO createProduct(ProductDTO productDTO);
    ProductDTO updateProduct(Long id, ProductDTO productDTO);  // ← NOUVEAU
    List<CategoryDTO> findAllCategories();
    List<ProductTabDefinitionDTO> findAllTabDefinitions();
    ProductVariantDTO toggleVariant(Long productId, Long variantId);
    void deleteProduct(Long id);
}