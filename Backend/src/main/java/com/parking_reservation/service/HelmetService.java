package com.parking_reservation.service;

import com.parking_reservation.dto.request.HelmetRequest;
import com.parking_reservation.dto.response.HelmetResponse;
import com.parking_reservation.entity.Helmet;
import com.parking_reservation.entity.Helmet.HelmetCondition;
import com.parking_reservation.entity.Helmet.HelmetSize;
import com.parking_reservation.entity.Helmet.HelmetStatus;
import com.parking_reservation.exception.ResourceNotFoundException;
import com.parking_reservation.repository.HelmetRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class HelmetService {

    private final HelmetRepository helmetRepository;

    @Transactional(readOnly = true)
    public List<HelmetResponse> getAllHelmets(String size, String status, String condition) {
        HelmetSize sizeEnum       = parseEnum(HelmetSize.class, size, "size");
        HelmetStatus statusEnum   = parseEnum(HelmetStatus.class, status, "status");
        HelmetCondition condEnum  = parseEnum(HelmetCondition.class, condition, "condition");

        return helmetRepository.findWithFilters(sizeEnum, statusEnum, condEnum)
                .stream().map(HelmetResponse::from).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public HelmetResponse getHelmetById(Long id) {
        return HelmetResponse.from(findOrThrow(id));
    }

    @Transactional
    public HelmetResponse createHelmet(HelmetRequest request) {
        String serial = request.getSerialNumber().trim().toUpperCase();
        if (helmetRepository.existsBySerialNumber(serial)) {
            throw new IllegalArgumentException("Serial number already exists: " + serial);
        }
        Helmet helmet = new Helmet();
        helmet.setSerialNumber(serial);
        helmet.setSize(parseEnumRequired(HelmetSize.class, request.getSize(), "size"));
        helmet.setCondition(parseEnumRequired(HelmetCondition.class, request.getCondition(), "condition"));
        helmet.setStatus(HelmetStatus.AVAILABLE);
        return HelmetResponse.from(helmetRepository.save(helmet));
    }

    @Transactional
    public HelmetResponse updateHelmet(Long id, HelmetRequest request) {
        Helmet helmet = findOrThrow(id);

        String newSerial = request.getSerialNumber().trim().toUpperCase();
        if (!helmet.getSerialNumber().equalsIgnoreCase(newSerial)
                && helmetRepository.existsBySerialNumber(newSerial)) {
            throw new IllegalArgumentException("Serial number already exists: " + newSerial);
        }

        helmet.setSerialNumber(newSerial);
        helmet.setSize(parseEnumRequired(HelmetSize.class, request.getSize(), "size"));
        helmet.setCondition(parseEnumRequired(HelmetCondition.class, request.getCondition(), "condition"));

        if (request.getStatus() != null && !request.getStatus().isBlank()) {
            helmet.setStatus(parseEnumRequired(HelmetStatus.class, request.getStatus(), "status"));
        }

        return HelmetResponse.from(helmetRepository.save(helmet));
    }

    @Transactional
    public HelmetResponse updateHelmetStatus(Long id, String status) {
        Helmet helmet = findOrThrow(id);
        helmet.setStatus(parseEnumRequired(HelmetStatus.class, status, "status"));
        return HelmetResponse.from(helmetRepository.save(helmet));
    }

    @Transactional
    public void deleteHelmet(Long id) {
        if (!helmetRepository.existsById(id)) {
            throw new ResourceNotFoundException("Helmet not found: " + id);
        }
        helmetRepository.deleteById(id);
    }

    private Helmet findOrThrow(Long id) {
        return helmetRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Helmet not found: " + id));
    }

    private <E extends Enum<E>> E parseEnum(Class<E> clazz, String value, String fieldName) {
        if (value == null || value.isBlank()) return null;
        try {
            return Enum.valueOf(clazz, value.trim().toUpperCase());
        } catch (IllegalArgumentException e) {
            throw new IllegalArgumentException("Invalid " + fieldName + ": " + value);
        }
    }

    private <E extends Enum<E>> E parseEnumRequired(Class<E> clazz, String value, String fieldName) {
        if (value == null || value.isBlank()) {
            throw new IllegalArgumentException(fieldName + " is required");
        }
        try {
            return Enum.valueOf(clazz, value.trim().toUpperCase());
        } catch (IllegalArgumentException e) {
            throw new IllegalArgumentException("Invalid " + fieldName + ": " + value);
        }
    }
}
