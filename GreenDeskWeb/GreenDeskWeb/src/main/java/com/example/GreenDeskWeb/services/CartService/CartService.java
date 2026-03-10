package com.example.GreenDeskWeb.services.CartService;

import com.example.GreenDeskWeb.dto.CartDTO;

public interface CartService {
    CartDTO getCart(String sessionId);
    CartDTO addItem(String sessionId, Long productId, int quantity);
    CartDTO updateItem(String sessionId, Long itemId, int quantity);
    CartDTO deleteItem(String sessionId, Long itemId);
    void clearCart(String sessionId);
}
