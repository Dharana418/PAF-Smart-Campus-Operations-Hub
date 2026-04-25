package com.smartcampus.booking_system.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "tickets")
public class IncidentTicket {
    @Id
    private String id;
    
    private String resourceId;
    private String location;
    private String category;
    private String description;
    private String priority; // LOW, MEDIUM, HIGH, CRITICAL
    
    private String reporterEmail;
    private String contactDetails;
    
    private String status; // OPEN, IN_PROGRESS, RESOLVED, CLOSED, REJECTED
    private String rejectionReason;
    private String resolutionNotes;
    
    private String assignedTechnicianEmail;
    
    private List<String> imageAttachments = new ArrayList<>(); // URLs or Base64
    private List<Comment> comments = new ArrayList<>();
    
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class Comment {
        private String id;
        private String authorEmail;
        private String content;
        private LocalDateTime createdAt;
    }
}
