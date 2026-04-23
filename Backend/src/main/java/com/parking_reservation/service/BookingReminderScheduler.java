package com.parking_reservation.service;

import com.parking_reservation.entity.NotificationType;
import com.parking_reservation.entity.ParkingBooking;
import com.parking_reservation.repository.ParkingBookingRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;

@Component
@RequiredArgsConstructor
public class BookingReminderScheduler {

    private final ParkingBookingRepository bookingRepository;
    private final NotificationService notificationService;

    private static final DateTimeFormatter TIME_FMT = DateTimeFormatter.ofPattern("hh:mm a");

    // Runs every minute
    @Scheduled(fixedDelay = 60000)
    @Transactional
    public void sendReminders() {
        LocalDateTime now = LocalDateTime.now();

        // 1. Ending-soon: bookings whose endTime is within the next 5 minutes
        List<ParkingBooking> endingSoon = bookingRepository.findEndingSoon(now, now.plusMinutes(5));
        for (ParkingBooking b : endingSoon) {
            notificationService.send(
                    b.getUser().getId(),
                    NotificationType.BOOKING_ENDING_SOON,
                    "Parking Ending Soon",
                    "Your booking for slot " + b.getSlot().getSlotNumber() +
                    " (Zone " + b.getSlot().getZone() + ") ends at " +
                    b.getEndTime().format(TIME_FMT) + ". Please prepare to vacate."
            );
            b.setEndingSoonNotified(true);
            bookingRepository.save(b);
        }

        // 2. Ended: bookings whose endTime passed in the last 2 minutes
        List<ParkingBooking> justEnded = bookingRepository.findJustEnded(now.minusMinutes(2), now);
        for (ParkingBooking b : justEnded) {
            notificationService.send(
                    b.getUser().getId(),
                    NotificationType.BOOKING_ENDED,
                    "Parking Time Ended",
                    "Your booking for slot " + b.getSlot().getSlotNumber() +
                    " (Zone " + b.getSlot().getZone() + ") has ended. Thank you!"
            );
            b.setEndedNotified(true);
            bookingRepository.save(b);
        }
    }
}
