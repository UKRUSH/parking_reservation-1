package com.parking_reservation.service;

import com.parking_reservation.dto.request.HelmetBorrowingRequest;
import com.parking_reservation.dto.response.HelmetBorrowingResponse;
import com.parking_reservation.entity.HelmetBorrowing;
import com.parking_reservation.entity.HelmetBorrowing.BorrowStatus;
import com.parking_reservation.entity.NotificationType;
import com.parking_reservation.entity.ParkingBooking;
import com.parking_reservation.entity.User;
import com.parking_reservation.exception.BookingConflictException;
import com.parking_reservation.exception.ResourceNotFoundException;
import com.parking_reservation.repository.HelmetBorrowingRepository;
import com.parking_reservation.repository.ParkingBookingRepository;
import com.parking_reservation.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class HelmetBorrowingService {

    private final HelmetBorrowingRepository borrowingRepository;
    private final UserRepository userRepository;
    private final ParkingBookingRepository bookingRepository;
    private final NotificationService notificationService;

    @Transactional(readOnly = true)
    public List<HelmetBorrowingResponse> getBorrowingsForUser(Long userId) {
        return borrowingRepository.findByUserIdOrderByCreatedAtDesc(userId)
                .stream().map(HelmetBorrowingResponse::from).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<HelmetBorrowingResponse> getAllBorrowings() {
        return borrowingRepository.findAllByOrderByCreatedAtDesc()
                .stream().map(HelmetBorrowingResponse::from).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public HelmetBorrowingResponse getById(Long id) {
        return HelmetBorrowingResponse.from(findBorrowing(id));
    }

    @Transactional
    public HelmetBorrowingResponse requestBorrowing(Long userId, HelmetBorrowingRequest request) {
        boolean hasActive = borrowingRepository.existsByUserIdAndStatusIn(
                userId, List.of(BorrowStatus.PENDING, BorrowStatus.ISSUED));
        if (hasActive) {
            throw new BookingConflictException(
                    "You already have an active helmet borrowing request. " +
                    "Please wait until it is resolved before submitting a new one.");
        }

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + userId));

        int qty = (request.getQuantity() == 2) ? 2 : 1;

        HelmetBorrowing borrowing = new HelmetBorrowing();
        borrowing.setUser(user);
        borrowing.setPurpose(request.getPurpose());
        borrowing.setQuantity(qty);

        if (request.getBookingId() != null) {
            ParkingBooking booking = bookingRepository.findById(request.getBookingId()).orElse(null);
            borrowing.setBooking(booking);
        }

        return HelmetBorrowingResponse.from(borrowingRepository.save(borrowing));
    }

    @Transactional
    public HelmetBorrowingResponse issueBorrowing(Long id) {
        HelmetBorrowing borrowing = findBorrowing(id);
        assertStatus(borrowing, BorrowStatus.PENDING, "Only PENDING borrowings can be issued");
        borrowing.setStatus(BorrowStatus.ISSUED);
        borrowing.setIssuedAt(LocalDateTime.now());
        HelmetBorrowingResponse response = HelmetBorrowingResponse.from(borrowingRepository.save(borrowing));
        String helmetWord = borrowing.getQuantity() == 2 ? "2 helmets have" : "Your helmet has";
        notificationService.send(
                borrowing.getUser().getId(),
                NotificationType.HELMET_ISSUED,
                "Helmet Issued",
                helmetWord + " been approved. Please collect from the admin office."
        );
        return response;
    }

    @Transactional
    public HelmetBorrowingResponse rejectBorrowing(Long id, String reason) {
        HelmetBorrowing borrowing = findBorrowing(id);
        assertStatus(borrowing, BorrowStatus.PENDING, "Only PENDING borrowings can be rejected");
        borrowing.setStatus(BorrowStatus.REJECTED);
        borrowing.setRejectionReason(reason);
        HelmetBorrowingResponse response = HelmetBorrowingResponse.from(borrowingRepository.save(borrowing));
        notificationService.send(
                borrowing.getUser().getId(),
                NotificationType.HELMET_REJECTED,
                "Helmet Request Rejected",
                "Your helmet borrowing request was rejected. Reason: " + reason
        );
        return response;
    }

    @Transactional
    public HelmetBorrowingResponse returnBorrowing(Long id) {
        HelmetBorrowing borrowing = findBorrowing(id);
        assertStatus(borrowing, BorrowStatus.ISSUED, "Only ISSUED helmets can be marked as returned");
        borrowing.setStatus(BorrowStatus.RETURNED);
        borrowing.setReturnedAt(LocalDateTime.now());
        HelmetBorrowingResponse response = HelmetBorrowingResponse.from(borrowingRepository.save(borrowing));
        notificationService.send(
                borrowing.getUser().getId(),
                NotificationType.HELMET_RETURNED,
                "Helmet Returned",
                "Your helmet has been successfully returned. Thank you!"
        );
        return response;
    }

    private HelmetBorrowing findBorrowing(Long id) {
        return borrowingRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Helmet borrowing not found: " + id));
    }

    private void assertStatus(HelmetBorrowing borrowing, BorrowStatus expected, String message) {
        if (borrowing.getStatus() != expected) {
            throw new IllegalArgumentException(message);
        }
    }
}
