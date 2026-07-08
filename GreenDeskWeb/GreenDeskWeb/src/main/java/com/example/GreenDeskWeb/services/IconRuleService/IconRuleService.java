package com.example.GreenDeskWeb.services.IconRuleService;

import com.example.GreenDeskWeb.dto.IconRuleDTO;
import java.util.List;

public interface IconRuleService {
    List<IconRuleDTO> findAll();
    IconRuleDTO findById(Long id);
    IconRuleDTO create(IconRuleDTO dto);
    IconRuleDTO update(Long id, IconRuleDTO dto);
    void delete(Long id);
    String resolveIconId(String text);
}
