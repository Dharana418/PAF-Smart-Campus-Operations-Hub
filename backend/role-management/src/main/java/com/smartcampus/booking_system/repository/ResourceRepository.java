package com.smartcampus.booking_system.repository;

import com.smartcampus.booking_system.model.Resource;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ResourceRepository extends MongoRepository<Resource, String> {
    List<Resource> findByType(String type);
    List<Resource> findByLocation(String location);
    List<Resource> findByStatus(String status);
}
