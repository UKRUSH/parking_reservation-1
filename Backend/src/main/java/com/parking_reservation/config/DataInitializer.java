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

    private static final int EXPECTED_TOTAL = 144; // 6 zones × 24 slots

    private final ParkingSlotRepository slotRepository;

    @Override
    public void run(ApplicationArguments args) {
        if (slotRepository.count() == EXPECTED_TOTAL) return;

        slotRepository.deleteAll();

        List<ParkingSlot> slots = new ArrayList<>();

        // Car zones — A, B, C (24 slots each)
        addZone(slots, "A", "CAR",        24);
        addZone(slots, "B", "CAR",        24);
        addZone(slots, "C", "CAR",        24);

        // Motorcycle zones — D, E (24 slots each)
        addZone(slots, "D", "MOTORCYCLE", 24);
        addZone(slots, "E", "MOTORCYCLE", 24);

        // Bicycle zone — F (24 slots)
        addZone(slots, "F", "BICYCLE",    24);

        slotRepository.saveAll(slots);
    }

    private void addZone(List<ParkingSlot> list, String zone, String type, int count) {
        for (int i = 1; i <= count; i++) {
            ParkingSlot s = new ParkingSlot();
            s.setSlotNumber(zone + String.format("%02d", i));
            s.setZone(zone);
            s.setType(type);
            s.setStatus(SlotStatus.AVAILABLE);
            list.add(s);
        }
    }
}
