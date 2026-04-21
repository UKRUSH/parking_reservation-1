package com.parking_reservation.service;

import com.parking_reservation.dto.request.ParkingBookingRequest;
import com.parking_reservation.dto.response.ParkingBookingResponse;
import com.parking_reservation.entity.ParkingBooking;
import com.parking_reservation.entity.ParkingBooking.BookingStatus;
import com.parking_reservation.entity.ParkingSlot;
import com.parking_reservation.entity.User;
import com.parking_reservation.exception.BookingConflictException;
import com.parking_reservation.exception.ResourceNotFoundException;
import com.parking_reservation.repository.ParkingBookingRepository;
import com.parking_reservation.repository.ParkingSlotRepository;
import com.parking_reservation.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ParkingBookingService {

    private final ParkingBookingRepository bookingRepository;
    private final ParkingSlotRepository slotRepository;
    private final UserRepository userRepository;

    @Transactional(readOnly = true)
    public List<ParkingBookingResponse> getBookingsForUser(Long userId) {
        return bookingRepository.findByUserIdOrderByCreatedAtDesc(userId).stream()
                .map(ParkingBookingResponse::from)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<ParkingBookingResponse> getAllBookings() {
        return bookingRepository.findAllByOrderByCreatedAtDesc().stream()
                .map(ParkingBookingResponse::from)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public ParkingBookingResponse getBookingById(Long id) {
        return ParkingBookingResponse.from(findBooking(id));
    }

    @Transactional
    public ParkingBookingResponse createBooking(Long userId, ParkingBookingRequest request) {
        if (!request.getEndTime().isAfter(request.getStartTime())) {
            throw new IllegalArgumentException("End time must be after start time");
        }

        boolean conflict = bookingRepository.existsConflictingBooking(
                request.getSlotId(), BookingStatus.APPROVED,
                request.getStartTime(), request.getEndTime());
        if (conflict) {
            throw new BookingConflictException("Slot is already booked for the requested time range");
        }

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + userId));
        ParkingSlot slot = slotRepository.findById(request.getSlotId())
                .orElseThrow(() -> new ResourceNotFoundException("Parking slot not found: " + request.getSlotId()));

        ParkingBooking booking = new ParkingBooking();
        booking.setUser(user);
        booking.setSlot(slot);
        booking.setStartTime(request.getStartTime());
        booking.setEndTime(request.getEndTime());
        booking.setPurpose(request.getPurpose());

        return ParkingBookingResponse.from(bookingRepository.save(booking));
    }

    @Transactional
    public ParkingBookingResponse approveBooking(Long bookingId) {
        ParkingBooking booking = findBooking(bookingId);
        assertStatus(booking, BookingStatus.PENDING, "Only PENDING bookings can be approved");
        booking.setStatus(BookingStatus.APPROVED);
        return ParkingBookingResponse.from(bookingRepository.save(booking));
    }

    @Transactional
    public ParkingBookingResponse rejectBooking(Long bookingId, String reason) {
        ParkingBooking booking = findBooking(bookingId);
        assertStatus(booking, BookingStatus.PENDING, "Only PENDING bookings can be rejected");
        booking.setStatus(BookingStatus.REJECTED);
        booking.setRejectionReason(reason);
        return ParkingBookingResponse.from(bookingRepository.save(booking));
    }

    @Transactional
    public ParkingBookingResponse cancelBooking(Long bookingId) {
        ParkingBooking booking = findBooking(bookingId);
        if (booking.getStatus() == BookingStatus.REJECTED || booking.getStatus() == BookingStatus.CANCELLED) {
            throw new IllegalArgumentException("Booking cannot be cancelled in its current state");
        }
        booking.setStatus(BookingStatus.CANCELLED);
        return ParkingBookingResponse.from(bookingRepository.save(booking));
    }

    @Transactional(readOnly = true)
    public boolean checkConflict(Long slotId, LocalDateTime startTime, LocalDateTime endTime) {
        return bookingRepository.existsConflictingBooking(slotId, BookingStatus.APPROVED, startTime, endTime);
    }

    private ParkingBooking findBooking(Long id) {
        return bookingRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Booking not found: " + id));
    }

    private void assertStatus(ParkingBooking booking, BookingStatus expected, String message) {
        if (booking.getStatus() != expected) {
            throw new IllegalArgumentException(message);
        }
    }
}
