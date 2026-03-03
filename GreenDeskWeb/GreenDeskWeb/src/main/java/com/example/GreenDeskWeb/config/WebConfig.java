package com.example.GreenDeskWeb.config;


import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;


@Configuration
public class WebConfig implements WebMvcConfigurer {

    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {

        registry.addResourceHandler("/products/**")
                .addResourceLocations("file:/home/hamzajomaa/GreenDeskProject/GreenDeskWeb/GreenDeskWeb/uploads/products/");

        registry.addResourceHandler("/achievements/**")
                .addResourceLocations("file:/home/hamzajomaa/GreenDeskProject/GreenDeskWeb/GreenDeskWeb/uploads/achievements/");

        registry.addResourceHandler("/categories/**")
                .addResourceLocations("file:/home/hamzajomaa/GreenDeskProject/GreenDeskWeb/GreenDeskWeb/uploads/categories/");
    }
}


