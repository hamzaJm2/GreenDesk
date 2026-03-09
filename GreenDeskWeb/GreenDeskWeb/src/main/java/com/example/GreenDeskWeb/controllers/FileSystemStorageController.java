package com.example.GreenDeskWeb.controllers;

import com.example.GreenDeskWeb.services.ProductService.FileSystemStorageService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/uploads")
public class FileSystemStorageController {

    private final FileSystemStorageService storage;

    @Autowired
    public FileSystemStorageController(FileSystemStorageService storage) {
        this.storage = storage;
    }

    // Image principale → uploads/products/{productName}/{originalFileName}
    @PostMapping("/product/main-image")
    public ResponseEntity<Map<String, String>> uploadMainImage(
            @RequestParam("file") MultipartFile file,
            @RequestParam("productName") String productName) throws IOException {

        String safeFolderName = productName.replaceAll("[^a-zA-Z0-9\\-_ ]", "_");
        String path = storage.store(file, "products/" + safeFolderName, file.getOriginalFilename());
        return ResponseEntity.ok(Map.of("path", path));
    }

    // Galerie → uploads/products/{productName}/{originalFileName}
    @PostMapping("/product/gallery")
    public ResponseEntity<Map<String, Object>> uploadGallery(
            @RequestParam("files") List<MultipartFile> files,
            @RequestParam("productName") String productName) throws IOException {

        String safeFolderName = productName.replaceAll("[^a-zA-Z0-9\\-_ ]", "_");
        List<String> paths = new ArrayList<>();
        for (MultipartFile f : files) {
            if (f != null && !f.isEmpty()) {
                paths.add(storage.store(f, "products/" + safeFolderName, f.getOriginalFilename()));
            }
        }
        return ResponseEntity.ok(Map.of("paths", paths));
    }

    // Réalisations → uploads/achievements/{productName}/{originalFileName}
    @PostMapping("/product/achievements")
    public ResponseEntity<Map<String, Object>> uploadAchievements(
            @RequestParam("files") List<MultipartFile> files,
            @RequestParam("productName") String productName) throws IOException {

        String safeFolderName = productName.replaceAll("[^a-zA-Z0-9\\-_ ]", "_");
        List<String> paths = new ArrayList<>();
        for (MultipartFile f : files) {
            if (f != null && !f.isEmpty()) {
                paths.add(storage.store(f, "achievements/" + safeFolderName, f.getOriginalFilename()));
            }
        }
        return ResponseEntity.ok(Map.of("paths", paths));
    }
}


