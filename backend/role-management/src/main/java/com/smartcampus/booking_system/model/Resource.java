package com.smartcampus.booking_system.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;
import java.time.LocalTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "resources")
public class Resource {
    @Id
    private String id;
    
    private String name;
    private String type; // lecture hall, lab, meeting room, equipment
    private Integer capacity;
    private String location;
    private LocalTime availableFrom;
    private LocalTime availableUntil;
    private String status; // ACTIVE, OUT_OF_SERVICE
    
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
