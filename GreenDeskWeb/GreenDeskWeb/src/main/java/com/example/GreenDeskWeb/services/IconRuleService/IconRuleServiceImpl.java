package com.example.GreenDeskWeb.services.IconRuleService;
import com.example.GreenDeskWeb.dto.IconRuleDTO;
import com.example.GreenDeskWeb.entites.IconRule;
import com.example.GreenDeskWeb.repositories.IconRuleRepository;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class IconRuleServiceImpl implements IconRuleService {

    @Autowired
    private IconRuleRepository repo;

    @Override
    public List<IconRuleDTO> findAll() {
        return repo.findAll().stream().map(this::toDTO).toList();
    }

    @Override
    public IconRuleDTO findById(Long id) {
        return toDTO(repo.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("IconRule not found: " + id)));
    }

    @Override
    @Transactional
    public IconRuleDTO create(IconRuleDTO dto) {
        IconRule rule = new IconRule();
        rule.setLabel(dto.getLabel());
        rule.setIconId(dto.getIconId());
        rule.setKeywords(dto.getKeywords());
        return toDTO(repo.save(rule));
    }

    @Override
    @Transactional
    public IconRuleDTO update(Long id, IconRuleDTO dto) {
        IconRule rule = repo.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("IconRule not found: " + id));
        rule.setLabel(dto.getLabel());
        rule.setIconId(dto.getIconId());
        rule.setKeywords(dto.getKeywords());
        return toDTO(repo.save(rule));
    }

    @Override
    @Transactional
    public void delete(Long id) {
        repo.deleteById(id);
    }

    @Override
    public String resolveIconId(String text) {
        if (text == null || text.isBlank()) return "check";
        String lower = text.toLowerCase();
        for (IconRule rule : repo.findAll()) {
            for (String keyword : rule.getKeywords()) {
                if (lower.contains(keyword.toLowerCase())) {
                    return rule.getIconId();
                }
            }
        }
        return "check";
    }

    private IconRuleDTO toDTO(IconRule rule) {
        IconRuleDTO dto = new IconRuleDTO();
        dto.setId(rule.getId());
        dto.setLabel(rule.getLabel());
        dto.setIconId(rule.getIconId());
        dto.setKeywords(rule.getKeywords());
        return dto;
    }
}