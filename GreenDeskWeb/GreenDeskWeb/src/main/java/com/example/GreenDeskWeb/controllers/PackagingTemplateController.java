package com.example.GreenDeskWeb.controllers;

import com.example.GreenDeskWeb.dto.PackagingTemplateDtos;
import com.example.GreenDeskWeb.services.PackagingTemplateService.IPackagingTemplateService;
import com.example.GreenDeskWeb.services.PackagingTemplateService.PackagingTemplateService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.util.List;
@RestController
@RequestMapping("/api/admin/packaging-templates")
@RequiredArgsConstructor
public class PackagingTemplateController {

    private final IPackagingTemplateService service;

    @PostMapping(consumes = "multipart/form-data")
    public ResponseEntity<PackagingTemplateDtos.PackagingTemplateResponse> create(
            @RequestParam("productId") Long productId,
            @RequestParam("name") String name,
            @RequestPart("svgFlat") MultipartFile svgFlat,
            @RequestPart(value = "svgPerspective", required = false) MultipartFile svgPerspective
    ) throws IOException {
        return ResponseEntity.ok(service.create(productId, name, svgFlat, svgPerspective));
    }

    @GetMapping
    public ResponseEntity<List<PackagingTemplateDtos.PackagingTemplateSummary>> listAll() {
        return ResponseEntity.ok(service.listAll());
    }

    @GetMapping("/{id}")
    public ResponseEntity<PackagingTemplateDtos.PackagingTemplateResponse> getById(@PathVariable Long id) throws IOException {
        return ResponseEntity.ok(service.getById(id));
    }

    @PutMapping("/{id}/labels")
    public ResponseEntity<Void> saveLabels(@PathVariable Long id, @RequestBody PackagingTemplateDtos.SaveLabelsRequest request) {
        service.saveLabels(id, request);
        return ResponseEntity.ok().build();
    }

    @PutMapping(value = "/{id}/svg", consumes = "multipart/form-data")
    public ResponseEntity<PackagingTemplateDtos.PackagingTemplateResponse> replaceSvg(
            @PathVariable Long id,
            @RequestPart("svgFlat") MultipartFile svgFlat,
            @RequestPart(value = "svgPerspective", required = false) MultipartFile svgPerspective
    ) throws IOException {
        return ResponseEntity.ok(service.replaceSvg(id, svgFlat, svgPerspective));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) throws IOException {
        service.delete(id);
        return ResponseEntity.noContent().build();
    }
}