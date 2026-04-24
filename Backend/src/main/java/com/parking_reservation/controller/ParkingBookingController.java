package com.parking_reservation.controller;

import com.parking_reservation.dto.request.ParkingBookingRequest;
import com.parking_reservation.dto.response.ApiResponse;
import com.parking_reservation.dto.response.ParkingBookingResponse;
import com.parking_reservation.entity.User;
import com.parking_reservation.service.ParkingBookingService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/parking-bookings")
@RequiredArgsConstructor
public class ParkingBookingController {

    private final ParkingBookingService bookingService;

    // GET /api/v1/parking-bookings — USER sees own, ADMIN sees all
    @GetMapping
    public ResponseEntity<ApiResponse<List<ParkingBookingResponse>>> getBookings(
            @AuthenticationPrincipal User currentUser) {
        boolean isAdmin = currentUser.getRoles().stream()
                .anyMatch(r -> r.getName().name().equals("ADMIN"));
        List<ParkingBookingResponse> bookings = isAdmin
                ? bookingService.getAllBookings()
                : bookingService.getBookingsForUser(currentUser.getId());
        return ResponseEntity.ok(ApiResponse.success(bookings));
    }

    // GET /api/v1/parking-bookings/{id}
    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<ParkingBookingResponse>> getBookingById(
            @PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success(bookingService.getBookingById(id)));
    }

    // POST /api/v1/parking-bookings
    @PostMapping
    public ResponseEntity<ApiResponse<ParkingBookingResponse>> createBooking(
            @AuthenticationPrincipal User currentUser,
            @Valid @RequestBody ParkingBookingRequest request) {
        ParkingBookingResponse created = bookingService.createBooking(currentUser.getId(), request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Booking created successfully", created));
    }

    // PATCH /api/v1/parking-bookings/{id}/approve — ADMIN only
    @PatchMapping("/{id}/approve")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<ParkingBookingResponse>> approveBooking(
            @PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success("Booking approved", bookingService.approveBooking(id)));
    }

    // PATCH /api/v1/parking-bookings/{id}/reject — ADMIN only
    @PatchMapping("/{id}/reject")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<ParkingBookingResponse>> rejectBooking(
            @PathVariable Long id,
            @RequestBody Map<String, String> body) {
        String reason = body.getOrDefault("reason", "No reason provided");
        return ResponseEntity.ok(ApiResponse.success("Booking rejected", bookingService.rejectBooking(id, reason)));
    }

    // PATCH /api/v1/parking-bookings/{id}/cancel — ADMIN only
    @PatchMapping("/{id}/cancel")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<ParkingBookingResponse>> cancelBooking(
            @PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success("Booking cancelled", bookingService.cancelBooking(id)));
    }

    // GET /api/v1/parking-bookings/slot/{slotId} — upcoming bookings for a slot (all authenticated users)
    @GetMapping("/slot/{slotId}")
    public ResponseEntity<ApiResponse<List<ParkingBookingResponse>>> getBookingsForSlot(
            @PathVariable Long slotId) {
        return ResponseEntity.ok(ApiResponse.success(bookingService.getUpcomingBookingsForSlot(slotId)));
    }

    // GET /api/v1/parking-bookings/check-conflict
    @GetMapping("/check-conflict")
    public ResponseEntity<ApiResponse<Boolean>> checkConflict(
            @RequestParam Long slotId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime startTime,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime endTime) {
        return ResponseEntity.ok(ApiResponse.success(bookingService.checkConflict(slotId, startTime, endTime)));
    }
}
