package com.parking_reservation.dto.response;

import com.parking_reservation.entity.ParkingSlot;
import lombok.Data;

@Data
public class ParkingSlotResponse {

    private Long id;
    private String slotNumber;
    private String zone;
    private String type;
    private String status;
    private boolean available;

    public static ParkingSlotResponse from(ParkingSlot slot, boolean available) {
        ParkingSlotResponse r = new ParkingSlotResponse();
        r.setId(slot.getId());
        r.setSlotNumber(slot.getSlotNumber());
        r.setZone(slot.getZone());
        r.setType(slot.getType());
        r.setStatus(slot.getStatus().name());
        r.setAvailable(available);
        return r;
    }
}
