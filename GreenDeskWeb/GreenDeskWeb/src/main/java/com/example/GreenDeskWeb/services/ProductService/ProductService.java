package com.example.GreenDeskWeb.services.ProductService;

import com.example.GreenDeskWeb.dto.CategoryDTO;
import com.example.GreenDeskWeb.dto.ProductDTO;

import java.util.List;

public interface ProductService {
    ProductDTO findProductById(Long id);
    List<ProductDTO> findAllProducts();
    List<ProductDTO> findProductsByCategoryId(Long categoryId);
    ProductDTO createProduct(ProductDTO productDTO);

    List<CategoryDTO> findAllCategories();

}
