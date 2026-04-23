package com.parking_reservation.controller;

import com.parking_reservation.dto.request.ParkingSlotRequest;
import com.parking_reservation.dto.request.ZoneRequest;
import com.parking_reservation.dto.response.ApiResponse;
import com.parking_reservation.dto.response.ParkingSlotResponse;
import com.parking_reservation.service.ParkingSlotService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/parking-slots")
@RequiredArgsConstructor
public class ParkingSlotController {

    private final ParkingSlotService slotService;

    // GET /api/v1/parking-slots?type=CAR&startTime=...&endTime=...
    @GetMapping
    public ResponseEntity<ApiResponse<List<ParkingSlotResponse>>> getSlots(
            @RequestParam(required = false) String type,
            @RequestParam(required = false)
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime startTime,
            @RequestParam(required = false)
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime endTime) {

        LocalDateTime start = startTime != null ? startTime : LocalDateTime.now();
        LocalDateTime end = endTime != null ? endTime
                : LocalDateTime.now().plusDays(1).withHour(23).withMinute(59).withSecond(0).withNano(0);

        return ResponseEntity.ok(ApiResponse.success(slotService.getSlots(type, start, end)));
    }

    // GET /api/v1/parking-slots/{id}
    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<ParkingSlotResponse>> getSlotById(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success(slotService.getSlotById(id)));
    }

    // POST /api/v1/parking-slots  (Admin only)
    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<ParkingSlotResponse>> createSlot(
            @Valid @RequestBody ParkingSlotRequest request) {
        ParkingSlotResponse created = slotService.createSlot(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Parking slot created", created));
    }

    // PUT /api/v1/parking-slots/{id}  (Admin only)
    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<ParkingSlotResponse>> updateSlot(
            @PathVariable Long id,
            @Valid @RequestBody ParkingSlotRequest request) {
        return ResponseEntity.ok(ApiResponse.success("Parking slot updated", slotService.updateSlot(id, request)));
    }

    // PATCH /api/v1/parking-slots/{id}/status  (Admin only)
    @PatchMapping("/{id}/status")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<ParkingSlotResponse>> updateSlotStatus(
            @PathVariable Long id,
            @RequestBody Map<String, String> body) {
        String status = body.get("status");
        if (status == null || status.isBlank()) {
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error("Field 'status' is required"));
        }
        return ResponseEntity.ok(ApiResponse.success("Status updated", slotService.updateSlotStatus(id, status)));
    }

    // DELETE /api/v1/parking-slots/{id}  (Admin only)
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deleteSlot(@PathVariable Long id) {
        slotService.deleteSlot(id);
        return ResponseEntity.noContent().build();
    }

    // POST /api/v1/parking-slots/zones  (Admin only) — bulk-create all slots for a new zone
    @PostMapping("/zones")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<List<ParkingSlotResponse>>> createZone(
            @Valid @RequestBody ZoneRequest request) {
        List<ParkingSlotResponse> created = slotService.createZone(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Zone created with " + created.size() + " slots", created));
    }

    // DELETE /api/v1/parking-slots/zones?zone=A&type=CAR  (Admin only) — remove entire zone
    @DeleteMapping("/zones")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deleteZone(
            @RequestParam String zone,
            @RequestParam String type) {
        slotService.deleteZone(zone, type);
        return ResponseEntity.noContent().build();
    }
}
