package com.parking_reservation.dto.request;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class ZoneRequest {

    @NotBlank(message = "Zone is required")
    private String zone;

    @NotBlank(message = "Type is required")
    private String type;

    @NotBlank(message = "Slot prefix is required")
    private String slotPrefix;

    @Min(value = 1, message = "Count must be at least 1")
    @Max(value = 100, message = "Count cannot exceed 100")
    private int count = 24;
}
