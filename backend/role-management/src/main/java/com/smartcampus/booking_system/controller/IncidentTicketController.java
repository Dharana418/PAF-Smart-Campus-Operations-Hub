package com.smartcampus.booking_system.controller;

import com.smartcampus.booking_system.model.IncidentTicket;
import com.smartcampus.booking_system.service.TicketService;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/tickets")
public class IncidentTicketController {
    private final TicketService ticketService;

    public IncidentTicketController(TicketService ticketService) {
        this.ticketService = ticketService;
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'TECHNICIAN', 'STAFF')")
    public List<IncidentTicket> getAllTickets() {
        return ticketService.getAllTickets();
    }

    @GetMapping("/my")
    public List<IncidentTicket> getMyTickets(Authentication auth) {
        return ticketService.getTicketsByReporter(auth.getName());
    }

    @PostMapping(consumes = {MediaType.MULTIPART_FORM_DATA_VALUE, MediaType.APPLICATION_JSON_VALUE})
    public IncidentTicket createTicket(
            @RequestParam(required = false) String resourceId,
            @RequestParam(required = false) String location,
            @RequestParam(required = false) String category,
            @RequestParam(required = false) String description,
            @RequestParam(required = false) String priority,
            @RequestParam(required = false) String contactDetails,
            @RequestParam(value = "attachments", required = false) List<MultipartFile> attachments,
            Authentication auth) {
        IncidentTicket ticket = new IncidentTicket();
        ticket.setResourceId(resourceId);
        ticket.setLocation(location);
        ticket.setCategory(category);
        ticket.setDescription(description);
        ticket.setPriority(priority != null ? priority : "MEDIUM");
        ticket.setContactDetails(contactDetails);
        ticket.setReporterEmail(auth.getName());
        return ticketService.createTicket(ticket, attachments);
    }

    @PatchMapping("/{id}")
    public IncidentTicket updateTicket(@PathVariable String id, @RequestBody Map<String, String> payload, Authentication auth) {
        boolean canManageAll = auth.getAuthorities().stream().anyMatch(a ->
                "ROLE_STAFF".equals(a.getAuthority()) ||
                "ROLE_TECHNICIAN".equals(a.getAuthority())
        );

        return ticketService.updateTicket(
                id,
                payload.get("resourceId"),
                payload.get("location"),
                payload.get("category"),
                payload.get("description"),
                payload.get("priority"),
                payload.get("contactDetails"),
                auth.getName(),
                canManageAll
        );
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteTicket(@PathVariable String id, Authentication auth) {
        boolean canManageAll = auth.getAuthorities().stream().anyMatch(a ->
                "ROLE_ADMIN".equals(a.getAuthority()) ||
                "ROLE_STAFF".equals(a.getAuthority()) ||
                "ROLE_TECHNICIAN".equals(a.getAuthority())
        );

        ticketService.deleteTicket(id, auth.getName(), canManageAll);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/attachments/{filename:.+}")
    public ResponseEntity<Resource> getAttachment(@PathVariable String filename) {
        Resource resource = ticketService.loadAttachmentAsResource(filename);
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "inline; filename=\"" + resource.getFilename() + "\"")
                .body(resource);
    }

    @PatchMapping("/{id}/status")
    @PreAuthorize("hasAnyRole('ADMIN', 'TECHNICIAN')")
    public IncidentTicket updateStatus(@PathVariable String id, @RequestBody Map<String, String> payload, Authentication auth) {
        String status = payload.get("status");
        String reason = payload.get("reason");
        String notes = payload.get("notes");
        return ticketService.updateTicketStatus(id, status, reason, notes, auth.getName());
    }

    @PatchMapping("/{id}/assign")
    @PreAuthorize("hasRole('ADMIN')")
    public IncidentTicket assign(@PathVariable String id, @RequestBody Map<String, String> payload) {
        return ticketService.assignTechnician(id, payload.get("technicianEmail"));
    }

    @PostMapping("/{id}/comments")
    public IncidentTicket addComment(@PathVariable String id, @RequestBody Map<String, String> payload, Authentication auth) {
        return ticketService.addComment(id, auth.getName(), payload.get("content"));
    }
}
