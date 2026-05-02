package com.repurposeai.dto;

import lombok.*;
import java.time.LocalDateTime;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class GenerateContentResponse {
    private Long id;
    private String outputText;
    private String outputType;
    private Integer tokensUsed;
    private LocalDateTime createdAt;
    private Integer remainingGenerations;
}
