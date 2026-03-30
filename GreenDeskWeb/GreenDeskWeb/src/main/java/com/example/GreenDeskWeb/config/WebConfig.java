package com.example.GreenDeskWeb.config;


import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;


@Configuration
public class WebConfig implements WebMvcConfigurer {

    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        String base = System.getProperty("user.dir") + "/uploads/";

        System.out.println(">>> Serving files from: " + base); // ← log pour vérifier

        registry.addResourceHandler("/products/**")
                .addResourceLocations("file:" + base + "products/");

        registry.addResourceHandler("/achievements/**")
                .addResourceLocations("file:" + base + "achievements/");

        registry.addResourceHandler("/categories/**")
                .addResourceLocations("file:" + base + "categories/");
    }
}
