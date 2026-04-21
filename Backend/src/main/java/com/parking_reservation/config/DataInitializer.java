package com.parking_reservation.config;

import com.parking_reservation.entity.ParkingSlot;
import com.parking_reservation.entity.ParkingSlot.SlotStatus;
import com.parking_reservation.repository.ParkingBookingRepository;
import com.parking_reservation.repository.ParkingSlotRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.List;

@Component
@RequiredArgsConstructor
public class DataInitializer implements ApplicationRunner {

    // Car: A–J (10 zones), Motorcycle: A–H (8 zones), SUV: A–H (8 zones)
    // Slot numbers use type prefix to stay unique: CA01, MA01, SA01, etc.
    private static final int EXPECTED_TOTAL = 624; // (10 + 8 + 8) zones × 24 slots

    private final ParkingSlotRepository slotRepository;
    private final ParkingBookingRepository bookingRepository;

    @Override
    public void run(ApplicationArguments args) {
        if (slotRepository.count() == EXPECTED_TOTAL) return;

        // Delete bookings first to avoid FK constraint violation on slot delete
        bookingRepository.deleteAll();
        slotRepository.deleteAll();

        List<ParkingSlot> slots = new ArrayList<>();

        // Car zones A–J  (slot prefix C)
        for (char z = 'A'; z <= 'J'; z++) {
            addZone(slots, String.valueOf(z), "C" + z, "CAR", 24);
        }
        // Motorcycle zones A–H  (slot prefix M)
        for (char z = 'A'; z <= 'H'; z++) {
            addZone(slots, String.valueOf(z), "M" + z, "MOTORCYCLE", 24);
        }
        // SUV zones A–H  (slot prefix S)
        for (char z = 'A'; z <= 'H'; z++) {
            addZone(slots, String.valueOf(z), "S" + z, "SUV", 24);
        }

        slotRepository.saveAll(slots);
    }

    private void addZone(List<ParkingSlot> list, String zone, String slotPrefix, String type, int count) {
        for (int i = 1; i <= count; i++) {
            ParkingSlot s = new ParkingSlot();
            s.setSlotNumber(slotPrefix + String.format("%02d", i));
            s.setZone(zone);
            s.setType(type);
            s.setStatus(SlotStatus.AVAILABLE);
            list.add(s);
        }
    }
}
