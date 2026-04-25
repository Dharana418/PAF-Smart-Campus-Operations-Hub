package com.smartcampus.booking_system.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Document(collection = "tickets")
public class IncidentTicket {
    @Id
    private String id;
    
    private String resourceId;
    private String title;
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
    private List<String> imageAttachments = new ArrayList<>();
    private List<Comment> comments = new ArrayList<>();
    
    private LocalDateTime createdAt = LocalDateTime.now();
    private LocalDateTime updatedAt = LocalDateTime.now();

    public IncidentTicket() {}

    public IncidentTicket(String id, String resourceId, String title, String location, String category, String description, String priority, String reporterEmail, String contactDetails, String status, String rejectionReason, String resolutionNotes, String assignedTechnicianEmail, List<String> imageAttachments, List<Comment> comments, LocalDateTime createdAt, LocalDateTime updatedAt) {
        this.id = id;
        this.resourceId = resourceId;
        this.title = title;
        this.location = location;
        this.category = category;
        this.description = description;
        this.priority = priority;
        this.reporterEmail = reporterEmail;
        this.contactDetails = contactDetails;
        this.status = status;
        this.rejectionReason = rejectionReason;
        this.resolutionNotes = resolutionNotes;
        this.assignedTechnicianEmail = assignedTechnicianEmail;
        this.imageAttachments = imageAttachments;
        this.comments = comments;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
    }

    // Getters and Setters
    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getResourceId() { return resourceId; }
    public void setResourceId(String resourceId) { this.resourceId = resourceId; }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getLocation() { return location; }
    public void setLocation(String location) { this.location = location; }

    public String getCategory() { return category; }
    public void setCategory(String category) { this.category = category; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public String getPriority() { return priority; }
    public void setPriority(String priority) { this.priority = priority; }

    public String getReporterEmail() { return reporterEmail; }
    public void setReporterEmail(String reporterEmail) { this.reporterEmail = reporterEmail; }

    public String getContactDetails() { return contactDetails; }
    public void setContactDetails(String contactDetails) { this.contactDetails = contactDetails; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public String getRejectionReason() { return rejectionReason; }
    public void setRejectionReason(String rejectionReason) { this.rejectionReason = rejectionReason; }

    public String getResolutionNotes() { return resolutionNotes; }
    public void setResolutionNotes(String resolutionNotes) { this.resolutionNotes = resolutionNotes; }

    public String getAssignedTechnicianEmail() { return assignedTechnicianEmail; }
    public void setAssignedTechnicianEmail(String assignedTechnicianEmail) { this.assignedTechnicianEmail = assignedTechnicianEmail; }

    public List<String> getImageAttachments() { return imageAttachments; }
    public void setImageAttachments(List<String> imageAttachments) { this.imageAttachments = imageAttachments; }

    public List<Comment> getComments() { return comments; }
    public void setComments(List<Comment> comments) { this.comments = comments; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }

    public static class Comment {
        private String id;
        private String authorEmail;
        private String content;
        private LocalDateTime createdAt;

        public Comment() {}
        public Comment(String id, String authorEmail, String content, LocalDateTime createdAt) {
            this.id = id;
            this.authorEmail = authorEmail;
            this.content = content;
            this.createdAt = createdAt;
        }

        public String getId() { return id; }
        public void setId(String id) { this.id = id; }
        public String getAuthorEmail() { return authorEmail; }
        public void setAuthorEmail(String authorEmail) { this.authorEmail = authorEmail; }
        public String getContent() { return content; }
        public void setContent(String content) { this.content = content; }
        public LocalDateTime getCreatedAt() { return createdAt; }
        public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
    }
}
