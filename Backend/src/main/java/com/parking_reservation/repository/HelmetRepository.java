package com.parking_reservation.repository;

import com.parking_reservation.entity.Helmet;
import com.parking_reservation.entity.Helmet.HelmetCondition;
import com.parking_reservation.entity.Helmet.HelmetSize;
import com.parking_reservation.entity.Helmet.HelmetStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface HelmetRepository extends JpaRepository<Helmet, Long> {

    boolean existsBySerialNumber(String serialNumber);

    @Query("""
            SELECT h FROM Helmet h
            WHERE (:size IS NULL OR h.size = :size)
              AND (:status IS NULL OR h.status = :status)
              AND (:condition IS NULL OR h.condition = :condition)
            ORDER BY h.id ASC
            """)
    List<Helmet> findWithFilters(
            @Param("size") HelmetSize size,
            @Param("status") HelmetStatus status,
            @Param("condition") HelmetCondition condition);
}
