package com.smartcampus.booking_system.repository;

import com.smartcampus.booking_system.model.UserAccount;
import java.util.Optional;
import org.springframework.data.mongodb.repository.MongoRepository;

public interface UserAccountRepository extends MongoRepository<UserAccount, String> {
    Optional<UserAccount> findByEmail(String email);
}
