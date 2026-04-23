package com.parking_reservation.dto.response;

import com.parking_reservation.entity.TicketComment;
import lombok.Data;

import java.time.LocalDateTime;

@Data
public class CommentResponse {

    private Long id;
    private Long authorId;
    private String authorName;
    private String authorEmail;
    private String content;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public static CommentResponse from(TicketComment c) {
        CommentResponse r = new CommentResponse();
        r.setId(c.getId());
        r.setAuthorId(c.getAuthor().getId());
        r.setAuthorName(c.getAuthor().getName());
        r.setAuthorEmail(c.getAuthor().getEmail());
        r.setContent(c.getContent());
        r.setCreatedAt(c.getCreatedAt());
        r.setUpdatedAt(c.getUpdatedAt());
        return r;
    }
}
