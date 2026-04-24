package com.parking_reservation.controller;

import com.parking_reservation.dto.request.HelmetBorrowingRequest;
import com.parking_reservation.dto.response.ApiResponse;
import com.parking_reservation.dto.response.HelmetBorrowingResponse;
import com.parking_reservation.entity.User;
import com.parking_reservation.service.HelmetBorrowingService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/helmet-borrowings")
@RequiredArgsConstructor
public class HelmetBorrowingController {

    private final HelmetBorrowingService borrowingService;

    // GET /api/v1/helmet-borrowings — USER sees own; ADMIN sees all
    @GetMapping
    public ResponseEntity<ApiResponse<List<HelmetBorrowingResponse>>> getBorrowings(
            @AuthenticationPrincipal User currentUser) {
        boolean isAdmin = currentUser.getRoles().stream()
                .anyMatch(r -> r.getName().name().equals("ADMIN"));
        List<HelmetBorrowingResponse> data = isAdmin
                ? borrowingService.getAllBorrowings()
                : borrowingService.getBorrowingsForUser(currentUser.getId());
        return ResponseEntity.ok(ApiResponse.success(data));
    }

    // GET /api/v1/helmet-borrowings/{id}
    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<HelmetBorrowingResponse>> getById(
            @PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success(borrowingService.getById(id)));
    }

    // POST /api/v1/helmet-borrowings
    @PostMapping
    public ResponseEntity<ApiResponse<HelmetBorrowingResponse>> requestBorrowing(
            @AuthenticationPrincipal User currentUser,
            @RequestBody HelmetBorrowingRequest request) {
        HelmetBorrowingResponse created = borrowingService.requestBorrowing(currentUser.getId(), request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Helmet borrowing request submitted", created));
    }

    // PATCH /api/v1/helmet-borrowings/{id}/cancel — owner only, PENDING → CANCELLED
    @PatchMapping("/{id}/cancel")
    public ResponseEntity<ApiResponse<HelmetBorrowingResponse>> cancelBorrowing(
            @AuthenticationPrincipal User currentUser,
            @PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success("Request cancelled",
                borrowingService.cancelBorrowing(currentUser.getId(), id)));
    }

    // PATCH /api/v1/helmet-borrowings/{id}/issue — ADMIN only
    @PatchMapping("/{id}/issue")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<HelmetBorrowingResponse>> issueBorrowing(
            @PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success("Helmet issued", borrowingService.issueBorrowing(id)));
    }

    // PATCH /api/v1/helmet-borrowings/{id}/reject — ADMIN only
    @PatchMapping("/{id}/reject")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<HelmetBorrowingResponse>> rejectBorrowing(
            @PathVariable Long id,
            @RequestBody Map<String, String> body) {
        String reason = body.getOrDefault("reason", "No reason provided");
        return ResponseEntity.ok(ApiResponse.success("Request rejected", borrowingService.rejectBorrowing(id, reason)));
    }

    // PATCH /api/v1/helmet-borrowings/{id}/return — owner or ADMIN
    @PatchMapping("/{id}/return")
    public ResponseEntity<ApiResponse<HelmetBorrowingResponse>> returnBorrowing(
            @AuthenticationPrincipal User currentUser,
            @PathVariable Long id) {
        boolean isAdmin = currentUser.getRoles().stream()
                .anyMatch(r -> r.getName().name().equals("ADMIN"));
        return ResponseEntity.ok(ApiResponse.success("Helmet returned",
                borrowingService.returnBorrowing(currentUser.getId(), isAdmin, id)));
    }
}
