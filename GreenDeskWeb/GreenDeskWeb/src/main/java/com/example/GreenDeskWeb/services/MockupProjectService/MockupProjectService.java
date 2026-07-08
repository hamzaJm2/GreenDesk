package com.example.GreenDeskWeb.services.MockupProjectService;

import com.example.GreenDeskWeb.dto.MockupProjectDTO;
import com.example.GreenDeskWeb.dto.MockupProjectRequestDTO;

import java.util.List;

public interface MockupProjectService {
    List<MockupProjectDTO> getAll();
    MockupProjectDTO getById(Long id);
    MockupProjectDTO getCurrent();
    MockupProjectDTO create(MockupProjectRequestDTO dto);
    MockupProjectDTO update(Long id, MockupProjectRequestDTO dto);
    MockupProjectDTO saveDraft(Long id, String brouillonJson, String nomProjet);
    MockupProjectDTO duplicate(Long id);
    void delete(Long id);
    String uploadLogo(Long projectId, org.springframework.web.multipart.MultipartFile file) throws java.io.IOException;
    void deleteLogo(Long projectId, Long logoId);
}