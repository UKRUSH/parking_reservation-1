package com.parking_reservation.repository;

import com.parking_reservation.entity.ParkingSlot;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ParkingSlotRepository extends JpaRepository<ParkingSlot, Long> {

    List<ParkingSlot> findByTypeIgnoreCase(String type);

    boolean existsBySlotNumber(String slotNumber);

    List<ParkingSlot> findByZoneIgnoreCaseAndTypeIgnoreCase(String zone, String type);

    boolean existsByZoneIgnoreCaseAndTypeIgnoreCase(String zone, String type);
}
