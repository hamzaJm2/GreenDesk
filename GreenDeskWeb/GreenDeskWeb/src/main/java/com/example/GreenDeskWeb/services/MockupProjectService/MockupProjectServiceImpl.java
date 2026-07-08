package com.example.GreenDeskWeb.services.MockupProjectService;


import com.example.GreenDeskWeb.dto.MockupProjectDTO;
import com.example.GreenDeskWeb.dto.MockupProjectRequestDTO;
import com.example.GreenDeskWeb.entites.MockupLogo;
import com.example.GreenDeskWeb.entites.MockupProject;
import com.example.GreenDeskWeb.entites.User;
import com.example.GreenDeskWeb.enums.UserRole;
import com.example.GreenDeskWeb.mappers.MockupProjectMapper;
import com.example.GreenDeskWeb.repositories.MockupLogoRepository;
import com.example.GreenDeskWeb.repositories.MockupProjectRepository;
import com.example.GreenDeskWeb.services.ProductService.FileSystemStorageService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class MockupProjectServiceImpl implements MockupProjectService {

    private final MockupProjectRepository mockupProjectRepository;
    private final MockupLogoRepository mockupLogoRepository;
    private final MockupProjectMapper mockupProjectMapper;
    private final FileSystemStorageService storageService;

    @Override
    public List<MockupProjectDTO> getAll() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth != null && auth.getPrincipal() instanceof User currentUser) {
            if (currentUser.getRole() == UserRole.ADMIN) {
                return mockupProjectMapper.toDtoList(
                        mockupProjectRepository.findAllByOrderByDateMiseAJourDesc()
                );
            } else {
                return mockupProjectMapper.toDtoList(
                        mockupProjectRepository.findByOwnerOrderByDateMiseAJourDesc(currentUser)
                );
            }
        }
        return mockupProjectMapper.toDtoList(
                mockupProjectRepository.findAllByOrderByDateMiseAJourDesc()
        );
    }

    @Override
    public MockupProjectDTO getById(Long id) {
        return mockupProjectMapper.toDto(
                mockupProjectRepository.findById(id)
                        .orElseThrow(() -> new RuntimeException("Projet introuvable : " + id))
        );
    }

    @Override
    public MockupProjectDTO getCurrent() {
        return mockupProjectRepository.findFirstByOrderByDateMiseAJourDesc()
                .map(mockupProjectMapper::toDto)
                .orElseThrow(() -> new RuntimeException("Aucun projet disponible"));
    }

    @Override
    public MockupProjectDTO create(MockupProjectRequestDTO dto) {
        MockupProject project = mockupProjectMapper.toEntity(dto);
        project.setStatut("brouillon");
        project.setDateMiseAJour(LocalDateTime.now());
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth != null && auth.getPrincipal() instanceof User currentUser) {
            project.setOwner(currentUser);
        }
        return mockupProjectMapper.toDto(mockupProjectRepository.save(project));
    }

    @Override
    public MockupProjectDTO update(Long id, MockupProjectRequestDTO dto) {
        MockupProject project = mockupProjectRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Projet introuvable : " + id));
        project.setNomProjet(dto.getNomProjet());
        project.setProduitsSelectionnes(dto.getProduitsSelectionnes());
        project.setColorisSelectionnes(dto.getColorisSelectionnes());
        project.setLogoPrincipalId(dto.getLogoPrincipalId());
        project.setClientRef(dto.getClientRef());
        project.setCouleurs(dto.getCouleurs());
        project.setDateMiseAJour(LocalDateTime.now());
        return mockupProjectMapper.toDto(mockupProjectRepository.save(project));
    }

    @Override
    public MockupProjectDTO saveDraft(Long id, String brouillonJson, String nomProjet) {
        MockupProject project = mockupProjectRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Projet introuvable : " + id));
        if (nomProjet != null && !nomProjet.isBlank()) {
            project.setNomProjet(nomProjet);
        }
        project.setBrouillonMaquette(brouillonJson);
        project.setDateMiseAJour(LocalDateTime.now());
        return mockupProjectMapper.toDto(mockupProjectRepository.save(project));
    }

    @Override
    public MockupProjectDTO duplicate(Long id) {
        MockupProject source = mockupProjectRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Projet introuvable : " + id));
        MockupProject copy = new MockupProject();
        copy.setNomProjet(source.getNomProjet() + " - copie");
        copy.setStatut("brouillon");
        copy.setProduitsSelectionnes(source.getProduitsSelectionnes());
        copy.setColorisSelectionnes(source.getColorisSelectionnes());
        copy.setBrouillonMaquette(source.getBrouillonMaquette());
        copy.setOwner(source.getOwner());
        copy.setDateMiseAJour(LocalDateTime.now());
        return mockupProjectMapper.toDto(mockupProjectRepository.save(copy));
    }

    @Override
    public void delete(Long id) {
        mockupProjectRepository.deleteById(id);
    }

    @Override
    public String uploadLogo(Long projectId, MultipartFile file) throws IOException {
        MockupProject project = mockupProjectRepository.findById(projectId)
                .orElseThrow(() -> new RuntimeException("Projet introuvable : " + projectId));

        String path = storageService.store(file, "mockups/" + projectId, file.getOriginalFilename());

        String originalFilename = file.getOriginalFilename() != null ? file.getOriginalFilename() : "logo";
        String extension = originalFilename.contains(".")
                ? originalFilename.substring(originalFilename.lastIndexOf(".") + 1).toLowerCase()
                : "";

        MockupLogo logo = new MockupLogo();
        logo.setProject(project);
        logo.setNomOriginal(originalFilename);
        logo.setNomFichierStocke(originalFilename);
        logo.setPublicPath(path);
        logo.setMimeType(file.getContentType());
        logo.setExtension(extension);
        logo.setVector(extension.equals("svg") || extension.equals("ai") || extension.equals("pdf"));
        logo.setTypeApercu("image");
        logo.setDateImport(LocalDateTime.now());

        mockupLogoRepository.save(logo);

        if (project.getLogoPrincipalId() == null) {
            project.setLogoPrincipalId(String.valueOf(logo.getId()));
            mockupProjectRepository.save(project);
        }

        return path;
    }

    @Override
    public void deleteLogo(Long projectId, Long logoId) {
        MockupLogo logo = mockupLogoRepository.findById(logoId)
                .orElseThrow(() -> new RuntimeException("Logo introuvable : " + logoId));
        mockupLogoRepository.delete(logo);

        MockupProject project = mockupProjectRepository.findById(projectId)
                .orElseThrow(() -> new RuntimeException("Projet introuvable : " + projectId));

        if (String.valueOf(logoId).equals(project.getLogoPrincipalId())) {
            project.setLogoPrincipalId(
                    project.getLogos().stream()
                            .filter(l -> !l.getId().equals(logoId))
                            .findFirst()
                            .map(l -> String.valueOf(l.getId()))
                            .orElse(null)
            );
            mockupProjectRepository.save(project);
        }
    }
}