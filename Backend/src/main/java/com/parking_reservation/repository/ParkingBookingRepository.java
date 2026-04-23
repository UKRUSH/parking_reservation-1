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

    void deleteBySlotIdIn(List<Long> slotIds);

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

    @Query("SELECT b FROM ParkingBooking b " +
           "WHERE b.slot.id = :slotId " +
           "AND b.status != :cancelled " +
           "AND b.status != :rejected " +
           "AND b.startTime >= :from " +
           "ORDER BY b.startTime ASC")
    List<ParkingBooking> findUpcomingBySlotId(
            @Param("slotId") Long slotId,
            @Param("cancelled") BookingStatus cancelled,
            @Param("rejected") BookingStatus rejected,
            @Param("from") LocalDateTime from);

    @Query("SELECT b FROM ParkingBooking b " +
           "WHERE b.status = 'APPROVED' " +
           "AND b.endingSoonNotified = false " +
           "AND b.endTime >= :from AND b.endTime <= :to")
    List<ParkingBooking> findEndingSoon(
            @Param("from") LocalDateTime from,
            @Param("to") LocalDateTime to);

    @Query("SELECT b FROM ParkingBooking b " +
           "WHERE b.status = 'APPROVED' " +
           "AND b.endedNotified = false " +
           "AND b.endTime >= :from AND b.endTime <= :to")
    List<ParkingBooking> findJustEnded(
            @Param("from") LocalDateTime from,
            @Param("to") LocalDateTime to);
}
