package com.parking_reservation.controller;

import com.parking_reservation.dto.request.HelmetRequest;
import com.parking_reservation.dto.response.ApiResponse;
import com.parking_reservation.dto.response.HelmetResponse;
import com.parking_reservation.service.HelmetService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/helmets")
@RequiredArgsConstructor
public class HelmetController {

    private final HelmetService helmetService;

    // GET /api/v1/helmets?size=MEDIUM&status=AVAILABLE&condition=GOOD
    @GetMapping
    public ResponseEntity<ApiResponse<List<HelmetResponse>>> getAllHelmets(
            @RequestParam(required = false) String size,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String condition) {
        return ResponseEntity.ok(ApiResponse.success(helmetService.getAllHelmets(size, status, condition)));
    }

    // GET /api/v1/helmets/{id}
    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<HelmetResponse>> getHelmetById(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success(helmetService.getHelmetById(id)));
    }

    // POST /api/v1/helmets  (Admin only)
    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<HelmetResponse>> createHelmet(
            @Valid @RequestBody HelmetRequest request) {
        HelmetResponse created = helmetService.createHelmet(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Helmet added to inventory", created));
    }

    // PUT /api/v1/helmets/{id}  (Admin only)
    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<HelmetResponse>> updateHelmet(
            @PathVariable Long id,
            @Valid @RequestBody HelmetRequest request) {
        return ResponseEntity.ok(ApiResponse.success("Helmet updated", helmetService.updateHelmet(id, request)));
    }

    // PATCH /api/v1/helmets/{id}/status  (Admin only)
    @PatchMapping("/{id}/status")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<HelmetResponse>> updateHelmetStatus(
            @PathVariable Long id,
            @RequestBody Map<String, String> body) {
        String status = body.get("status");
        if (status == null || status.isBlank()) {
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error("Field 'status' is required"));
        }
        return ResponseEntity.ok(ApiResponse.success("Status updated", helmetService.updateHelmetStatus(id, status)));
    }

    // DELETE /api/v1/helmets/{id}  (Admin only)
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deleteHelmet(@PathVariable Long id) {
        helmetService.deleteHelmet(id);
        return ResponseEntity.noContent().build();
    }
}
