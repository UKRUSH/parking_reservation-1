package com.parking_reservation.dto.response;

import com.parking_reservation.entity.IncidentTicket;
import lombok.Data;

import java.time.LocalDateTime;

@Data
public class TicketResponse {

    private Long id;
    private Long userId;
    private String userName;
    private String userEmail;
    private String title;
    private String description;
    private String location;
    private String status;
    private String priority;
    private Long technicianId;
    private String technicianName;
    private String technicianNotes;
    private String rejectionReason;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public static TicketResponse from(IncidentTicket t) {
        TicketResponse r = new TicketResponse();
        r.setId(t.getId());
        r.setUserId(t.getUser().getId());
        r.setUserName(t.getUser().getName());
        r.setUserEmail(t.getUser().getEmail());
        r.setTitle(t.getTitle());
        r.setDescription(t.getDescription());
        r.setLocation(t.getLocation());
        r.setStatus(t.getStatus().name());
        r.setPriority(t.getPriority().name());
        if (t.getTechnician() != null) {
            r.setTechnicianId(t.getTechnician().getId());
            r.setTechnicianName(t.getTechnician().getName());
        }
        r.setTechnicianNotes(t.getTechnicianNotes());
        r.setRejectionReason(t.getRejectionReason());
        r.setCreatedAt(t.getCreatedAt());
        r.setUpdatedAt(t.getUpdatedAt());
        return r;
    }
}
