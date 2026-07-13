package com.example.GreenDeskWeb.services;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;

/**
 * Sauvegarde les SVG d'emballage sur disque, comme tes autres uploads
 * (masquePng, imageProduit...). Ne stocke qu'un chemin relatif en base.
 *
 * TODO: si tu as déjà un service de stockage générique (utilisé pour
 * uploadMasque/uploadColorisImage côté backend), remplace celui-ci par un
 * appel à ce service existant plutôt que d'en dupliquer un nouveau.
 */
@Service
public class PackagingFileStorageService {

    // adapte cette valeur à ta config existante (ex: server.upload-dir)
    @Value("${app.upload.dir:/opt/ELIA/greendesk-web/uploads}")
    private String uploadBaseDir;

    private static final String PACKAGING_SUBDIR = "packaging/svg";

    /**
     * Sauvegarde le fichier SVG uploadé et retourne le chemin relatif
     * (ex: "uploads/packaging/svg/flexy_boite-coffret_1720871234.svg")
     * à persister dans PackagingTemplate.svgFlatPath.
     */
    public String store(MultipartFile file, String productName, String templateName) throws IOException {
        Path targetDir = Paths.get(uploadBaseDir, PACKAGING_SUBDIR);
        Files.createDirectories(targetDir);

        String safeProduct = sanitize(productName);
        String safeTemplate = sanitize(templateName);
        String filename = safeProduct + "_" + safeTemplate + "_" + System.currentTimeMillis() + ".svg";

        Path targetPath = targetDir.resolve(filename);
        Files.copy(file.getInputStream(), targetPath, StandardCopyOption.REPLACE_EXISTING);

        // chemin relatif servi ensuite via ${environment.apiUrl}/${path} côté front
        return "uploads/" + PACKAGING_SUBDIR + "/" + filename;
    }

    /** Lit le contenu texte d'un SVG déjà stocké, à partir de son chemin relatif. */
    public String readContent(String relativePath) throws IOException {
        // relativePath commence par "uploads/..." -> on retire le préfixe "uploads/"
        // pour le recombiner avec uploadBaseDir (qui pointe déjà sur le dossier uploads)
        String withoutPrefix = relativePath.startsWith("uploads/")
                ? relativePath.substring("uploads/".length())
                : relativePath;
        Path fullPath = Paths.get(uploadBaseDir, withoutPrefix);
        return Files.readString(fullPath, StandardCharsets.UTF_8);
    }

    public void delete(String relativePath) throws IOException {
        if (relativePath == null) return;
        String withoutPrefix = relativePath.startsWith("uploads/")
                ? relativePath.substring("uploads/".length())
                : relativePath;
        Path fullPath = Paths.get(uploadBaseDir, withoutPrefix);
        Files.deleteIfExists(fullPath);
    }

    private String sanitize(String input) {
        if (!StringUtils.hasText(input)) return "template";
        return input.trim()
                .toLowerCase()
                .replaceAll("[^a-z0-9]+", "-")
                .replaceAll("(^-|-$)", "");
    }
}