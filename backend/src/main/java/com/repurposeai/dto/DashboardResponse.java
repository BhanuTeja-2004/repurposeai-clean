package com.repurposeai.dto;

import lombok.*;
import java.util.List;
import java.util.Map;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class DashboardResponse {
    private UserProfileResponse user;
    private Integer dailyUsageCount;
    private Integer dailyLimit;
    private Integer remainingToday;
    private Integer totalGenerations;
    private Long totalTokensUsed;
    private Map<String, Long> usageByType;
    private List<ContentHistoryResponse> recentGenerations;
}
