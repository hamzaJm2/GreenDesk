package com.example.GreenDeskWeb.controllers;

import com.example.GreenDeskWeb.dto.MarkingZoneDTO;
import com.example.GreenDeskWeb.services.MarkingZoneService.MarkingZoneService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/products/{productId}/marking-zones")
@RequiredArgsConstructor
public class MarkingZoneController {

    private final MarkingZoneService markingZoneService;

    @GetMapping
    public ResponseEntity<List<MarkingZoneDTO>> getAll(@PathVariable Long productId) {
        return ResponseEntity.ok(markingZoneService.getByProductId(productId));
    }

    @PostMapping
    public ResponseEntity<MarkingZoneDTO> create(
            @PathVariable Long productId,
            @RequestBody MarkingZoneDTO dto) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(markingZoneService.create(productId, dto));
    }

    @PutMapping("/{id}")
    public ResponseEntity<MarkingZoneDTO> update(
            @PathVariable Long productId,
            @PathVariable Long id,
            @RequestBody MarkingZoneDTO dto) {
        return ResponseEntity.ok(markingZoneService.update(id, dto));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(
            @PathVariable Long productId,
            @PathVariable Long id) {
        markingZoneService.delete(id);
        return ResponseEntity.noContent().build();
    }
}