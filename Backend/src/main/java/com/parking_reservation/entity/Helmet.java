package com.parking_reservation.entity;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name = "helmets")
@Data
@NoArgsConstructor
public class Helmet {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String serialNumber;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private HelmetSize size;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private HelmetCondition condition;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private HelmetStatus status = HelmetStatus.AVAILABLE;

    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    @PrePersist
    void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    void onUpdate() {
        updatedAt = LocalDateTime.now();
    }

    public enum HelmetSize { SMALL, MEDIUM, LARGE }

    public enum HelmetCondition { GOOD, FAIR, POOR }

    public enum HelmetStatus { AVAILABLE, IN_USE, RETIRED }
}
