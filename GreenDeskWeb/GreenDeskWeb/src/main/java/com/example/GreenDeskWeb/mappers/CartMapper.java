package com.example.GreenDeskWeb.mappers;

import com.example.GreenDeskWeb.dto.CartDTO;
import com.example.GreenDeskWeb.dto.CartItemDTO;
import com.example.GreenDeskWeb.entites.Cart;
import com.example.GreenDeskWeb.entites.CartItem;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface CartMapper {

    @Mapping(target = "itemCount", expression = "java(cart.getItems().stream().mapToInt(CartItem::getQuantity).sum())")
    @Mapping(target = "total", expression = "java(cart.getTotal())")
    CartDTO CartToCartDTO(Cart cart);

    @Mapping(target = "productId", source = "product.id")
    @Mapping(target = "productName", source = "product.name")
    @Mapping(target = "productImage", source = "product.image")
    @Mapping(target = "subtotal", expression = "java(cartItem.getPrice() * cartItem.getQuantity())")
    CartItemDTO CartItemToCartItemDTO(CartItem cartItem);
}