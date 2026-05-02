package com.repurposeai.service;

import com.razorpay.Order;
import com.razorpay.RazorpayClient;
import com.razorpay.RazorpayException;
import com.repurposeai.dto.PaymentVerifyRequest;
import com.repurposeai.model.User;
import com.repurposeai.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.json.JSONObject;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.nio.charset.StandardCharsets;
import java.util.HashMap;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class PaymentService {

    // ← CHANGED: injected bean instead of new RazorpayClient() per request
    private final RazorpayClient razorpayClient;
    private final UserRepository userRepository;

    @Value("${razorpay.key.id}")
    private String razorpayKeyId;

    @Value("${razorpay.key.secret}")
    private String razorpayKeySecret;

    private static final int AMOUNT_PAISE = 9900;
    private static final String CURRENCY = "INR";

    public Map<String, Object> createOrder(String email) throws RazorpayException {
        System.out.println("=== BACKEND DEBUG ===");
        System.out.println("Razorpay Key ID: " + razorpayKeyId);
        System.out.println("Creating order for: " + email);

        JSONObject orderRequest = new JSONObject();
        orderRequest.put("amount", AMOUNT_PAISE);
        orderRequest.put("currency", CURRENCY);
        orderRequest.put("receipt", "rcpt_" + System.currentTimeMillis());
        orderRequest.put("payment_capture", 1);

        // ← CHANGED: use injected client, no try/catch hiding the real error
        Order order = razorpayClient.orders.create(orderRequest);

        System.out.println("✅ Order created: " + order.get("id"));

        Map<String, Object> response = new HashMap<>();
        response.put("orderId", order.get("id"));
        response.put("amount", AMOUNT_PAISE);
        response.put("currency", CURRENCY);
        response.put("key", razorpayKeyId);

        return response;
    }

    public void verifyAndActivatePro(String email, PaymentVerifyRequest request) throws Exception {
        String generatedSignature = generateSignature(
                request.getRazorpayOrderId() + "|" + request.getRazorpayPaymentId(),
                razorpayKeySecret
        );

        if (!generatedSignature.equals(request.getRazorpaySignature())) {
            throw new SecurityException("Payment signature verification failed");
        }

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found: " + email));

        user.setPlan(User.Plan.PRO);
        userRepository.save(user);
    }

    private String generateSignature(String data, String secret) throws Exception {
        Mac mac = Mac.getInstance("HmacSHA256");
        SecretKeySpec secretKeySpec = new SecretKeySpec(
                secret.getBytes(StandardCharsets.UTF_8), "HmacSHA256");
        mac.init(secretKeySpec);
        byte[] hash = mac.doFinal(data.getBytes(StandardCharsets.UTF_8));
        StringBuilder hexString = new StringBuilder();
        for (byte b : hash) {
            String hex = Integer.toHexString(0xff & b);
            if (hex.length() == 1) hexString.append('0');
            hexString.append(hex);
        }
        return hexString.toString();
    }
}