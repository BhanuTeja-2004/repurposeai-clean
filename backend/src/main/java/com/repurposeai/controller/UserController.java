package com.repurposeai.controller;

import com.repurposeai.dto.UserProfileResponse;
import com.repurposeai.exception.ResourceNotFoundException;
import com.repurposeai.model.User;
import com.repurposeai.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/users")
public class UserController {

    @Autowired
    private UserRepository userRepository;

    @GetMapping("/me")
    public ResponseEntity<UserProfileResponse> getProfile(
            @AuthenticationPrincipal UserDetails userDetails) {

        User user = userRepository.findByEmail(userDetails.getUsername())
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        return ResponseEntity.ok(UserProfileResponse.fromUser(user));
    }

    @PutMapping("/me/name")
    public ResponseEntity<UserProfileResponse> updateName(
            @AuthenticationPrincipal UserDetails userDetails,
            @RequestBody UpdateNameRequest request) {

        User user = userRepository.findByEmail(userDetails.getUsername())
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        user.setName(request.name());
        userRepository.save(user);

        return ResponseEntity.ok(UserProfileResponse.fromUser(user));
    }

    record UpdateNameRequest(String name) {}
}
