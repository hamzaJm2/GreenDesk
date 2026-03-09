package com.example.GreenDeskWeb.services.ProductTabContentService;

import com.example.GreenDeskWeb.dto.ProductTabContentDTO;
import com.example.GreenDeskWeb.mappers.ProductTabContentMapper;
import com.example.GreenDeskWeb.repositories.ProductTabContentRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class ProductTabContentServiceImpl implements ProductTabContentService {

    private final ProductTabContentRepository repo;
    private final ProductTabContentMapper mapper;

    @Override
    public List<ProductTabContentDTO> getTabsForProduct(Long productId) {
        return repo.findByProductId(productId)
                .stream()
                .map(mapper::toDto)
                .toList();
    }
}