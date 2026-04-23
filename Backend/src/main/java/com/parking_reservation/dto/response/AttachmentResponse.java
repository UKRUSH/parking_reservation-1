package com.parking_reservation.dto.response;

import com.parking_reservation.entity.TicketAttachment;
import lombok.Data;

import java.time.LocalDateTime;

@Data
public class AttachmentResponse {

    private Long id;
    private String originalName;
    private String contentType;
    private Long fileSize;
    private LocalDateTime createdAt;

    public static AttachmentResponse from(TicketAttachment a) {
        AttachmentResponse r = new AttachmentResponse();
        r.setId(a.getId());
        r.setOriginalName(a.getOriginalName());
        r.setContentType(a.getContentType());
        r.setFileSize(a.getFileSize());
        r.setCreatedAt(a.getCreatedAt());
        return r;
    }
}
