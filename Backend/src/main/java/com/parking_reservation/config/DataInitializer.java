package com.parking_reservation.config;

import com.parking_reservation.entity.ParkingSlot;
import com.parking_reservation.entity.ParkingSlot.SlotStatus;
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

    private static final int SLOTS_PER_ZONE = 12;
    private static final int EXPECTED_TOTAL = 48; // 4 zones × 12 slots

    private final ParkingSlotRepository slotRepository;

    @Override
    public void run(ApplicationArguments args) {
        if (slotRepository.count() == EXPECTED_TOTAL) return;

        // Clear old seed data and re-seed with correct layout
        slotRepository.deleteAll();

        List<ParkingSlot> slots = new ArrayList<>();

        // Zone A — CAR (12 slots)
        for (int i = 1; i <= SLOTS_PER_ZONE; i++) {
            slots.add(makeSlot("A" + String.format("%02d", i), "A", "CAR"));
        }

        // Zone B — CAR (12 slots)
        for (int i = 1; i <= SLOTS_PER_ZONE; i++) {
            slots.add(makeSlot("B" + String.format("%02d", i), "B", "CAR"));
        }

        // Zone C — MOTORCYCLE (12 slots)
        for (int i = 1; i <= SLOTS_PER_ZONE; i++) {
            slots.add(makeSlot("C" + String.format("%02d", i), "C", "MOTORCYCLE"));
        }

        // Zone D — BICYCLE (12 slots)
        for (int i = 1; i <= SLOTS_PER_ZONE; i++) {
            slots.add(makeSlot("D" + String.format("%02d", i), "D", "BICYCLE"));
        }

        slotRepository.saveAll(slots);
    }

    private ParkingSlot makeSlot(String number, String zone, String type) {
        ParkingSlot s = new ParkingSlot();
        s.setSlotNumber(number);
        s.setZone(zone);
        s.setType(type);
        s.setStatus(SlotStatus.AVAILABLE);
        return s;
    }
}
