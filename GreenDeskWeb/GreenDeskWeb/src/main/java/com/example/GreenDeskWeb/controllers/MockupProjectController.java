package com.example.GreenDeskWeb.controllers;

import com.example.GreenDeskWeb.dto.MockupProjectDTO;
import com.example.GreenDeskWeb.dto.MockupProjectRequestDTO;
import com.example.GreenDeskWeb.services.MockupProjectService.MockupProjectService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/mockup-projects")
@RequiredArgsConstructor
public class MockupProjectController {

    private final MockupProjectService mockupProjectService;

    @GetMapping
    public ResponseEntity<List<MockupProjectDTO>> getAll() {
        return ResponseEntity.ok(mockupProjectService.getAll());
    }

    @GetMapping("/current")
    public ResponseEntity<MockupProjectDTO> getCurrent() {
        return ResponseEntity.ok(mockupProjectService.getCurrent());
    }

    @GetMapping("/{id}")
    public ResponseEntity<MockupProjectDTO> getById(@PathVariable Long id) {
        return ResponseEntity.ok(mockupProjectService.getById(id));
    }

    @PostMapping
    public ResponseEntity<MockupProjectDTO> create(@RequestBody MockupProjectRequestDTO dto) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(mockupProjectService.create(dto));
    }

    @PutMapping("/{id}")
    public ResponseEntity<MockupProjectDTO> update(
            @PathVariable Long id,
            @RequestBody MockupProjectRequestDTO dto) {
        return ResponseEntity.ok(mockupProjectService.update(id, dto));
    }

    @PutMapping("/{id}/draft")
    public ResponseEntity<MockupProjectDTO> saveDraft(
            @PathVariable Long id,
            @RequestBody Map<String, String> body) {
        return ResponseEntity.ok(mockupProjectService.saveDraft(
                id,
                body.get("brouillonMaquette"),
                body.get("nomProjet")
        ));
    }

    @PostMapping("/{id}/duplicate")
    public ResponseEntity<MockupProjectDTO> duplicate(@PathVariable Long id) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(mockupProjectService.duplicate(id));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        mockupProjectService.delete(id);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/{id}/logos")
    public ResponseEntity<Map<String, String>> uploadLogo(
            @PathVariable Long id,
            @RequestParam("file") MultipartFile file) throws IOException {
        String path = mockupProjectService.uploadLogo(id, file);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(Map.of("path", path));
    }

    @DeleteMapping("/{id}/logos/{logoId}")
    public ResponseEntity<Void> deleteLogo(
            @PathVariable Long id,
            @PathVariable Long logoId) {
        mockupProjectService.deleteLogo(id, logoId);
        return ResponseEntity.noContent().build();
    }
}