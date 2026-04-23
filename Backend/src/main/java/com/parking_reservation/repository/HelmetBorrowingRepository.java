package com.parking_reservation.repository;

import com.parking_reservation.entity.HelmetBorrowing;
import com.parking_reservation.entity.HelmetBorrowing.BorrowStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface HelmetBorrowingRepository extends JpaRepository<HelmetBorrowing, Long> {

    List<HelmetBorrowing> findByUserIdOrderByCreatedAtDesc(Long userId);

    List<HelmetBorrowing> findAllByOrderByCreatedAtDesc();

    // Prevents a student from submitting a new request while one is still PENDING or ISSUED
    boolean existsByUserIdAndStatusIn(Long userId, List<BorrowStatus> statuses);
}
