package com.example.GreenDeskWeb.services.PackagingTemplateService;

import com.example.GreenDeskWeb.dto.PackagingTemplateDtos.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;

public interface IPackagingTemplateService {

    PackagingTemplateResponse create(Long productId, String name,
                                     MultipartFile svgFlat, MultipartFile svgPerspective) throws IOException;

    List<PackagingTemplateSummary> listForProduct(Long productId);

    List<PackagingTemplateSummary> listAll();

    PackagingTemplateResponse getById(Long id) throws IOException;

    void saveLabels(Long templateId, SaveLabelsRequest request);

    PackagingTemplateResponse replaceSvg(Long templateId, MultipartFile svgFlat,
                                         MultipartFile svgPerspective) throws IOException;

    void delete(Long id) throws IOException;
}