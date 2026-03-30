package com.example.GreenDeskWeb.services.ProductService;

import com.example.GreenDeskWeb.dto.*;
import com.example.GreenDeskWeb.entites.*;
import com.example.GreenDeskWeb.mappers.ProductMapper;
import com.example.GreenDeskWeb.repositories.*;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
@Transactional
public class ProductServiceImpl implements ProductService {

    private final ProductRepository productRepository;
    private final ProductMapper productMapper;
    private final CategoryRepository categoryRepository;
    private final ProductTabDefinitionRepository productTabDefinitionRepository;

    private final ProductTabContentRepository productTabContentRepository;
    private final ProductAttributeRepository productAttributeRepository;

    private final ProductAttributeValueRepository productAttributeValueRepository;
    private final ProductVariantRepository productVariantRepository;
    private final FileSystemStorageService storage;
    @Autowired
    public ProductServiceImpl(ProductRepository productRepository,
                              ProductMapper productMapper, CategoryRepository categoryRepository, ProductTabDefinitionRepository productTabDefinitionRepository, ProductTabContentRepository productTabContentRepository, ProductAttributeRepository productAttributeRepository, ProductAttributeValueRepository productAttributeValueRepository, ProductVariantRepository productVariantRepository, FileSystemStorageService storage) {
        this.productRepository = productRepository;
        this.productMapper = productMapper;
        this.categoryRepository = categoryRepository;
        this.productTabDefinitionRepository = productTabDefinitionRepository;
        this.productTabContentRepository = productTabContentRepository;
        this.productAttributeRepository = productAttributeRepository;
        this.productAttributeValueRepository = productAttributeValueRepository;
        this.productVariantRepository = productVariantRepository;
        this.storage = storage;
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

        // 1. Récupère la catégorie
        Category category = categoryRepository.findById(productDTO.getCategoryId())
                .orElseThrow(() -> new EntityNotFoundException("Category not found: " + productDTO.getCategoryId()));

        // 2. Crée le produit de base via mapper
        Product product = productMapper.ProductDtoToProduct(productDTO);
        product.setCategory(category);
        product.setTabs(new ArrayList<>());
        product.setAttributes(new ArrayList<>());
        product.setVariants(new ArrayList<>());
        Product saved = productRepository.save(product);

        // 3. Sauvegarde les onglets via mapper
        if (productDTO.getTabs() != null) {
            for (ProductTabContentDTO tabDTO : productDTO.getTabs()) {
                ProductTabContent tabContent = productMapper.ProductTabContentDtoToEntity(tabDTO);
                tabContent.setProduct(saved);

                if (tabDTO.getTabId() != null) {
                    // Onglet depuis tabDefinitions existantes
                    ProductTabDefinition tabDef = productTabDefinitionRepository
                            .findById(tabDTO.getTabId())
                            .orElseThrow(() -> new EntityNotFoundException("Tab not found: " + tabDTO.getTabId()));
                    tabContent.setTab(tabDef);
                } else {
                    // Onglet libre — cherche ou crée la définition
                    String key = tabDTO.getTabLabel().toLowerCase()
                            .replaceAll("[^a-z0-9]", "_");
                    ProductTabDefinition tabDef = productTabDefinitionRepository
                            .findByTabKey(key)
                            .orElseGet(() -> {
                                ProductTabDefinition newDef = new ProductTabDefinition();
                                newDef.setTabKey(key);
                                newDef.setLabel(tabDTO.getTabLabel());
                                return productTabDefinitionRepository.save(newDef);
                            });
                    tabContent.setTab(tabDef);
                }
                productTabContentRepository.save(tabContent);
            }
        }

        // 4. Sauvegarde les attributs et valeurs via mapper
        if (productDTO.getAttributes() != null) {
            for (ProductAttributeDTO attrDTO : productDTO.getAttributes()) {

                // ← mapper
                ProductAttribute attribute = productMapper.ProductAttributeDtoToEntity(attrDTO);
                attribute.setProduct(saved);
                attribute.setValues(new ArrayList<>());
                ProductAttribute savedAttr = productAttributeRepository.save(attribute);

                if (attrDTO.getValues() != null) {
                    for (ProductAttributeValueDTO valueDTO : attrDTO.getValues()) {

                        // ← mapper
                        ProductAttributeValue value = productMapper.ProductAttributeValueDtoToEntity(valueDTO);
                        value.setAttribute(savedAttr);
                        productAttributeValueRepository.save(value);
                        savedAttr.getValues().add(value);
                    }
                }
                saved.getAttributes().add(savedAttr);
            }
        }

        // 5. Génère les variantes automatiquement
        if (!saved.getAttributes().isEmpty()) {
            generateVariants(saved);
        }

        // 6. Recharge le produit complet depuis la BDD et retourne via mapper
        Product fullProduct = productRepository.findById(saved.getId())
                .orElseThrow(() -> new EntityNotFoundException("Product not found after save"));

        return toFullProductDTO(fullProduct);
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
                    dto.setProductCategory(category.getProductCategory());
                    dto.setColor(category.getColor());
                    dto.setCount(category.getProducts() != null ? category.getProducts().size() : 0);

                    return dto;
                })
                .toList();
    }

    // Génération automatique de toutes les combinaisons
    private void generateVariants(Product product) {
        List<List<ProductAttributeValue>> allValues = product.getAttributes()
                .stream()
                .map(ProductAttribute::getValues)
                .collect(Collectors.toList());

        List<List<ProductAttributeValue>> combinations = cartesianProduct(allValues);

        for (List<ProductAttributeValue> combination : combinations) {
            ProductVariant variant = new ProductVariant();
            variant.setProduct(product);
            variant.setValues(combination);
            variant.setActive(true);

            // Calcule le surcoût total
            double extraPrice = combination.stream()
                    .mapToDouble(ProductAttributeValue::getExtraPrice)
                    .sum();
            variant.setExtraPrice(extraPrice);

            productVariantRepository.save(variant);
        }
    }

    // Produit cartésien de toutes les listes de valeurs
    private List<List<ProductAttributeValue>> cartesianProduct(List<List<ProductAttributeValue>> lists) {
        List<List<ProductAttributeValue>> result = new ArrayList<>();
        result.add(new ArrayList<>());

        for (List<ProductAttributeValue> list : lists) {
            List<List<ProductAttributeValue>> newResult = new ArrayList<>();
            for (List<ProductAttributeValue> existing : result) {
                for (ProductAttributeValue value : list) {
                    List<ProductAttributeValue> newCombination = new ArrayList<>(existing);
                    newCombination.add(value);
                    newResult.add(newCombination);
                }
            }
            result = newResult;
        }
        return result;
    }

    @Override
    @Transactional(readOnly = true)
    public List<ProductTabDefinitionDTO> findAllTabDefinitions() {
        return productTabDefinitionRepository.findAll()
                .stream()
                .map(tab -> {
                    ProductTabDefinitionDTO dto = new ProductTabDefinitionDTO();
                    dto.setId(tab.getId());
                    dto.setTabKey(tab.getTabKey());
                    dto.setLabel(tab.getLabel());
                    return dto;
                })
                .toList();
    }

    @Override
    public ProductVariantDTO toggleVariant(Long productId, Long variantId) {
        ProductVariant variant = productVariantRepository.findById(variantId)
                .orElseThrow(() -> new EntityNotFoundException("Variant not found: " + variantId));
        variant.setActive(!variant.isActive());
        ProductVariant saved = productVariantRepository.save(variant);
        return productMapper.ProductVariantToProductVariantDto(saved);
    }

    // Convertit ProductVariant → ProductVariantDTO avec finalPrice et label calculés
    private ProductVariantDTO toVariantDTO(ProductVariant variant, double basePrice) {
        ProductVariantDTO dto = productMapper.ProductVariantToProductVariantDto(variant);
        dto.setFinalPrice(basePrice + variant.getExtraPrice());

        // Génère le label ex: "Rouge - 8GB - Standard"
        String label = variant.getValues().stream()
                .map(ProductAttributeValue::getValue)
                .collect(Collectors.joining(" - "));
        dto.setLabel(label);

        return dto;
    }

    // Convertit Product → ProductDTO complet
    private ProductDTO toFullProductDTO(Product product) {
        ProductDTO dto = productMapper.ProductToProductDto(product);

        // Remplace les variants avec finalPrice et label calculés
        List<ProductVariantDTO> variantDTOs = product.getVariants().stream()
                .map(v -> toVariantDTO(v, product.getPrice()))
                .toList();
        dto.setVariants(variantDTOs);

        return dto;
    }

    @Override
    @Transactional(readOnly = true)
    public ProductDTO findProductById(Long id) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Product not found: " + id));
        return toFullProductDTO(product);
    }

    @Override
    @Transactional(readOnly = true)
    public List<ProductDTO> findAllProducts() {
        return productRepository.findAll()
                .stream()
                .map(this::toFullProductDTO)
                .toList();
    }

    @Override
    public void deleteProduct(Long id){
        Product product=productRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Product not found: " + id));
        // Supprime les fichiers physiques
        deleteProductFiles(product);

        // Supprime le produit (cascade supprime tabs, attributes, variants)
        productRepository.delete(product);
    }

    private void deleteProductFiles(Product product) {
        // Supprime l'image principale
        FileSystemStorageService storage;
        if (product.getImage() != null) {
            this.storage.delete(product.getImage());
        }
        // Supprime la galerie
        if (product.getGallery() != null) {
            product.getGallery().forEach(this.storage::delete);
        }
        // Supprime les réalisations
        if (product.getAchievements() != null) {
            product.getAchievements().forEach(this.storage::delete);
        }
    }
    }
