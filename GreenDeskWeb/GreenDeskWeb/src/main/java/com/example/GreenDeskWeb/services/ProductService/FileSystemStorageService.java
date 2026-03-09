package com.example.GreenDeskWeb.services.ProductService;

import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.ArrayList;
import java.util.List;

public interface FileSystemStorageService {

     String store(MultipartFile file, String subfolder, String originalName) throws IOException;
     List<String> storeAll(List<MultipartFile> files, String subfolder) throws IOException;
}
