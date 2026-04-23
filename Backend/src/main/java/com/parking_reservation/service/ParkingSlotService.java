package com.parking_reservation.service;

import com.parking_reservation.dto.request.ParkingSlotRequest;
import com.parking_reservation.dto.request.ZoneRequest;
import com.parking_reservation.dto.response.ParkingSlotResponse;
import com.parking_reservation.entity.ParkingBooking.BookingStatus;
import com.parking_reservation.entity.ParkingSlot;
import com.parking_reservation.entity.ParkingSlot.SlotStatus;
import com.parking_reservation.exception.ResourceNotFoundException;
import com.parking_reservation.repository.ParkingBookingRepository;
import com.parking_reservation.repository.ParkingSlotRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.ArrayList;
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

    @Transactional(readOnly = true)
    public ParkingSlotResponse getSlotById(Long id) {
        ParkingSlot slot = slotRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Parking slot not found: " + id));
        return ParkingSlotResponse.from(slot, slot.getStatus() == SlotStatus.AVAILABLE);
    }

    @Transactional
    public ParkingSlotResponse createSlot(ParkingSlotRequest request) {
        String slotNum = request.getSlotNumber().trim().toUpperCase();
        if (slotRepository.existsBySlotNumber(slotNum)) {
            throw new IllegalArgumentException("Slot number already exists: " + slotNum);
        }
        ParkingSlot slot = new ParkingSlot();
        slot.setSlotNumber(slotNum);
        slot.setZone(request.getZone().trim().toUpperCase());
        slot.setType(request.getType().trim().toUpperCase());
        slot.setStatus(SlotStatus.AVAILABLE);
        return ParkingSlotResponse.from(slotRepository.save(slot), true);
    }

    @Transactional
    public ParkingSlotResponse updateSlot(Long id, ParkingSlotRequest request) {
        ParkingSlot slot = slotRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Parking slot not found: " + id));

        String newSlotNum = request.getSlotNumber().trim().toUpperCase();
        if (!slot.getSlotNumber().equalsIgnoreCase(newSlotNum)
                && slotRepository.existsBySlotNumber(newSlotNum)) {
            throw new IllegalArgumentException("Slot number already exists: " + newSlotNum);
        }

        slot.setSlotNumber(newSlotNum);
        slot.setZone(request.getZone().trim().toUpperCase());
        slot.setType(request.getType().trim().toUpperCase());

        ParkingSlot saved = slotRepository.save(slot);
        return ParkingSlotResponse.from(saved, saved.getStatus() == SlotStatus.AVAILABLE);
    }

    @Transactional
    public ParkingSlotResponse updateSlotStatus(Long id, String status) {
        ParkingSlot slot = slotRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Parking slot not found: " + id));
        SlotStatus newStatus;
        try {
            newStatus = SlotStatus.valueOf(status.trim().toUpperCase());
        } catch (IllegalArgumentException e) {
            throw new IllegalArgumentException("Invalid status: " + status + ". Must be AVAILABLE, OCCUPIED or MAINTENANCE");
        }
        slot.setStatus(newStatus);
        ParkingSlot saved = slotRepository.save(slot);
        return ParkingSlotResponse.from(saved, saved.getStatus() == SlotStatus.AVAILABLE);
    }

    @Transactional
    public void deleteSlot(Long id) {
        if (!slotRepository.existsById(id)) {
            throw new ResourceNotFoundException("Parking slot not found: " + id);
        }
        slotRepository.deleteById(id);
    }

    @Transactional
    public List<ParkingSlotResponse> createZone(ZoneRequest request) {
        String zone   = request.getZone().trim().toUpperCase();
        String type   = request.getType().trim().toUpperCase();
        String prefix = request.getSlotPrefix().trim().toUpperCase();

        if (slotRepository.existsByZoneIgnoreCaseAndTypeIgnoreCase(zone, type)) {
            throw new IllegalArgumentException(
                    "Zone " + zone + " (" + type + ") already exists. Choose a different zone letter or type.");
        }

        List<ParkingSlot> slots = new ArrayList<>();
        for (int i = 1; i <= request.getCount(); i++) {
            String slotNum = prefix + String.format("%02d", i);
            if (slotRepository.existsBySlotNumber(slotNum)) {
                throw new IllegalArgumentException("Slot number " + slotNum + " already exists.");
            }
            ParkingSlot slot = new ParkingSlot();
            slot.setSlotNumber(slotNum);
            slot.setZone(zone);
            slot.setType(type);
            slot.setStatus(SlotStatus.AVAILABLE);
            slots.add(slot);
        }

        return slotRepository.saveAll(slots).stream()
                .map(s -> ParkingSlotResponse.from(s, true))
                .collect(Collectors.toList());
    }

    @Transactional
    public void deleteZone(String zone, String type) {
        List<ParkingSlot> slots = slotRepository.findByZoneIgnoreCaseAndTypeIgnoreCase(zone, type);
        if (slots.isEmpty()) {
            throw new ResourceNotFoundException("Zone " + zone + " (" + type + ") not found.");
        }
        List<Long> slotIds = slots.stream().map(ParkingSlot::getId).collect(Collectors.toList());
        bookingRepository.deleteBySlotIdIn(slotIds);
        slotRepository.deleteAll(slots);
    }
}
