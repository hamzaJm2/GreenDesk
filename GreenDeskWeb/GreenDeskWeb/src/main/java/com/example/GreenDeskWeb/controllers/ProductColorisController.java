package com.example.GreenDeskWeb.controllers;

import com.example.GreenDeskWeb.dto.ProductColorisDTO;
import com.example.GreenDeskWeb.services.ProductColorisService.ProductColorisService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/products/{productId}/coloris")
@RequiredArgsConstructor
public class ProductColorisController {

    private final ProductColorisService productColorisService;

    @GetMapping
    public ResponseEntity<List<ProductColorisDTO>> getAll(@PathVariable Long productId) {
        return ResponseEntity.ok(productColorisService.getByProductId(productId));
    }

    @GetMapping("/active")
    public ResponseEntity<List<ProductColorisDTO>> getActive(@PathVariable Long productId) {
        return ResponseEntity.ok(productColorisService.getActiveByProductId(productId));
    }

    @PostMapping
    public ResponseEntity<ProductColorisDTO> create(
            @PathVariable Long productId,
            @RequestBody ProductColorisDTO dto) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(productColorisService.create(productId, dto));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ProductColorisDTO> update(
            @PathVariable Long productId,
            @PathVariable Long id,
            @RequestBody ProductColorisDTO dto) {
        return ResponseEntity.ok(productColorisService.update(id, dto));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(
            @PathVariable Long productId,
            @PathVariable Long id) {
        productColorisService.delete(id);
        return ResponseEntity.noContent().build();
    }
}