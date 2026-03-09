package com.example.GreenDeskWeb.enums;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonValue;

public enum ProductCategory {

    PLASTIQUE("plastique"),
    ELECTRONIQUE("electronique"),
    TISSUS("tissus"),
    BOX("box");

    private final String value;

    ProductCategory(String value) {
        this.value = value;
    }

    @JsonValue
    public String getValue() {
        return value;
    }

    @JsonCreator
    public static ProductCategory fromValue(String value) {
        for (ProductCategory cat : values()) {
            if (cat.value.equalsIgnoreCase(value)) {
                return cat;
            }
        }
        throw new IllegalArgumentException("Catégorie inconnue: " + value);
    }
}