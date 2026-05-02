package com.repurposeai.dto;

import lombok.*;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class CheckoutSessionResponse {
    private String sessionId;
    private String checkoutUrl;
}
