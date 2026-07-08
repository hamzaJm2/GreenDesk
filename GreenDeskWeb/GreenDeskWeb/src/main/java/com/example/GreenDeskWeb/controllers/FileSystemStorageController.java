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
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/uploads")
public class FileSystemStorageController {

    private final FileSystemStorageService storage;
    private final FileSystemStorageService fileSystemStorageService;

    @Autowired
    public FileSystemStorageController(FileSystemStorageService storage, FileSystemStorageService fileSystemStorageService) {
        this.storage = storage;
        this.fileSystemStorageService = fileSystemStorageService;
    }

    // Image principale → uploads/products/{productName}/{originalFileName}
    @PostMapping("/product/main-image")
    public ResponseEntity<Map<String, String>> uploadMainImage(
            @RequestParam("file") MultipartFile file,
            @RequestParam("productName") String productName) throws IOException {

        String safeFolderName = productName.trim().replaceAll("[^a-zA-Z0-9\\-_ ]", "_");
        String path = storage.store(file, "products/" + safeFolderName, file.getOriginalFilename());
        return ResponseEntity.ok(Map.of("path", path));
    }

    // Galerie → uploads/products/{productName}/{originalFileName}
    @PostMapping("/product/gallery")
    public ResponseEntity<Map<String, Object>> uploadGallery(
            @RequestParam("files") List<MultipartFile> files,
            @RequestParam("productName") String productName) throws IOException {

        String safeFolderName = productName.trim().replaceAll("[^a-zA-Z0-9\\-_ ]", "_");
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

        String safeFolderName = productName.trim().replaceAll("[^a-zA-Z0-9\\-_ ]", "_");
        List<String> paths = new ArrayList<>();
        for (MultipartFile f : files) {
            if (f != null && !f.isEmpty()) {
                paths.add(storage.store(f, "achievements/" + safeFolderName, f.getOriginalFilename()));
            }
        }
        return ResponseEntity.ok(Map.of("paths", paths));
    }

    @PostMapping("/video")
    public ResponseEntity<Map<String, String>> uploadVideo(
            @RequestParam("video") MultipartFile video,
            @RequestParam("productName") String productName) {

        try {
            String videoPath = fileSystemStorageService.uploadVideo(video, productName);
            Map<String, String> response = new HashMap<>();
            response.put("path", videoPath);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    // Image coloris → uploads/products/{productName}/coloris/{originalFileName}
    @PostMapping("/product/coloris")
    public ResponseEntity<Map<String, String>> uploadColorisImage(
            @RequestParam("file") MultipartFile file,
            @RequestParam("productName") String productName) throws IOException {
        String safeFolderName = productName.trim().replaceAll("[^a-zA-Z0-9\\-_ ]", "_");
        String path = storage.store(file, "products/" + safeFolderName + "/coloris", file.getOriginalFilename());
        return ResponseEntity.ok(Map.of("path", "media/" + path));
    }

    // Masque de couleur → uploads/products/{productName}/coloris/{originalFileName}
    @PostMapping("/product/coloris-mask")
    public ResponseEntity<Map<String, String>> uploadColorisMask(
            @RequestParam("file") MultipartFile file,
            @RequestParam("productName") String productName) throws IOException {
        String safeFolderName = productName.trim().replaceAll("[^a-zA-Z0-9\\-_ ]", "_");
        String path = storage.store(file, "products/" + safeFolderName + "/coloris", file.getOriginalFilename());
        return ResponseEntity.ok(Map.of("path", "media/" + path));
    }

    @PostMapping("/product/masque")
    public ResponseEntity<Map<String, String>> uploadMasque(
            @RequestParam("file") MultipartFile file,
            @RequestParam("productName") String productName) throws IOException {
        String safeFolderName = productName.trim().replaceAll("[^a-zA-Z0-9\\-_ ]", "_");
        String path = storage.store(file, "products/" + safeFolderName + "/masques", file.getOriginalFilename());
        return ResponseEntity.ok(Map.of("path", "media/" + path));
    }
}


