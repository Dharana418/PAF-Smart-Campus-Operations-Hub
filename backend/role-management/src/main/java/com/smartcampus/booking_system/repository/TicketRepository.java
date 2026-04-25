package com.smartcampus.booking_system.repository;

import com.smartcampus.booking_system.model.IncidentTicket;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TicketRepository extends MongoRepository<IncidentTicket, String> {
    List<IncidentTicket> findByReporterEmail(String email);
    List<IncidentTicket> findByAssignedTechnicianEmail(String email);
    List<IncidentTicket> findByStatus(String status);
}
