package com.repurposeai.dto;

import com.repurposeai.model.User;
import lombok.*;
import java.time.LocalDateTime;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class UserProfileResponse {
    private Long id;
    private String name;
    private String email;
    private String plan;
    private Integer dailyUsageCount;
    private Integer totalGenerations;
    private LocalDateTime createdAt;

    public static UserProfileResponse fromUser(User user) {
        return UserProfileResponse.builder()
                .id(user.getId())
                .name(user.getName())
                .email(user.getEmail())
                .plan(user.getPlan().name())
                .dailyUsageCount(user.getDailyUsageCount())
                .totalGenerations(user.getTotalGenerations())
                .createdAt(user.getCreatedAt())
                .build();
    }
}
