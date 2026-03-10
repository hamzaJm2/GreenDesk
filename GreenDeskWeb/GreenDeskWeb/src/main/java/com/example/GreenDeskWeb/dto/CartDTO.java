// CartDTO.java
package com.example.GreenDeskWeb.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class CartDTO {
    private Long id;
    private String sessionId;
    private List<CartItemDTO> items;
    private double total;
    private int itemCount;
}