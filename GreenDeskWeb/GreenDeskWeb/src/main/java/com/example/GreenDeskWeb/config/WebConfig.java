package com.example.GreenDeskWeb.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.http.MediaType;
import org.springframework.web.servlet.config.annotation.ContentNegotiationConfigurer;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class WebConfig implements WebMvcConfigurer {

    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/**")
                .allowedOrigins("http://localhost:4200")
                .allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS")
                .allowedHeaders("*")
                .allowCredentials(true);
    }

    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        String base = System.getProperty("user.dir") + "/uploads/";

        registry.addResourceHandler("/media/**")
                .addResourceLocations("file:" + base)
                .setCacheControl(org.springframework.http.CacheControl.noCache())
                .resourceChain(true)
                .addResolver(new org.springframework.web.servlet.resource.PathResourceResolver());

        registry.addResourceHandler("/products/*/coloris/**")
                .addResourceLocations("file:" + base + "products/")
                .setCacheControl(org.springframework.http.CacheControl.noCache())
                .resourceChain(true)
                .addResolver(new org.springframework.web.servlet.resource.PathResourceResolver());

        registry.addResourceHandler("/products/*/masques/**")
                .addResourceLocations("file:" + base + "products/")
                .setCacheControl(org.springframework.http.CacheControl.noCache())
                .resourceChain(true)
                .addResolver(new org.springframework.web.servlet.resource.PathResourceResolver());

        registry.addResourceHandler("/products/**")
                .addResourceLocations("file:" + base + "products/")
                .setCacheControl(org.springframework.http.CacheControl.noCache())
                .resourceChain(true)  // ← true au lieu de false
                .addResolver(new org.springframework.web.servlet.resource.PathResourceResolver());

        registry.addResourceHandler("/mockups/**")
                .addResourceLocations("file:" + base + "mockups/")
                .setCacheControl(org.springframework.http.CacheControl.noCache())
                .resourceChain(false)
                .addResolver(new org.springframework.web.servlet.resource.PathResourceResolver());





        registry.addResourceHandler("/uploads/videos/**")
                .addResourceLocations("file:" + base + "videos/");

        registry.addResourceHandler("/videos/**")
                .addResourceLocations("file:" + base + "videos/");

        registry.addResourceHandler("/achievements/**")
                .addResourceLocations("file:" + base + "achievements/");

        registry.addResourceHandler("/categories/**")
                .addResourceLocations("file:" + base + "categories/");

    }

    @Override
    public void configureContentNegotiation(ContentNegotiationConfigurer configurer) {
        configurer.mediaType("webm", MediaType.parseMediaType("video/webm"));
        configurer.mediaType("mp4",  MediaType.parseMediaType("video/mp4"));
        configurer.mediaType("ogg",  MediaType.parseMediaType("video/ogg"));
    }
}