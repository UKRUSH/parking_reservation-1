package com.parking_reservation.repository;

import com.parking_reservation.entity.IncidentTicket;
import com.parking_reservation.entity.IncidentTicket.TicketStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface IncidentTicketRepository extends JpaRepository<IncidentTicket, Long> {

    List<IncidentTicket> findByDeletedFalseOrderByCreatedAtDesc();

    List<IncidentTicket> findByUserIdAndDeletedFalseOrderByCreatedAtDesc(Long userId);

    @Query("SELECT t FROM IncidentTicket t WHERE t.deleted = false AND t.status = :status ORDER BY t.createdAt DESC")
    List<IncidentTicket> findByStatusAndDeletedFalse(@Param("status") TicketStatus status);

    @Query("SELECT t FROM IncidentTicket t WHERE t.deleted = false AND t.technician.id = :technicianId ORDER BY t.createdAt DESC")
    List<IncidentTicket> findByTechnicianIdAndDeletedFalse(@Param("technicianId") Long technicianId);

    Optional<IncidentTicket> findByIdAndDeletedFalse(Long id);
}
