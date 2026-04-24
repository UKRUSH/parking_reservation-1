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
    private int quantity;
    private String rejectionReason;
    private LocalDateTime issuedAt;
    private LocalDateTime returnedAt;
    private LocalDateTime createdAt;

    // Linked booking info (null for standalone requests)
    private Long bookingId;
    private String slotNumber;
    private String zone;
    private LocalDateTime bookingStart;
    private LocalDateTime bookingEnd;

    public static HelmetBorrowingResponse from(HelmetBorrowing h) {
        HelmetBorrowingResponse r = new HelmetBorrowingResponse();
        r.setId(h.getId());
        r.setUserId(h.getUser().getId());
        r.setUserName(h.getUser().getName());
        r.setUserEmail(h.getUser().getEmail());
        r.setStatus(h.getStatus().name());
        r.setPurpose(h.getPurpose());
        r.setQuantity(h.getQuantity() > 0 ? h.getQuantity() : 1);
        r.setRejectionReason(h.getRejectionReason());
        r.setIssuedAt(h.getIssuedAt());
        r.setReturnedAt(h.getReturnedAt());
        r.setCreatedAt(h.getCreatedAt());
        if (h.getBooking() != null) {
            r.setBookingId(h.getBooking().getId());
            r.setSlotNumber(h.getBooking().getSlot().getSlotNumber());
            r.setZone(h.getBooking().getSlot().getZone());
            r.setBookingStart(h.getBooking().getStartTime());
            r.setBookingEnd(h.getBooking().getEndTime());
        }
        return r;
    }
}
