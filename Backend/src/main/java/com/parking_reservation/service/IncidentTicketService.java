package com.parking_reservation.service;

import com.parking_reservation.dto.request.CommentRequest;
import com.parking_reservation.dto.request.IncidentTicketRequest;
import com.parking_reservation.dto.response.AttachmentResponse;
import com.parking_reservation.dto.response.CommentResponse;
import com.parking_reservation.dto.response.TicketResponse;
import com.parking_reservation.entity.*;
import com.parking_reservation.entity.IncidentTicket.TicketPriority;
import com.parking_reservation.entity.IncidentTicket.TicketStatus;
import com.parking_reservation.exception.ResourceNotFoundException;
import com.parking_reservation.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class IncidentTicketService {

    private final IncidentTicketRepository ticketRepository;
    private final TicketAttachmentRepository attachmentRepository;
    private final TicketCommentRepository commentRepository;
    private final UserRepository userRepository;
    private final FileStorageService fileStorageService;
    private final NotificationService notificationService;

    // ─── Tickets ───────────────────────────────────────────────────────────────

    @Transactional(readOnly = true)
    public List<TicketResponse> getTicketsForUser(Long userId) {
        return ticketRepository.findByUserIdAndDeletedFalseOrderByCreatedAtDesc(userId).stream()
                .map(TicketResponse::from).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<TicketResponse> getAllTickets(String statusFilter) {
        if (statusFilter != null && !statusFilter.isBlank()) {
            TicketStatus status = TicketStatus.valueOf(statusFilter.toUpperCase());
            return ticketRepository.findByStatusAndDeletedFalse(status).stream()
                    .map(TicketResponse::from).collect(Collectors.toList());
        }
        return ticketRepository.findByDeletedFalseOrderByCreatedAtDesc().stream()
                .map(TicketResponse::from).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<TicketResponse> getTicketsForTechnician(Long technicianId) {
        return ticketRepository.findByTechnicianIdAndDeletedFalse(technicianId).stream()
                .map(TicketResponse::from).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public TicketResponse getTicketById(Long id) {
        return TicketResponse.from(findTicket(id));
    }

    @Transactional
    public TicketResponse createTicket(Long userId, IncidentTicketRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + userId));

        IncidentTicket ticket = new IncidentTicket();
        ticket.setUser(user);
        ticket.setTitle(request.getTitle());
        ticket.setDescription(request.getDescription());
        ticket.setLocation(request.getLocation());
        if (request.getPriority() != null) {
            try {
                ticket.setPriority(TicketPriority.valueOf(request.getPriority().toUpperCase()));
            } catch (IllegalArgumentException ignored) {
                ticket.setPriority(TicketPriority.MEDIUM);
            }
        }

        return TicketResponse.from(ticketRepository.save(ticket));
    }

    @Transactional
    public TicketResponse assignTechnician(Long ticketId, Long technicianId) {
        IncidentTicket ticket = findTicket(ticketId);
        if (ticket.getStatus() == TicketStatus.RESOLVED || ticket.getStatus() == TicketStatus.CLOSED
                || ticket.getStatus() == TicketStatus.REJECTED) {
            throw new IllegalArgumentException("Cannot assign technician to a ticket in status: " + ticket.getStatus());
        }

        User technician = userRepository.findById(technicianId)
                .orElseThrow(() -> new ResourceNotFoundException("Technician not found: " + technicianId));

        User previousTechnician = ticket.getTechnician();
        ticket.setTechnician(technician);
        ticket.setStatus(TicketStatus.IN_PROGRESS);

        TicketResponse response = TicketResponse.from(ticketRepository.save(ticket));

        // Notify the ticket reporter
        notificationService.send(ticket.getUser().getId(), NotificationType.TICKET_STATUS_CHANGED,
                "Ticket Assigned",
                "Your ticket \"" + ticket.getTitle() + "\" has been assigned to a technician.");

        // Notify the newly assigned technician
        notificationService.send(technician.getId(), NotificationType.TICKET_ASSIGNED,
                "New Ticket Assigned",
                "You have been assigned to ticket \"" + ticket.getTitle() + "\". Please review and take action.");

        // Notify the previous technician if they were replaced
        if (previousTechnician != null && !previousTechnician.getId().equals(technician.getId())) {
            notificationService.send(previousTechnician.getId(), NotificationType.TICKET_ASSIGNED,
                    "Ticket Reassigned",
                    "Ticket \"" + ticket.getTitle() + "\" has been reassigned to another technician.");
        }

        return response;
    }

    @Transactional
    public TicketResponse updateStatus(Long ticketId, Map<String, String> body) {
        IncidentTicket ticket = findTicket(ticketId);
        String rawStatus = body.get("status");
        if (rawStatus == null) throw new IllegalArgumentException("Status is required");

        TicketStatus newStatus;
        try {
            newStatus = TicketStatus.valueOf(rawStatus.toUpperCase());
        } catch (IllegalArgumentException e) {
            throw new IllegalArgumentException("Invalid status: " + rawStatus);
        }

        validateStatusTransition(ticket.getStatus(), newStatus);
        ticket.setStatus(newStatus);

        String notes = body.get("technicianNotes");
        if (notes != null && !notes.isBlank()) {
            ticket.setTechnicianNotes(notes);
        }

        TicketResponse response = TicketResponse.from(ticketRepository.save(ticket));
        notificationService.send(ticket.getUser().getId(), NotificationType.TICKET_STATUS_CHANGED,
                "Ticket Updated",
                "Your ticket \"" + ticket.getTitle() + "\" status changed to " + newStatus + ".");
        return response;
    }

    @Transactional
    public TicketResponse rejectTicket(Long ticketId, String reason) {
        IncidentTicket ticket = findTicket(ticketId);
        if (ticket.getStatus() != TicketStatus.OPEN && ticket.getStatus() != TicketStatus.IN_PROGRESS) {
            throw new IllegalArgumentException("Only OPEN or IN_PROGRESS tickets can be rejected");
        }
        ticket.setStatus(TicketStatus.REJECTED);
        ticket.setRejectionReason(reason);

        TicketResponse response = TicketResponse.from(ticketRepository.save(ticket));
        notificationService.send(ticket.getUser().getId(), NotificationType.TICKET_STATUS_CHANGED,
                "Ticket Rejected",
                "Your ticket \"" + ticket.getTitle() + "\" was rejected. Reason: " + reason);
        return response;
    }

    @Transactional
    public void softDeleteTicket(Long ticketId) {
        IncidentTicket ticket = findTicket(ticketId);
        ticket.setDeleted(true);
        ticketRepository.save(ticket);
    }

    // ─── Attachments ───────────────────────────────────────────────────────────

    @Transactional
    public AttachmentResponse addAttachment(Long ticketId, MultipartFile file) {
        IncidentTicket ticket = findTicket(ticketId);
        long count = attachmentRepository.countByTicketId(ticketId);

        String storagePath = fileStorageService.store(file, count);

        TicketAttachment attachment = new TicketAttachment();
        attachment.setTicket(ticket);
        attachment.setFileName(storagePath.substring(storagePath.lastIndexOf('/') + 1));
        attachment.setOriginalName(file.getOriginalFilename());
        attachment.setContentType(file.getContentType());
        attachment.setFileSize(file.getSize());
        attachment.setStoragePath(storagePath);

        return AttachmentResponse.from(attachmentRepository.save(attachment));
    }

    @Transactional(readOnly = true)
    public List<AttachmentResponse> getAttachments(Long ticketId) {
        findTicket(ticketId);
        return attachmentRepository.findByTicketId(ticketId).stream()
                .map(AttachmentResponse::from).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public byte[] loadAttachment(Long ticketId, Long fileId) {
        findTicket(ticketId);
        TicketAttachment attachment = attachmentRepository.findById(fileId)
                .orElseThrow(() -> new ResourceNotFoundException("Attachment not found: " + fileId));
        return fileStorageService.load(attachment.getStoragePath());
    }

    @Transactional(readOnly = true)
    public String getAttachmentContentType(Long fileId) {
        return attachmentRepository.findById(fileId)
                .map(TicketAttachment::getContentType)
                .orElseThrow(() -> new ResourceNotFoundException("Attachment not found: " + fileId));
    }

    @Transactional
    public void deleteAttachment(Long ticketId, Long fileId) {
        findTicket(ticketId);
        TicketAttachment attachment = attachmentRepository.findById(fileId)
                .orElseThrow(() -> new ResourceNotFoundException("Attachment not found: " + fileId));
        fileStorageService.delete(attachment.getStoragePath());
        attachmentRepository.delete(attachment);
    }

    // ─── Comments ──────────────────────────────────────────────────────────────

    @Transactional(readOnly = true)
    public List<CommentResponse> getComments(Long ticketId) {
        findTicket(ticketId);
        return commentRepository.findByTicketIdOrderByCreatedAtAsc(ticketId).stream()
                .map(CommentResponse::from).collect(Collectors.toList());
    }

    @Transactional
    public CommentResponse addComment(Long ticketId, Long authorId, CommentRequest request) {
        IncidentTicket ticket = findTicket(ticketId);
        User author = userRepository.findById(authorId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + authorId));

        TicketComment comment = new TicketComment();
        comment.setTicket(ticket);
        comment.setAuthor(author);
        comment.setContent(request.getContent());

        CommentResponse response = CommentResponse.from(commentRepository.save(comment));
        if (!ticket.getUser().getId().equals(authorId)) {
            notificationService.send(ticket.getUser().getId(), NotificationType.TICKET_COMMENT_ADDED,
                    "New Comment on Your Ticket",
                    author.getName() + " commented on ticket \"" + ticket.getTitle() + "\".");
        }
        return response;
    }

    @Transactional
    public CommentResponse editComment(Long ticketId, Long commentId, Long editorId, CommentRequest request) {
        findTicket(ticketId);
        TicketComment comment = commentRepository.findById(commentId)
                .orElseThrow(() -> new ResourceNotFoundException("Comment not found: " + commentId));

        if (!comment.getAuthor().getId().equals(editorId)) {
            throw new IllegalArgumentException("You can only edit your own comments");
        }
        comment.setContent(request.getContent());
        return CommentResponse.from(commentRepository.save(comment));
    }

    @Transactional
    public void deleteComment(Long ticketId, Long commentId, Long requesterId, boolean isAdmin) {
        findTicket(ticketId);
        TicketComment comment = commentRepository.findById(commentId)
                .orElseThrow(() -> new ResourceNotFoundException("Comment not found: " + commentId));

        if (!isAdmin && !comment.getAuthor().getId().equals(requesterId)) {
            throw new IllegalArgumentException("You can only delete your own comments");
        }
        commentRepository.delete(comment);
    }

    // ─── Helpers ───────────────────────────────────────────────────────────────

    private IncidentTicket findTicket(Long id) {
        return ticketRepository.findByIdAndDeletedFalse(id)
                .orElseThrow(() -> new ResourceNotFoundException("Ticket not found: " + id));
    }

    private void validateStatusTransition(TicketStatus current, TicketStatus next) {
        boolean valid = switch (current) {
            case OPEN        -> next == TicketStatus.IN_PROGRESS;
            case IN_PROGRESS -> next == TicketStatus.RESOLVED;
            case RESOLVED    -> next == TicketStatus.CLOSED;
            default          -> false;
        };
        if (!valid) {
            throw new IllegalArgumentException("Invalid status transition: " + current + " → " + next);
        }
    }
}
