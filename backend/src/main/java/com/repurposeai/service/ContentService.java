package com.repurposeai.service;

import com.repurposeai.dto.*;
import com.repurposeai.exception.*;
import com.repurposeai.model.*;
import com.repurposeai.repository.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.domain.*;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class ContentService {

    private static final Logger logger = LoggerFactory.getLogger(ContentService.class);

    @Autowired
    private GeneratedContentRepository contentRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private OpenAiService openAiService;

    @Value("${app.free.daily-limit}")
    private int freeDailyLimit;

    @Value("${app.pro.daily-limit}")
    private int proDailyLimit;

    @Transactional
    public GenerateContentResponse generateContent(String userEmail, GenerateContentRequest request) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        resetDailyCountIfNeeded(user);

        int limit = user.getPlan() == User.Plan.PRO ? proDailyLimit : freeDailyLimit;
        if (user.getDailyUsageCount() >= limit) {
            throw new UsageLimitExceededException(
                    user.getPlan() == User.Plan.FREE
                            ? "Daily limit reached. Upgrade to Pro for unlimited generations."
                            : "Daily limit reached."
            );
        }

        OpenAiService.AiResult aiResult = openAiService.generateContent(
                request.getInputText(),
                request.getOutputType(),
                request.getTone()
        );

        GeneratedContent content = GeneratedContent.builder()
                .user(user)
                .inputText(request.getInputText())
                .outputType(request.getOutputType())
                .outputText(aiResult.content())
                .tokensUsed(aiResult.tokensUsed())
                .modelUsed(aiResult.modelUsed())
                .build();

        content = contentRepository.save(content);

        user.setDailyUsageCount(user.getDailyUsageCount() + 1);
        user.setTotalGenerations(user.getTotalGenerations() + 1);
        userRepository.save(user);

        int remaining = Math.max(0, limit - user.getDailyUsageCount());

        return GenerateContentResponse.builder()
                .id(content.getId())
                .outputText(content.getOutputText())
                .outputType(content.getOutputType().name())
                .tokensUsed(content.getTokensUsed())
                .createdAt(content.getCreatedAt())
                .remainingGenerations(remaining)
                .build();
    }

    public Page<ContentHistoryResponse> getHistory(String userEmail, int page, int size) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
        Page<GeneratedContent> contentPage = contentRepository.findByUserOrderByCreatedAtDesc(user, pageable);

        return contentPage.map(ContentHistoryResponse::fromContent);
    }

    @Transactional
    public GeneratedContent getContentById(String userEmail, Long contentId) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        GeneratedContent content = contentRepository.findById(contentId)
                .orElseThrow(() -> new ResourceNotFoundException("Content not found"));

        if (!content.getUser().getId().equals(user.getId())) {
            throw new UnauthorizedException("Access denied to this content");
        }

        return content;
    }

    @Transactional
    public ContentHistoryResponse getContentByIdAsDto(String userEmail, Long contentId) {
        GeneratedContent content = getContentById(userEmail, contentId);
        return ContentHistoryResponse.fromContent(content);
    }

    @Transactional
    public void deleteContent(String userEmail, Long contentId) {
        GeneratedContent content = getContentById(userEmail, contentId);
        contentRepository.delete(content);
    }

    public DashboardResponse getDashboard(String userEmail) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        resetDailyCountIfNeeded(user);

        int limit = user.getPlan() == User.Plan.PRO ? proDailyLimit : freeDailyLimit;
        int remaining = Math.max(0, limit - user.getDailyUsageCount());

        Long totalTokens = contentRepository.sumTokensUsedByUser(user);

        List<Object[]> usageByTypeRaw = contentRepository.countByOutputTypeForUser(user);
        Map<String, Long> usageByType = usageByTypeRaw.stream()
                .collect(Collectors.toMap(
                        row -> ((GeneratedContent.OutputType) row[0]).name(),
                        row -> (Long) row[1]
                ));

        Pageable pageable = PageRequest.of(0, 10, Sort.by("createdAt").descending());
        List<ContentHistoryResponse> recentGenerations = contentRepository
                .findByUserOrderByCreatedAtDesc(user, pageable)
                .stream()
                .map(ContentHistoryResponse::fromContent)
                .collect(Collectors.toList());

        return DashboardResponse.builder()
                .user(UserProfileResponse.fromUser(user))
                .dailyUsageCount(user.getDailyUsageCount())
                .dailyLimit(limit == proDailyLimit ? -1 : limit)
                .remainingToday(remaining)
                .totalGenerations(user.getTotalGenerations())
                .totalTokensUsed(totalTokens != null ? totalTokens : 0L)
                .usageByType(usageByType)
                .recentGenerations(recentGenerations)
                .build();
    }

    private void resetDailyCountIfNeeded(User user) {
        if (user.getLastUsageReset() == null ||
                user.getLastUsageReset().toLocalDate().isBefore(LocalDateTime.now().toLocalDate())) {
            user.setDailyUsageCount(0);
            user.setLastUsageReset(LocalDateTime.now());
            userRepository.save(user);
        }
    }

    @Scheduled(cron = "0 0 0 * * *")
    @Transactional
    public void resetAllDailyUsageCounts() {
        logger.info("Running daily usage count reset...");
        List<User> users = userRepository.findAll();
        users.forEach(user -> {
            user.setDailyUsageCount(0);
            user.setLastUsageReset(LocalDateTime.now());
        });
        userRepository.saveAll(users);
        logger.info("Daily usage counts reset for {} users", users.size());
    }
}