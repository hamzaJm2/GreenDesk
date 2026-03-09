package com.example.GreenDeskWeb.services.ProductService;

import com.example.GreenDeskWeb.dto.CategoryDTO;
import com.example.GreenDeskWeb.entites.Category;
import com.example.GreenDeskWeb.mappers.ProductMapper;
import com.example.GreenDeskWeb.dto.ProductDTO;
import com.example.GreenDeskWeb.entites.Product;
import com.example.GreenDeskWeb.repositories.CategoryRepository;
import com.example.GreenDeskWeb.repositories.ProductRepository;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@Transactional
public class ProductServiceImpl implements ProductService {

    private final ProductRepository productRepository;
    private final ProductMapper productMapper;
    private final CategoryRepository categoryRepository;

    @Autowired
    public ProductServiceImpl(ProductRepository productRepository,
                              ProductMapper productMapper, CategoryRepository categoryRepository) {
        this.productRepository = productRepository;
        this.productMapper = productMapper;
        this.categoryRepository = categoryRepository;
    }

    @Override
    @Transactional(readOnly = true)
    public ProductDTO findProductById(Long id) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Product not found: " + id));

        return productMapper.ProductToProductDto(product);
    }

    @Override
    @Transactional(readOnly = true)
    public List<ProductDTO> findAllProducts() {
        return productRepository.findAll()
                .stream()
                .map(productMapper::ProductToProductDto)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public List<ProductDTO> findProductsByCategoryId(Long categoryId) {
        Category category = categoryRepository.findById(categoryId)
                .orElseThrow(() -> new EntityNotFoundException("Category not found: " + categoryId));
        return productRepository.findByCategory(category)
                .stream()
                .map(productMapper::ProductToProductDto)
                .toList();
    }


    @Override
    public ProductDTO createProduct(ProductDTO productDTO) {

        Category category = categoryRepository.findById(productDTO.getCategoryId())
                .orElseThrow(() ->
                        new EntityNotFoundException("Category not found: " + productDTO.getCategoryId())
                );

        Product product = productMapper.ProductDtoToProduct(productDTO);
        product.setCategory(category);
        Product saved = productRepository.save(product);
        return productMapper.ProductToProductDto(saved);
    }


    @Override
    @Transactional(readOnly = true)
    public List<CategoryDTO> findAllCategories() {
        return categoryRepository.findAll()
                .stream()
                .map(category -> {
                    CategoryDTO dto = new CategoryDTO();
                    dto.setId(category.getId());
                    dto.setTitle(category.getCategoryTitle());
                    dto.setDescription(category.getDescription());
                    dto.setImage(category.getImage());
                    dto.setRoute(category.getRoute());
                    dto.setColor(category.getColor());
                    dto.setCount(category.getProducts() != null ? category.getProducts().size() : 0);

                    return dto;
                })
                .toList();
    }

}