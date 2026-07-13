package com.example.GreenDeskWeb.services.PackagingTemplateService;

import com.example.GreenDeskWeb.dto.PackagingTemplateDtos.*;

import com.example.GreenDeskWeb.entites.PackagingColorGroup;
import com.example.GreenDeskWeb.entites.PackagingLogoZone;
import com.example.GreenDeskWeb.entites.PackagingTemplate;
import com.example.GreenDeskWeb.mappers.PackagingMapper;
import com.example.GreenDeskWeb.repositories.PackagingTemplateRepository;
import com.example.GreenDeskWeb.services.PackagingFileStorageService;
import com.example.GreenDeskWeb.services.PackagingSvgParserService;
import com.example.GreenDeskWeb.services.PackagingTemplateService.IPackagingTemplateService;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;

import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class PackagingTemplateService implements IPackagingTemplateService {

    private final PackagingTemplateRepository repository;
    private final PackagingSvgParserService svgParserService;
    private final PackagingFileStorageService fileStorageService;
    private final PackagingMapper mapper;

    // TODO: injecter ton ProductRepository existant pour valider productId
    // et remplir productName dans la réponse.

    @Override
    @Transactional
    public PackagingTemplateResponse create(Long productId, String name,
                                            MultipartFile svgFlat, MultipartFile svgPerspective) throws IOException {

        String svgFlatContent = new String(svgFlat.getBytes(), StandardCharsets.UTF_8);
        PackagingSvgParserService.ParsedSvg parsed = svgParserService.parse(svgFlatContent);

        if (parsed.colorGroups().isEmpty() && parsed.logoZones().isEmpty()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "Aucun groupe 'editable-color__' ni 'logo-zone__' détecté dans ce SVG. " +
                            "Vérifiez la convention de nommage des IDs.");
        }

        String svgFlatPath = fileStorageService.store(svgFlat, "product-" + productId, name);
        String svgPerspectivePath = null;
        if (svgPerspective != null && !svgPerspective.isEmpty()) {
            svgPerspectivePath = fileStorageService.store(svgPerspective, "product-" + productId, name + "-perspective");
        }

        PackagingTemplate template = PackagingTemplate.builder()
                .productId(productId)
                .name(name)
                .svgFlatPath(svgFlatPath)
                .svgPerspectivePath(svgPerspectivePath)
                .viewBoxWidth(parsed.viewBoxWidth())
                .viewBoxHeight(parsed.viewBoxHeight())
                .active(true)
                .build();

        parsed.colorGroups().forEach(cg -> {
            cg.setPackagingTemplate(template);
            template.getColorGroups().add(cg);
        });
        parsed.logoZones().forEach(lz -> {
            lz.setPackagingTemplate(template);
            template.getLogoZones().add(lz);
        });

        PackagingTemplate saved = repository.save(template);
        return withContent(mapper.toResponse(saved), saved);
    }

    @Override
    @Transactional
    public List<PackagingTemplateSummary> listForProduct(Long productId) {
        return mapper.toSummaryList(repository.findByProductIdAndActiveTrue(productId));
    }

    @Override
    @Transactional
    public List<PackagingTemplateSummary> listAll() {
        return mapper.toSummaryList(repository.findAllByOrderByProductIdAsc());
    }

    @Override
    @Transactional
    public PackagingTemplateResponse getById(Long id) throws IOException {
        PackagingTemplate template = findOrThrow(id);
        return withContent(mapper.toResponse(template), template);
    }

    @Override
    @Transactional
    public void saveLabels(Long templateId, SaveLabelsRequest request) {
        PackagingTemplate template = findOrThrow(templateId);

        Map<Long, PackagingColorGroup> colorGroupsById = template.getColorGroups().stream()
                .collect(Collectors.toMap(PackagingColorGroup::getId, cg -> cg));
        Map<Long, PackagingLogoZone> logoZonesById = template.getLogoZones().stream()
                .collect(Collectors.toMap(PackagingLogoZone::getId, lz -> lz));

        if (request.getColorGroupLabels() != null) {
            request.getColorGroupLabels().forEach(entry -> {
                PackagingColorGroup cg = colorGroupsById.get(entry.getId());
                if (cg != null) cg.setLabel(entry.getLabel());
            });
        }
        if (request.getLogoZoneLabels() != null) {
            request.getLogoZoneLabels().forEach(entry -> {
                PackagingLogoZone lz = logoZonesById.get(entry.getId());
                if (lz != null) lz.setLabel(entry.getLabel());
            });
        }

        repository.save(template);
    }

    @Override
    @Transactional
    public PackagingTemplateResponse replaceSvg(Long templateId, MultipartFile svgFlat,
                                                MultipartFile svgPerspective) throws IOException {
        PackagingTemplate template = findOrThrow(templateId);

        Map<String, String> previousColorLabels = template.getColorGroups().stream()
                .collect(Collectors.toMap(PackagingColorGroup::getSvgGroupId, PackagingColorGroup::getLabel));
        Map<String, String> previousZoneLabels = template.getLogoZones().stream()
                .collect(Collectors.toMap(PackagingLogoZone::getSvgGroupId, PackagingLogoZone::getLabel));

        String newSvgFlatContent = new String(svgFlat.getBytes(), StandardCharsets.UTF_8);
        PackagingSvgParserService.ParsedSvg parsed = svgParserService.parse(newSvgFlatContent);

        // supprime les anciens fichiers avant d'écrire les nouveaux
        fileStorageService.delete(template.getSvgFlatPath());
        if (template.getSvgPerspectivePath() != null) {
            fileStorageService.delete(template.getSvgPerspectivePath());
        }

        String newSvgFlatPath = fileStorageService.store(svgFlat, "product-" + template.getProductId(), template.getName());
        String newSvgPerspectivePath = null;
        if (svgPerspective != null && !svgPerspective.isEmpty()) {
            newSvgPerspectivePath = fileStorageService.store(
                    svgPerspective, "product-" + template.getProductId(), template.getName() + "-perspective");
        }

        template.getColorGroups().clear();
        template.getLogoZones().clear();

        parsed.colorGroups().forEach(cg -> {
            String preserved = previousColorLabels.get(cg.getSvgGroupId());
            if (preserved != null) cg.setLabel(preserved);
            cg.setPackagingTemplate(template);
            template.getColorGroups().add(cg);
        });
        parsed.logoZones().forEach(lz -> {
            String preserved = previousZoneLabels.get(lz.getSvgGroupId());
            if (preserved != null) lz.setLabel(preserved);
            lz.setPackagingTemplate(template);
            template.getLogoZones().add(lz);
        });

        template.setSvgFlatPath(newSvgFlatPath);
        template.setSvgPerspectivePath(newSvgPerspectivePath);
        template.setViewBoxWidth(parsed.viewBoxWidth());
        template.setViewBoxHeight(parsed.viewBoxHeight());

        PackagingTemplate saved = repository.save(template);
        return withContent(mapper.toResponse(saved), saved);
    }

    @Override
    @Transactional
    public void delete(Long id) throws IOException {
        PackagingTemplate template = findOrThrow(id);
        fileStorageService.delete(template.getSvgFlatPath());
        if (template.getSvgPerspectivePath() != null) {
            fileStorageService.delete(template.getSvgPerspectivePath());
        }
        repository.deleteById(id);
    }

    /** Complète la réponse mappée avec le contenu texte lu depuis le disque,
     *  nécessaire pour le rendu inline côté wizard (recoloration + logo live). */
    private PackagingTemplateResponse withContent(PackagingTemplateResponse response, PackagingTemplate template) throws IOException {
        response.setSvgFlatContent(fileStorageService.readContent(template.getSvgFlatPath()));
        if (template.getSvgPerspectivePath() != null) {
            response.setSvgPerspectiveContent(fileStorageService.readContent(template.getSvgPerspectivePath()));
        }
        return response;
    }

    private PackagingTemplate findOrThrow(Long id) {
        return repository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND,
                        "Template d'emballage introuvable: " + id));
    }
}