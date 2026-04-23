package com.parking_reservation.dto.response;

import com.parking_reservation.entity.Helmet;
import lombok.Data;

import java.time.LocalDateTime;

@Data
public class HelmetResponse {

    private Long id;
    private String serialNumber;
    private String size;
    private String condition;
    private String status;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public static HelmetResponse from(Helmet h) {
        HelmetResponse r = new HelmetResponse();
        r.setId(h.getId());
        r.setSerialNumber(h.getSerialNumber());
        r.setSize(h.getSize().name());
        r.setCondition(h.getCondition().name());
        r.setStatus(h.getStatus().name());
        r.setCreatedAt(h.getCreatedAt());
        r.setUpdatedAt(h.getUpdatedAt());
        return r;
    }
}
