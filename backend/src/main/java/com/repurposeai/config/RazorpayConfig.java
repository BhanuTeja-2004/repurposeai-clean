package com.repurposeai.config;

import com.razorpay.RazorpayClient;
import com.razorpay.RazorpayException;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class RazorpayConfig {

    @Value("${razorpay.key.id}")
    private String keyId;

    @Value("${razorpay.key.secret}")
    private String keySecret;

    @Bean
    public RazorpayClient razorpayClient() throws RazorpayException {
        if (keyId == null || keyId.isBlank()) {
            throw new IllegalStateException("razorpay.key.id is not set in application.properties");
        }
        if (keySecret == null || keySecret.isBlank()) {
            throw new IllegalStateException("razorpay.key.secret is not set in application.properties");
        }
        return new RazorpayClient(keyId, keySecret);
    }
}