package com.example.GreenDeskWeb.controllers;

import com.example.GreenDeskWeb.dto.CategoryDTO;
import com.example.GreenDeskWeb.dto.ProductDTO;
import com.example.GreenDeskWeb.dto.ProductTabDefinitionDTO;
import com.example.GreenDeskWeb.dto.ProductVariantDTO;
import com.example.GreenDeskWeb.services.ProductService.ProductService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/products")
public class ProductController {

    private final ProductService productService;

    @Autowired
    public ProductController(ProductService productService) {
        this.productService = productService;
    }

    @GetMapping("/{id}")
    public ResponseEntity<ProductDTO> getProduct(@PathVariable Long id) {
        ProductDTO dto = productService.findProductById(id);
        return ResponseEntity.ok(dto);
    }

    @GetMapping
    public ResponseEntity<List<ProductDTO>> getAllProducts() {
        List<ProductDTO> products = productService.findAllProducts();
        return ResponseEntity.ok(products);
    }

    @GetMapping("/categories")
    public ResponseEntity<List<CategoryDTO>> getAllCategories() {
        return ResponseEntity.ok(productService.findAllCategories());
    }

    @GetMapping("/by-category/{categoryId}")
    public ResponseEntity<List<ProductDTO>> getByCategory(@PathVariable Long categoryId) {
        return ResponseEntity.ok(productService.findProductsByCategoryId(categoryId));
    }


    @PostMapping
    public ResponseEntity<ProductDTO> createProduct(@RequestBody ProductDTO productDTO) {
        return ResponseEntity.ok(productService.createProduct(productDTO));
    }

    @GetMapping("/tab-definitions")
    public ResponseEntity<List<ProductTabDefinitionDTO>> getTabDefinitions() {
        return ResponseEntity.ok(productService.findAllTabDefinitions());
    }

    @PutMapping("/{productId}/variants/{variantId}/toggle")
    public ResponseEntity<ProductVariantDTO> toggleVariant(
            @PathVariable Long productId,
            @PathVariable Long variantId) {
        return ResponseEntity.ok(productService.toggleVariant(productId, variantId));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteProduct(@PathVariable Long id) {
        productService.deleteProduct(id);
        return ResponseEntity.noContent().build();
    }
}