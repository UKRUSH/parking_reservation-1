package com.parking_reservation.config;

import com.parking_reservation.entity.ParkingSlot;
import com.parking_reservation.entity.ParkingSlot.SlotStatus;
import com.parking_reservation.entity.Role;
import com.parking_reservation.entity.RoleType;
import com.parking_reservation.entity.User;
import com.parking_reservation.repository.ParkingBookingRepository;
import com.parking_reservation.repository.ParkingSlotRepository;
import com.parking_reservation.repository.RoleRepository;
import com.parking_reservation.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.List;
import java.util.Set;

@Component
@RequiredArgsConstructor
public class DataInitializer implements ApplicationRunner {

    // Car: A–J (10 zones), Motorcycle: A–H (8 zones), SUV: A–H (8 zones)
    // Slot numbers use type prefix to stay unique: CA01, MA01, SA01, etc.
    private static final int EXPECTED_TOTAL = 624; // (10 + 8 + 8) zones × 24 slots

    private static final String ADMIN_EMAIL    = "admin@smartcampus.com";
    private static final String ADMIN_PASSWORD = "admin1234";
    private static final String ADMIN_NAME     = "Admin";

    private final ParkingSlotRepository slotRepository;
    private final ParkingBookingRepository bookingRepository;
    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public void run(ApplicationArguments args) {
        seedAdminUser();

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

    private void seedAdminUser() {
        if (userRepository.existsByEmail(ADMIN_EMAIL)) return;

        Role adminRole = roleRepository.findByName(RoleType.ADMIN)
                .orElseGet(() -> roleRepository.save(new Role(RoleType.ADMIN)));

        User admin = new User();
        admin.setName(ADMIN_NAME);
        admin.setEmail(ADMIN_EMAIL);
        admin.setPassword(passwordEncoder.encode(ADMIN_PASSWORD));
        admin.setActive(true);
        admin.setRoles(Set.of(adminRole));
        userRepository.save(admin);
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
