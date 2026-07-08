package com.example.GreenDeskWeb.services.MarkingZoneService;

import com.example.GreenDeskWeb.dto.MarkingZoneDTO;

import java.util.List;

public interface MarkingZoneService {
    List<MarkingZoneDTO> getByProductId(Long productId);
    MarkingZoneDTO create(Long productId, MarkingZoneDTO dto);
    MarkingZoneDTO update(Long id, MarkingZoneDTO dto);
    void delete(Long id);
}