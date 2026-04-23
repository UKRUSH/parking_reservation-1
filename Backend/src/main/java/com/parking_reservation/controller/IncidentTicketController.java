package com.parking_reservation.controller;

import com.parking_reservation.dto.request.CommentRequest;
import com.parking_reservation.dto.request.IncidentTicketRequest;
import com.parking_reservation.dto.response.ApiResponse;
import com.parking_reservation.dto.response.AttachmentResponse;
import com.parking_reservation.dto.response.CommentResponse;
import com.parking_reservation.dto.response.TicketResponse;
import com.parking_reservation.entity.User;
import com.parking_reservation.service.IncidentTicketService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/tickets")
@RequiredArgsConstructor
public class IncidentTicketController {

    private final IncidentTicketService ticketService;

    // GET /api/v1/tickets — USER sees own; ADMIN/TECH sees all (with optional ?status= filter)
    @GetMapping
    public ResponseEntity<ApiResponse<List<TicketResponse>>> getTickets(
            @AuthenticationPrincipal User currentUser,
            @RequestParam(required = false) String status) {

        boolean isAdmin = hasRole(currentUser, "ADMIN");
        boolean isTech  = hasRole(currentUser, "TECHNICIAN");

        List<TicketResponse> tickets;
        if (isAdmin) {
            tickets = ticketService.getAllTickets(status);
        } else if (isTech) {
            tickets = ticketService.getTicketsForTechnician(currentUser.getId());
        } else {
            tickets = ticketService.getTicketsForUser(currentUser.getId());
        }

        return ResponseEntity.ok(ApiResponse.success(tickets));
    }

    // GET /api/v1/tickets/{id}
    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<TicketResponse>> getTicketById(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success(ticketService.getTicketById(id)));
    }

    // POST /api/v1/tickets
    @PostMapping
    public ResponseEntity<ApiResponse<TicketResponse>> createTicket(
            @AuthenticationPrincipal User currentUser,
            @Valid @RequestBody IncidentTicketRequest request) {
        TicketResponse created = ticketService.createTicket(currentUser.getId(), request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Ticket created successfully", created));
    }

    // PATCH /api/v1/tickets/{id}/assign — ADMIN only
    @PatchMapping("/{id}/assign")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<TicketResponse>> assignTechnician(
            @PathVariable Long id,
            @RequestBody Map<String, Long> body) {
        Long technicianId = body.get("technicianId");
        if (technicianId == null) throw new IllegalArgumentException("technicianId is required");
        return ResponseEntity.ok(ApiResponse.success("Technician assigned", ticketService.assignTechnician(id, technicianId)));
    }

    // PATCH /api/v1/tickets/{id}/status — ADMIN or TECHNICIAN
    @PatchMapping("/{id}/status")
    @PreAuthorize("hasRole('ADMIN') or hasRole('TECHNICIAN')")
    public ResponseEntity<ApiResponse<TicketResponse>> updateStatus(
            @PathVariable Long id,
            @RequestBody Map<String, String> body) {
        return ResponseEntity.ok(ApiResponse.success("Status updated", ticketService.updateStatus(id, body)));
    }

    // PATCH /api/v1/tickets/{id}/reject — ADMIN only
    @PatchMapping("/{id}/reject")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<TicketResponse>> rejectTicket(
            @PathVariable Long id,
            @RequestBody Map<String, String> body) {
        String reason = body.getOrDefault("reason", "No reason provided");
        return ResponseEntity.ok(ApiResponse.success("Ticket rejected", ticketService.rejectTicket(id, reason)));
    }

    // DELETE /api/v1/tickets/{id} — ADMIN only (soft delete)
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Void>> deleteTicket(@PathVariable Long id) {
        ticketService.softDeleteTicket(id);
        return ResponseEntity.status(HttpStatus.NO_CONTENT).body(ApiResponse.success(null));
    }

    // ─── Attachments ──────────────────────────────────────────────────────────

    // GET /api/v1/tickets/{id}/attachments — list all attachments for a ticket
    @GetMapping("/{id}/attachments")
    public ResponseEntity<ApiResponse<List<AttachmentResponse>>> listAttachments(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success(ticketService.getAttachments(id)));
    }

    // POST /api/v1/tickets/{id}/attachments
    @PostMapping(value = "/{id}/attachments", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<ApiResponse<AttachmentResponse>> uploadAttachment(
            @PathVariable Long id,
            @RequestParam("file") MultipartFile file) {
        AttachmentResponse attachment = ticketService.addAttachment(id, file);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Attachment uploaded", attachment));
    }

    // GET /api/v1/tickets/{id}/attachments/{fileId}
    @GetMapping("/{id}/attachments/{fileId}")
    public ResponseEntity<byte[]> downloadAttachment(
            @PathVariable Long id,
            @PathVariable Long fileId) {
        byte[] data = ticketService.loadAttachment(id, fileId);
        String contentType = ticketService.getAttachmentContentType(fileId);
        return ResponseEntity.ok()
                .contentType(MediaType.parseMediaType(contentType))
                .body(data);
    }

    // DELETE /api/v1/tickets/{id}/attachments/{fileId}
    @DeleteMapping("/{id}/attachments/{fileId}")
    public ResponseEntity<ApiResponse<Void>> deleteAttachment(
            @PathVariable Long id,
            @PathVariable Long fileId) {
        ticketService.deleteAttachment(id, fileId);
        return ResponseEntity.status(HttpStatus.NO_CONTENT).body(ApiResponse.success(null));
    }

    // ─── Comments ─────────────────────────────────────────────────────────────

    // GET /api/v1/tickets/{id}/comments
    @GetMapping("/{id}/comments")
    public ResponseEntity<ApiResponse<List<CommentResponse>>> getComments(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success(ticketService.getComments(id)));
    }

    // POST /api/v1/tickets/{id}/comments
    @PostMapping("/{id}/comments")
    public ResponseEntity<ApiResponse<CommentResponse>> addComment(
            @PathVariable Long id,
            @AuthenticationPrincipal User currentUser,
            @Valid @RequestBody CommentRequest request) {
        CommentResponse comment = ticketService.addComment(id, currentUser.getId(), request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Comment added", comment));
    }

    // PUT /api/v1/tickets/{id}/comments/{commentId}
    @PutMapping("/{id}/comments/{commentId}")
    public ResponseEntity<ApiResponse<CommentResponse>> editComment(
            @PathVariable Long id,
            @PathVariable Long commentId,
            @AuthenticationPrincipal User currentUser,
            @Valid @RequestBody CommentRequest request) {
        return ResponseEntity.ok(ApiResponse.success("Comment updated",
                ticketService.editComment(id, commentId, currentUser.getId(), request)));
    }

    // DELETE /api/v1/tickets/{id}/comments/{commentId}
    @DeleteMapping("/{id}/comments/{commentId}")
    public ResponseEntity<ApiResponse<Void>> deleteComment(
            @PathVariable Long id,
            @PathVariable Long commentId,
            @AuthenticationPrincipal User currentUser) {
        boolean isAdmin = hasRole(currentUser, "ADMIN");
        ticketService.deleteComment(id, commentId, currentUser.getId(), isAdmin);
        return ResponseEntity.status(HttpStatus.NO_CONTENT).body(ApiResponse.success(null));
    }

    // ─── Helpers ──────────────────────────────────────────────────────────────

    private boolean hasRole(User user, String role) {
        return user.getRoles().stream().anyMatch(r -> r.getName().name().equals(role));
    }
}
