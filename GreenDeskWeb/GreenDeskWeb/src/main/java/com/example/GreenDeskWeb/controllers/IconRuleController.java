package com.example.GreenDeskWeb.controllers;
import com.example.GreenDeskWeb.dto.IconRuleDTO;

import com.example.GreenDeskWeb.services.IconRuleService.IconRuleService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/icon-rules")
@CrossOrigin
public class IconRuleController {

    @Autowired
    private IconRuleService iconRuleService;

    @GetMapping
    public ResponseEntity<List<IconRuleDTO>> getAll() {
        return ResponseEntity.ok(iconRuleService.findAll());
    }

    @GetMapping("/{id}")
    public ResponseEntity<IconRuleDTO> getById(@PathVariable Long id) {
        return ResponseEntity.ok(iconRuleService.findById(id));
    }

    @PostMapping
    public ResponseEntity<IconRuleDTO> create(@RequestBody IconRuleDTO dto) {
        return ResponseEntity.ok(iconRuleService.create(dto));
    }

    @PutMapping("/{id}")
    public ResponseEntity<IconRuleDTO> update(@PathVariable Long id, @RequestBody IconRuleDTO dto) {
        return ResponseEntity.ok(iconRuleService.update(id, dto));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        iconRuleService.delete(id);
        return ResponseEntity.noContent().build();
    }

    // Résoudre une icône à partir d'un texte
    @GetMapping("/resolve")
    public ResponseEntity<Map<String, String>> resolve(@RequestParam String text) {
        return ResponseEntity.ok(Map.of("iconId", iconRuleService.resolveIconId(text)));
    }
}
