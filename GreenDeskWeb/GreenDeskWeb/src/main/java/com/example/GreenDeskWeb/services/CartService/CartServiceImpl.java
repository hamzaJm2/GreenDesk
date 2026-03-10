package com.example.GreenDeskWeb.services.CartService;

import com.example.GreenDeskWeb.dto.CartDTO;
import com.example.GreenDeskWeb.entites.Cart;
import com.example.GreenDeskWeb.entites.CartItem;
import com.example.GreenDeskWeb.entites.Product;
import com.example.GreenDeskWeb.mappers.CartMapper;
import com.example.GreenDeskWeb.repositories.CartItemRepository;
import com.example.GreenDeskWeb.repositories.CartRepository;
import com.example.GreenDeskWeb.repositories.ProductRepository;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional
public class CartServiceImpl implements CartService {

    private final CartRepository cartRepository;
    private final CartItemRepository cartItemRepository;
    private final ProductRepository productRepository;
    private final CartMapper cartMapper;  // ← injecte le mapper

    @Autowired
    public CartServiceImpl(CartRepository cartRepository,
                           CartItemRepository cartItemRepository,
                           ProductRepository productRepository,
                           CartMapper cartMapper) {
        this.cartRepository = cartRepository;
        this.cartItemRepository = cartItemRepository;
        this.productRepository = productRepository;
        this.cartMapper = cartMapper;
    }

    private Cart getOrCreateCart(String sessionId) {
        return cartRepository.findBySessionId(sessionId)
                .orElseGet(() -> {
                    Cart newCart = new Cart();
                    newCart.setSessionId(sessionId);
                    return cartRepository.save(newCart);
                });
    }

    @Override
    @Transactional(readOnly = true)
    public CartDTO getCart(String sessionId) {
        Cart cart = getOrCreateCart(sessionId);
        return cartMapper.CartToCartDTO(cart);  // ← mapper
    }

    @Override
    public CartDTO addItem(String sessionId, Long productId, int quantity) {
        Cart cart = getOrCreateCart(sessionId);

        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new EntityNotFoundException("Product not found: " + productId));

        CartItem existingItem = cart.getItems().stream()
                .filter(item -> item.getProduct().getId().equals(productId))
                .findFirst()
                .orElse(null);

        if (existingItem != null) {
            existingItem.setQuantity(existingItem.getQuantity() + quantity);
        } else {
            CartItem newItem = new CartItem();
            newItem.setCart(cart);
            newItem.setProduct(product);
            newItem.setQuantity(quantity);
            newItem.setPrice(product.getPrice());
            cart.getItems().add(newItem);
        }

        Cart saved = cartRepository.save(cart);
        return cartMapper.CartToCartDTO(saved);  // ← mapper
    }

    @Override
    public CartDTO updateItem(String sessionId, Long itemId, int quantity) {
        Cart cart = getOrCreateCart(sessionId);

        CartItem item = cart.getItems().stream()
                .filter(i -> i.getId().equals(itemId))
                .findFirst()
                .orElseThrow(() -> new EntityNotFoundException("Item not found: " + itemId));

        if (quantity <= 0) {
            cart.getItems().remove(item);
            cartItemRepository.delete(item);
        } else {
            item.setQuantity(quantity);
        }

        Cart saved = cartRepository.save(cart);
        return cartMapper.CartToCartDTO(saved);  // ← mapper
    }

    @Override
    public CartDTO deleteItem(String sessionId, Long itemId) {
        Cart cart = getOrCreateCart(sessionId);

        CartItem item = cart.getItems().stream()
                .filter(i -> i.getId().equals(itemId))
                .findFirst()
                .orElseThrow(() -> new EntityNotFoundException("Item not found: " + itemId));

        cart.getItems().remove(item);
        cartItemRepository.delete(item);

        Cart saved = cartRepository.save(cart);
        return cartMapper.CartToCartDTO(saved);  // ← mapper
    }

    @Override
    public void clearCart(String sessionId) {
        Cart cart = getOrCreateCart(sessionId);
        cart.getItems().clear();
        cartRepository.save(cart);
    }
}

