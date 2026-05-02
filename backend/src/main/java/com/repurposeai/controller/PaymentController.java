package com.repurposeai.controller;

import com.repurposeai.dto.PaymentVerifyRequest;
import com.repurposeai.service.PaymentService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/payment")
@RequiredArgsConstructor
public class PaymentController {

    private final PaymentService paymentService;

    @PostMapping("/create-order")
    public ResponseEntity<Map<String, Object>> createOrder(
            @AuthenticationPrincipal UserDetails userDetails) throws Exception {

        // ← ADDED: clear error if JWT was missing/invalid
        if (userDetails == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("error", "Not authenticated. Send a valid Bearer token."));
        }

        Map<String, Object> order = paymentService.createOrder(userDetails.getUsername());
        return ResponseEntity.ok(order);
    }

    @PostMapping("/verify")
    public ResponseEntity<Map<String, String>> verifyPayment(
            @AuthenticationPrincipal UserDetails userDetails,
            @RequestBody PaymentVerifyRequest request) throws Exception {

        if (userDetails == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("error", "Not authenticated. Send a valid Bearer token."));
        }

        paymentService.verifyAndActivatePro(userDetails.getUsername(), request);
        return ResponseEntity.ok(Map.of("message", "Payment verified. Plan upgraded to PRO."));
    }

    // ← ADDED: readable error responses instead of blank 500
    @ExceptionHandler(Exception.class)
    public ResponseEntity<Map<String, String>> handleError(Exception e) {
        System.err.println("❌ Payment error: " + e.getMessage());
        e.printStackTrace();
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("error", e.getMessage() != null ? e.getMessage() : "Unexpected error"));
    }
}