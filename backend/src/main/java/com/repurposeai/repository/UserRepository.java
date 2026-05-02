package com.repurposeai.repository;

import com.repurposeai.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {

    Optional<User> findByEmail(String email);

    boolean existsByEmail(String email);

    Optional<User> findByStripeCustomerId(String stripeCustomerId);

    @Query("SELECT COUNT(u) FROM User u WHERE u.plan = 'PRO'")
    long countProUsers();

    @Query("SELECT COUNT(u) FROM User u WHERE u.plan = 'FREE'")
    long countFreeUsers();
}
