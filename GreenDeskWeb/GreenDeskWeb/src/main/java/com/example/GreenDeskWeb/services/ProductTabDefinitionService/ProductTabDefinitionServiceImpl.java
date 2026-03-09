package com.example.GreenDeskWeb.services.ProductTabDefinitionService;

import com.example.GreenDeskWeb.entites.ProductTabDefinition;
import com.example.GreenDeskWeb.repositories.ProductTabDefinitionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class ProductTabDefinitionServiceImpl implements ProductTabDefinitionService {

    private final ProductTabDefinitionRepository repo;

    @Override
    public List<ProductTabDefinition> getAllDefinitions() {
        return repo.findAll();
    }
}