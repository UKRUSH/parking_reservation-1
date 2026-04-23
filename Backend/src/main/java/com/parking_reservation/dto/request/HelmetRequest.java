package com.parking_reservation.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class HelmetRequest {

    @NotBlank(message = "Serial number is required")
    private String serialNumber;

    @NotBlank(message = "Size is required")
    private String size;

    @NotBlank(message = "Condition is required")
    private String condition;

    private String status;
}
