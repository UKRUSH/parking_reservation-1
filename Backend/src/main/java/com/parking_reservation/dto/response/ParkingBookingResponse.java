package com.parking_reservation.dto.response;

import com.parking_reservation.entity.ParkingBooking;
import lombok.Data;

import java.time.LocalDateTime;

@Data
public class ParkingBookingResponse {

    private Long id;
    private Long userId;
    private String userName;
    private Long slotId;
    private String slotNumber;
    private String zone;
    private LocalDateTime startTime;
    private LocalDateTime endTime;
    private String status;
    private String purpose;
    private String rejectionReason;
    private LocalDateTime createdAt;

    public static ParkingBookingResponse from(ParkingBooking b) {
        ParkingBookingResponse r = new ParkingBookingResponse();
        r.setId(b.getId());
        r.setUserId(b.getUser().getId());
        r.setUserName(b.getUser().getName());
        r.setSlotId(b.getSlot().getId());
        r.setSlotNumber(b.getSlot().getSlotNumber());
        r.setZone(b.getSlot().getZone());
        r.setStartTime(b.getStartTime());
        r.setEndTime(b.getEndTime());
        r.setStatus(b.getStatus().name());
        r.setPurpose(b.getPurpose());
        r.setRejectionReason(b.getRejectionReason());
        r.setCreatedAt(b.getCreatedAt());
        return r;
    }
}
