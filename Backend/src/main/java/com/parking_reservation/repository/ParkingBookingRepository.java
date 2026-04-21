package com.parking_reservation.repository;

import com.parking_reservation.entity.ParkingBooking;
import com.parking_reservation.entity.ParkingBooking.BookingStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface ParkingBookingRepository extends JpaRepository<ParkingBooking, Long> {

    List<ParkingBooking> findByUserIdOrderByCreatedAtDesc(Long userId);

    List<ParkingBooking> findAllByOrderByCreatedAtDesc();

    @Query("SELECT COUNT(b) FROM ParkingBooking b " +
           "WHERE b.slot.id = :slotId " +
           "AND b.status = :status " +
           "AND b.startTime < :endTime AND b.endTime > :startTime")
    long countConflictingBookings(
            @Param("slotId") Long slotId,
            @Param("status") BookingStatus status,
            @Param("startTime") LocalDateTime startTime,
            @Param("endTime") LocalDateTime endTime);

    @Query("SELECT b.slot.id FROM ParkingBooking b " +
           "WHERE b.status = :status " +
           "AND b.startTime < :endTime AND b.endTime > :startTime")
    List<Long> findOccupiedSlotIds(
            @Param("status") BookingStatus status,
            @Param("startTime") LocalDateTime startTime,
            @Param("endTime") LocalDateTime endTime);
}
