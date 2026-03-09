package com.example.GreenDeskWeb.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class ProductTabContentDTO {
    private Long tabId;
    private String tabKey;
    private String tabLabel;
    private String content;
}