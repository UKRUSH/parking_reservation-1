package com.parking_reservation.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class ParkingSlotRequest {

    @NotBlank(message = "Slot number is required")
    private String slotNumber;

    @NotBlank(message = "Zone is required")
    private String zone;

    @NotBlank(message = "Type is required")
    private String type;

    private String status;
}
