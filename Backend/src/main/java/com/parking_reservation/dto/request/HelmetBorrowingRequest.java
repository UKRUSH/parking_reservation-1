package com.parking_reservation.dto.request;

import lombok.Data;

@Data
public class HelmetBorrowingRequest {
    private String purpose;
    private int quantity = 1;
}
