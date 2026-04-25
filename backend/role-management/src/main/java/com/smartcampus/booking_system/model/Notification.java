package com.smartcampus.booking_system.model;

import java.time.LocalDateTime;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.DBRef;
import org.springframework.data.mongodb.core.mapping.Document;

@Document(collection = "notifications")
public class Notification {

    @Id
    private String id;

    private String title;
    private String message;
    private NotificationType type;
    private boolean isRead;
    private boolean isBroadcast;

    @DBRef
    private UserAccount recipient;

    @DBRef
    private UserAccount sender;

    private LocalDateTime createdAt = LocalDateTime.now();

    public Notification() {}

    public Notification(String id, String title, String message, NotificationType type, boolean isRead, boolean isBroadcast, UserAccount recipient, UserAccount sender, LocalDateTime createdAt) {
        this.id = id;
        this.title = title;
        this.message = message;
        this.type = type;
        this.isRead = isRead;
        this.isBroadcast = isBroadcast;
        this.recipient = recipient;
        this.sender = sender;
        this.createdAt = createdAt;
    }

    // Getters and Setters
    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getMessage() { return message; }
    public void setMessage(String message) { this.message = message; }

    public NotificationType getType() { return type; }
    public void setType(NotificationType type) { this.type = type; }

    public boolean isRead() { return isRead; }
    public void setRead(boolean isRead) { this.isRead = isRead; }

    public boolean isBroadcast() { return isBroadcast; }
    public void setBroadcast(boolean isBroadcast) { this.isBroadcast = isBroadcast; }

    public UserAccount getRecipient() { return recipient; }
    public void setRecipient(UserAccount recipient) { this.recipient = recipient; }

    public UserAccount getSender() { return sender; }
    public void setSender(UserAccount sender) { this.sender = sender; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}
