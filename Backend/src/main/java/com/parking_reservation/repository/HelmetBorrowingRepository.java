package com.parking_reservation.repository;

import com.parking_reservation.entity.HelmetBorrowing;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface HelmetBorrowingRepository extends JpaRepository<HelmetBorrowing, Long> {

    List<HelmetBorrowing> findByUserIdOrderByCreatedAtDesc(Long userId);

    List<HelmetBorrowing> findAllByOrderByCreatedAtDesc();

    Optional<HelmetBorrowing> findByBookingId(Long bookingId);
}
