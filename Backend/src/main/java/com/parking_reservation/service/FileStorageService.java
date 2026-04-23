package com.parking_reservation.service;

import com.parking_reservation.exception.FileStorageException;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.List;
import java.util.UUID;

@Service
public class FileStorageService {

    private static final long MAX_FILE_SIZE = 5 * 1024 * 1024L; // 5 MB
    private static final int MAX_ATTACHMENTS = 3;
    private static final List<String> ALLOWED_TYPES = List.of("image/jpeg", "image/png");

    private final Path uploadRoot = Paths.get("uploads/tickets");

    public FileStorageService() {
        try {
            Files.createDirectories(uploadRoot);
        } catch (IOException e) {
            throw new RuntimeException("Could not create upload directory", e);
        }
    }

    public String store(MultipartFile file, long currentCount) {
        validateCount(currentCount);
        validateFile(file);

        String extension = getExtension(file.getOriginalFilename());
        String fileName = UUID.randomUUID() + extension;
        Path destination = uploadRoot.resolve(fileName);

        try {
            Files.copy(file.getInputStream(), destination, StandardCopyOption.REPLACE_EXISTING);
        } catch (IOException e) {
            throw new FileStorageException("Failed to store file: " + e.getMessage());
        }

        return destination.toString();
    }

    public byte[] load(String storagePath) {
        try {
            return Files.readAllBytes(Paths.get(storagePath));
        } catch (IOException e) {
            throw new FileStorageException("File not found or could not be read");
        }
    }

    public void delete(String storagePath) {
        try {
            Files.deleteIfExists(Paths.get(storagePath));
        } catch (IOException e) {
            throw new FileStorageException("Could not delete file: " + e.getMessage());
        }
    }

    private void validateCount(long currentCount) {
        if (currentCount >= MAX_ATTACHMENTS) {
            throw new FileStorageException("Maximum of " + MAX_ATTACHMENTS + " attachments allowed per ticket");
        }
    }

    private void validateFile(MultipartFile file) {
        if (file.isEmpty()) {
            throw new FileStorageException("Cannot upload an empty file");
        }
        if (file.getSize() > MAX_FILE_SIZE) {
            throw new FileStorageException("File size exceeds the 5 MB limit");
        }
        String contentType = file.getContentType();
        if (contentType == null || !ALLOWED_TYPES.contains(contentType)) {
            throw new FileStorageException("Only JPEG and PNG images are allowed");
        }
    }

    private String getExtension(String originalName) {
        if (originalName == null || !originalName.contains(".")) return "";
        return originalName.substring(originalName.lastIndexOf("."));
    }
}
