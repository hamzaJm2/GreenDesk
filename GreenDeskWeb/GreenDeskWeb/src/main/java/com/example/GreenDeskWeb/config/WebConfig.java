package com.example.GreenDeskWeb.config;


import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;


@Configuration
public class WebConfig implements WebMvcConfigurer {

    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {

        registry.addResourceHandler("/products/**")
                .addResourceLocations("file:/C:/Users/yasmi/OneDrive/Bureau/Green Desk Project/GreenDesk/GreenDeskWeb/GreenDeskWeb/uploads/products/");

        registry.addResourceHandler("/achievements/**")
                .addResourceLocations("file:/C:/Users/yasmi/OneDrive/Bureau/Green Desk Project/GreenDesk/GreenDeskWeb/GreenDeskWeb/uploads/achievements/");

        registry.addResourceHandler("/categories/**")
                .addResourceLocations("file:/C:/Users/yasmi/OneDrive/Bureau/Green Desk Project/GreenDesk/GreenDeskWeb/GreenDeskWeb/uploads/categories/");

        registry
                .addResourceHandler("/uploads/**")
                .addResourceLocations("file:uploads/");

    }
}
