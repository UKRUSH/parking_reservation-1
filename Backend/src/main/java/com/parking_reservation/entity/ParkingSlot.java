package com.parking_reservation.entity;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "parking_slots")
@Data
@NoArgsConstructor
public class ParkingSlot {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String slotNumber;

    private String zone;
    private String type;

    @Enumerated(EnumType.STRING)
    private SlotStatus status = SlotStatus.AVAILABLE;

    public enum SlotStatus {
        AVAILABLE, OCCUPIED, MAINTENANCE
    }
}
