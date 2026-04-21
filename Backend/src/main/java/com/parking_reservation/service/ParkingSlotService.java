package com.parking_reservation.service;

import com.parking_reservation.dto.response.ParkingSlotResponse;
import com.parking_reservation.entity.ParkingBooking.BookingStatus;
import com.parking_reservation.entity.ParkingSlot;
import com.parking_reservation.entity.ParkingSlot.SlotStatus;
import com.parking_reservation.repository.ParkingBookingRepository;
import com.parking_reservation.repository.ParkingSlotRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ParkingSlotService {

    private final ParkingSlotRepository slotRepository;
    private final ParkingBookingRepository bookingRepository;

    @Transactional(readOnly = true)
    public List<ParkingSlotResponse> getSlots(String type, LocalDateTime start, LocalDateTime end) {
        List<ParkingSlot> slots = (type != null && !type.isBlank())
                ? slotRepository.findByTypeIgnoreCase(type)
                : slotRepository.findAll();

        Set<Long> occupiedIds = new HashSet<>(
                bookingRepository.findOccupiedSlotIds(BookingStatus.APPROVED, start, end));

        return slots.stream()
                .map(s -> {
                    boolean available = s.getStatus() == SlotStatus.AVAILABLE
                            && !occupiedIds.contains(s.getId());
                    return ParkingSlotResponse.from(s, available);
                })
                .collect(Collectors.toList());
    }
}
