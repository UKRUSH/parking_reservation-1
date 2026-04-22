package com.parking_reservation.dto.response;

import com.parking_reservation.entity.HelmetBorrowing;
import lombok.Data;

import java.time.LocalDateTime;

@Data
public class HelmetBorrowingResponse {

    private Long id;
    private Long userId;
    private String userName;
    private String userEmail;
    private String status;
    private String purpose;
    private String rejectionReason;
    private LocalDateTime issuedAt;
    private LocalDateTime returnedAt;
    private LocalDateTime createdAt;

    public static HelmetBorrowingResponse from(HelmetBorrowing h) {
        HelmetBorrowingResponse r = new HelmetBorrowingResponse();
        r.setId(h.getId());
        r.setUserId(h.getUser().getId());
        r.setUserName(h.getUser().getName());
        r.setUserEmail(h.getUser().getEmail());
        r.setStatus(h.getStatus().name());
        r.setPurpose(h.getPurpose());
        r.setRejectionReason(h.getRejectionReason());
        r.setIssuedAt(h.getIssuedAt());
        r.setReturnedAt(h.getReturnedAt());
        r.setCreatedAt(h.getCreatedAt());
        return r;
    }
}
