package com.example.GreenDeskWeb.controllers;

import com.example.GreenDeskWeb.dto.PackagingTemplateDtos;
import com.example.GreenDeskWeb.services.PackagingTemplateService.IPackagingTemplateService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.io.IOException;
import java.util.List;

@RestController
@RequestMapping("/api/packaging-templates")
@RequiredArgsConstructor
public class PackagingController {

    private final IPackagingTemplateService service;

    @GetMapping
    public ResponseEntity<List<PackagingTemplateDtos.PackagingTemplateSummary>> listForProduct(@RequestParam Long productId) {
        return ResponseEntity.ok(service.listForProduct(productId));
    }

    @GetMapping("/{id}")
    public ResponseEntity<PackagingTemplateDtos.PackagingTemplateResponse> getById(@PathVariable Long id) throws IOException {
        return ResponseEntity.ok(service.getById(id));
    }
}