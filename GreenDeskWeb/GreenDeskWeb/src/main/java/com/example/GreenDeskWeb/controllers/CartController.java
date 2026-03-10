package com.example.GreenDeskWeb.controllers;


import com.example.GreenDeskWeb.dto.CartDTO;
import com.example.GreenDeskWeb.services.CartService.CartService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/cart")
public class CartController {

    private final CartService cartService;

    @Autowired
    public CartController(CartService cartService) {
        this.cartService = cartService;
    }

    // Récupérer le panier
    @GetMapping("/{sessionId}")
    public ResponseEntity<CartDTO> getCart(@PathVariable String sessionId) {
        return ResponseEntity.ok(cartService.getCart(sessionId));
    }

    // Ajouter un produit
    @PostMapping("/{sessionId}/add")
    public ResponseEntity<CartDTO> addItem(
            @PathVariable String sessionId,
            @RequestParam Long productId,
            @RequestParam(defaultValue = "1") int quantity) {
        return ResponseEntity.ok(cartService.addItem(sessionId, productId, quantity));
    }

    // Modifier la quantité
    @PutMapping("/{sessionId}/item/{itemId}")
    public ResponseEntity<CartDTO> updateItem(
            @PathVariable String sessionId,
            @PathVariable Long itemId,
            @RequestParam int quantity) {
        return ResponseEntity.ok(cartService.updateItem(sessionId, itemId, quantity));
    }

    // Supprimer un article
    @DeleteMapping("/{sessionId}/item/{itemId}")
    public ResponseEntity<CartDTO> removeItem(
            @PathVariable String sessionId,
            @PathVariable Long itemId) {
        return ResponseEntity.ok(cartService.deleteItem(sessionId, itemId));
    }

    // Vider le panier
    @DeleteMapping("/{sessionId}")
    public ResponseEntity<Void> clearCart(@PathVariable String sessionId) {
        cartService.clearCart(sessionId);
        return ResponseEntity.noContent().build();
    }
}