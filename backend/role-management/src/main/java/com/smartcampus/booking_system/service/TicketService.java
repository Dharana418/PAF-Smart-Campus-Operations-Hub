package com.smartcampus.booking_system.service;

import com.smartcampus.booking_system.model.IncidentTicket;
import com.smartcampus.booking_system.repository.TicketRepository;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.net.MalformedURLException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class TicketService {
    private final TicketRepository ticketRepository;
    private final NotificationService notificationService;
    private final Path uploadsDir = Paths.get("uploads", "tickets");

    public TicketService(TicketRepository ticketRepository, NotificationService notificationService) {
        this.ticketRepository = ticketRepository;
        this.notificationService = notificationService;
        try {
            Files.createDirectories(uploadsDir);
        } catch (IOException e) {
            throw new RuntimeException("Failed to initialize ticket upload directory", e);
        }
    }

    public List<IncidentTicket> getAllTickets() {
        return ticketRepository.findAll();
    }

    public List<IncidentTicket> getTicketsByReporter(String email) {
        return ticketRepository.findByReporterEmail(email);
    }

    public IncidentTicket createTicket(IncidentTicket ticket) {
        return createTicket(ticket, null);
    }

    public IncidentTicket createTicket(IncidentTicket ticket, List<MultipartFile> attachments) {
        ticket.setStatus("OPEN");
        ticket.setCreatedAt(LocalDateTime.now());
        ticket.setUpdatedAt(LocalDateTime.now());

        int attachmentCount = attachments == null
                ? (ticket.getImageAttachments() == null ? 0 : ticket.getImageAttachments().size())
                : (int) attachments.stream().filter(f -> f != null && !f.isEmpty()).count();

        if (attachmentCount > 5) {
            throw new RuntimeException("Maximum 5 attachments allowed.");
        }

        if (attachments != null && !attachments.isEmpty()) {
            List<String> storedPaths = attachments.stream()
                    .filter(f -> f != null && !f.isEmpty())
                    .map(this::storeAttachment)
                    .collect(Collectors.toList());
            ticket.setImageAttachments(storedPaths);
        }

        return ticketRepository.save(ticket);
    }

    public Resource loadAttachmentAsResource(String filename) {
        try {
            Path filePath = uploadsDir.resolve(filename).normalize();
            if (!filePath.startsWith(uploadsDir)) {
                throw new RuntimeException("Invalid attachment path");
            }
            Resource resource = new UrlResource(filePath.toUri());
            if (!resource.exists()) {
                throw new RuntimeException("Attachment not found");
            }
            return resource;
        } catch (MalformedURLException e) {
            throw new RuntimeException("Attachment not found", e);
        }
    }

    private String storeAttachment(MultipartFile file) {
        try {
            String originalName = file.getOriginalFilename() == null ? "attachment" : file.getOriginalFilename();
            String safeName = originalName.replaceAll("[^a-zA-Z0-9._-]", "_");
            String storedName = UUID.randomUUID() + "_" + safeName;
            Path target = uploadsDir.resolve(storedName).normalize();
            if (!target.startsWith(uploadsDir)) {
                throw new RuntimeException("Invalid attachment path");
            }
            Files.copy(file.getInputStream(), target, StandardCopyOption.REPLACE_EXISTING);
            return "/api/tickets/attachments/" + storedName;
        } catch (IOException e) {
            throw new RuntimeException("Failed to save attachment", e);
        }
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
