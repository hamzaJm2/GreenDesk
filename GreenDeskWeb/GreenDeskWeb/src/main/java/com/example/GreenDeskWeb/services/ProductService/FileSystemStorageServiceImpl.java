package com.example.GreenDeskWeb.services.ProductService;

import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.time.Instant;
import java.util.ArrayList;
import java.util.List;

@Service
public class FileSystemStorageServiceImpl implements FileSystemStorageService {

    private final Path root = Paths.get("uploads");

    public FileSystemStorageServiceImpl() throws IOException {
        if (!Files.exists(root)) {
            Files.createDirectories(root);
        }
    }

    @Override
    public String store(MultipartFile file, String subfolder, String originalName) throws IOException {
        if (file.isEmpty()) throw new IOException("Fichier vide");

        Path folder = root.resolve(subfolder);
       
        Files.createDirectories(folder);

        // Garde le nom original du fichier, juste nettoyé
        String safeName = originalName != null && !originalName.isBlank()
                ? originalName.replaceAll("[^a-zA-Z0-9.\\-_() ]", "_")
                : file.getOriginalFilename().replaceAll("[^a-zA-Z0-9.\\-_() ]", "_");

        Path destination = folder.resolve(safeName).normalize().toAbsolutePath();

        // Si le fichier existe déjà, ajoute un timestamp pour éviter l'écrasement
        if (Files.exists(destination)) {
            String ext = safeName.contains(".")
                    ? safeName.substring(safeName.lastIndexOf("."))
                    : "";
            String nameWithoutExt = safeName.contains(".")
                    ? safeName.substring(0, safeName.lastIndexOf("."))
                    : safeName;
            safeName = nameWithoutExt + "_" + Instant.now().toEpochMilli() + ext;
            destination = folder.resolve(safeName).normalize().toAbsolutePath();
        }

        Files.copy(file.getInputStream(), destination, StandardCopyOption.REPLACE_EXISTING);

        return subfolder + "/" + safeName;
    }

    @Override
    public List<String> storeAll(List<MultipartFile> files, String subfolder) throws IOException {
        List<String> paths = new ArrayList<>();
        if (files == null) return paths;
        for (MultipartFile f : files) {
            if (f != null && !f.isEmpty()) {
                paths.add(store(f, subfolder, null));
            }
        }
        return paths;
    }

    @Override
    public void delete(String relativePath) {
        if (relativePath == null || relativePath.isBlank()) return;
        try {
            Path file = root.resolve(relativePath).normalize().toAbsolutePath();
            Files.deleteIfExists(file);
        } catch (IOException e) {
            System.err.println("Impossible de supprimer le fichier: " + relativePath + " — " + e.getMessage());
        }
    }
}



