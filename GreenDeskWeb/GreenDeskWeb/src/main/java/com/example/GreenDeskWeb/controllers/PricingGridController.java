package com.example.GreenDeskWeb.controllers;

import com.example.GreenDeskWeb.dto.PriceCalculationRequestDTO;
import com.example.GreenDeskWeb.dto.PriceCalculationResultDTO;
import com.example.GreenDeskWeb.dto.PricingGridRequestDTO;
import com.example.GreenDeskWeb.dto.PricingGridResponseDTO;
import com.example.GreenDeskWeb.services.PricingGridService.PricingGridService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/products/{productId}/pricing-grid")
@RequiredArgsConstructor
public class PricingGridController {

    private final PricingGridService pricingGridService;

    @PostMapping
    public ResponseEntity<PricingGridResponseDTO> create(
            @PathVariable Long productId,
            @RequestBody  PricingGridRequestDTO request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(pricingGridService.createForProduct(productId, request));
    }

    @PutMapping
    public ResponseEntity<PricingGridResponseDTO> update(
            @PathVariable Long productId,
            @RequestBody PricingGridRequestDTO request) {
        return ResponseEntity.ok(pricingGridService.updateForProduct(productId, request));
    }

    @GetMapping
    public ResponseEntity<PricingGridResponseDTO> get(@PathVariable Long productId) {
        return ResponseEntity.ok(pricingGridService.getByProductId(productId));
    }

    @DeleteMapping
    public ResponseEntity<Void> delete(@PathVariable Long productId) {
        pricingGridService.deleteByProductId(productId);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/calculate")
    public ResponseEntity<PriceCalculationResultDTO> calculate(
            @PathVariable Long productId,
            @RequestBody PriceCalculationRequestDTO request) {
        return ResponseEntity.ok(pricingGridService.calculatePrice(productId, request));
    }
}