package com.smartcampus.booking_system.service;

import com.smartcampus.booking_system.model.IncidentTicket;
import com.smartcampus.booking_system.repository.TicketRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class TicketService {
    private final TicketRepository ticketRepository;
    private final NotificationService notificationService;

    public List<IncidentTicket> getAllTickets() {
        return ticketRepository.findAll();
    }

    public List<IncidentTicket> getTicketsByReporter(String email) {
        return ticketRepository.findByReporterEmail(email);
    }

    public IncidentTicket createTicket(IncidentTicket ticket) {
        ticket.setStatus("OPEN");
        ticket.setCreatedAt(LocalDateTime.now());
        ticket.setUpdatedAt(LocalDateTime.now());
        if (ticket.getImageAttachments() != null && ticket.getImageAttachments().size() > 3) {
            throw new RuntimeException("Maximum 3 attachments allowed.");
        }
        return ticketRepository.save(ticket);
    }

    public IncidentTicket updateTicketStatus(String id, String status, String reason, String notes) {
        IncidentTicket ticket = ticketRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Ticket not found"));

        ticket.setStatus(status);
        if (reason != null) ticket.setRejectionReason(reason);
        if (notes != null) ticket.setResolutionNotes(notes);
        ticket.setUpdatedAt(LocalDateTime.now());

        IncidentTicket saved = ticketRepository.save(ticket);

        // Notify reporter
        notificationService.createNotification(
            "system@smartcampus.com",
            new com.smartcampus.booking_system.dto.CreateNotificationRequest(
                "Ticket Status Updated",
                "Your ticket " + ticket.getId() + " is now " + status + (reason != null ? ". Reason: " + reason : ""),
                com.smartcampus.booking_system.model.NotificationType.valueOf(status.equals("RESOLVED") ? "SUCCESS" : (status.equals("REJECTED") ? "CRITICAL" : "INFO")),
                ticket.getReporterEmail(),
                false
            )
        );

        return saved;
    }

    public IncidentTicket assignTechnician(String id, String technicianEmail) {
        IncidentTicket ticket = ticketRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Ticket not found"));

        ticket.setAssignedTechnicianEmail(technicianEmail);
        ticket.setStatus("IN_PROGRESS");
        ticket.setUpdatedAt(LocalDateTime.now());

        return ticketRepository.save(ticket);
    }

    public IncidentTicket addComment(String id, String authorEmail, String content) {
        IncidentTicket ticket = ticketRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Ticket not found"));

        IncidentTicket.Comment comment = new IncidentTicket.Comment(
                UUID.randomUUID().toString(),
                authorEmail,
                content,
                LocalDateTime.now()
        );

        if (ticket.getComments() == null) ticket.setComments(new ArrayList<>());
        ticket.getComments().add(comment);
        ticket.setUpdatedAt(LocalDateTime.now());

        IncidentTicket saved = ticketRepository.save(ticket);

        // Notify other party
        String recipient = authorEmail.equals(ticket.getReporterEmail()) 
            ? ticket.getAssignedTechnicianEmail() 
            : ticket.getReporterEmail();

        if (recipient != null) {
            notificationService.createNotification(
                authorEmail,
                new com.smartcampus.booking_system.dto.CreateNotificationRequest(
                    "New Comment on Ticket",
                    "There is a new comment on ticket " + ticket.getId() + " from " + authorEmail,
                    com.smartcampus.booking_system.model.NotificationType.INFO,
                    recipient,
                    false
                )
            );
        }

        return saved;
    }
}
