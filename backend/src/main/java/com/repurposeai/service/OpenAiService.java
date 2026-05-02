package com.repurposeai.service;

import com.repurposeai.exception.AiServiceException;
import com.repurposeai.model.GeneratedContent;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.*;
import reactor.core.publisher.Mono;

import java.util.*;

@Service
public class OpenAiService {

    private static final Logger logger = LoggerFactory.getLogger(OpenAiService.class);

    // OpenRouter config
    @Value("${openrouter.api.url:https://openrouter.ai/api/v1/chat/completions}")
    private String apiUrl;

    // ✅ WORKING MODEL
    @Value("${openrouter.model:meta-llama/llama-3-8b-instruct}")
    private String model;

    private final WebClient webClient;

    public OpenAiService() {
        this.webClient = WebClient.builder()
                .codecs(configurer -> configurer.defaultCodecs().maxInMemorySize(2 * 1024 * 1024))
                .build();
    }

    public AiResult generateContent(String inputText, GeneratedContent.OutputType outputType, String tone) {
        String systemPrompt = buildSystemPrompt(outputType, tone);
        String userPrompt = buildUserPrompt(inputText, outputType);

        Map<String, Object> requestBody = new HashMap<>();
        requestBody.put("model", model);
        requestBody.put("max_tokens", 1500);
        requestBody.put("temperature", 0.7);

        List<Map<String, String>> messages = new ArrayList<>();
        messages.add(Map.of("role", "system", "content", systemPrompt));
        messages.add(Map.of("role", "user", "content", userPrompt));
        requestBody.put("messages", messages);

        try {
            Map<String, Object> response = webClient.post()
                    .uri(apiUrl)
                    .header("Authorization", "Bearer " + System.getenv("OPENROUTER_API_KEY"))
                    .header("Content-Type", "application/json")
                    
                    // ✅ IMPORTANT HEADERS (fixes your error)
                    .header("HTTP-Referer", "http://localhost:5173")
                    .header("X-Title", "RepurposeAI")

                    .bodyValue(requestBody)
                    .retrieve()
                    .onStatus(HttpStatusCode::isError, clientResponse ->
                            clientResponse.bodyToMono(String.class)
                                    .flatMap(body -> Mono.error(new AiServiceException("OpenRouter API error: " + body)))
                    )
                    .bodyToMono(Map.class)
                    .block();

            if (response == null) throw new AiServiceException("Empty response from OpenRouter");

            List<Map<String, Object>> choices = (List<Map<String, Object>>) response.get("choices");
            Map<String, Object> firstChoice = choices.get(0);
            Map<String, String> message = (Map<String, String>) firstChoice.get("message");
            String content = message.get("content");

            Map<String, Object> usage = (Map<String, Object>) response.get("usage");
            int tokensUsed = usage != null ? ((Number) usage.getOrDefault("total_tokens", 0)).intValue() : 0;

            return new AiResult(content.trim(), tokensUsed, model);

        } catch (AiServiceException e) {
            throw e;
        } catch (Exception e) {
            logger.error("Failed to call OpenRouter API: {}", e.getMessage());
            throw new AiServiceException("Failed to generate content. Please try again.");
        }
    }

    private String buildSystemPrompt(GeneratedContent.OutputType outputType, String tone) {
        String toneInstruction = resolveTone(tone);

        return switch (outputType) {
            case LINKEDIN_POST -> """
                    You are an expert LinkedIn content creator. Generate professional, engaging LinkedIn posts.
                    Format: Start with a hook, add value/insights, end with a CTA or question.
                    Use line breaks for readability. Include 3-5 relevant hashtags at the end.
                    Length: 150-300 words. Tone: """ + toneInstruction;

            case TWITTER_THREAD -> """
                    You are a viral Twitter thread creator. Generate an engaging Twitter thread.
                    Format: Number each tweet as "1/", "2/", etc. Each tweet max 280 characters.
                    First tweet must be a compelling hook. Last tweet: summary/CTA.
                    Thread length: 5-8 tweets. Tone: """ + toneInstruction;

            case INSTAGRAM_CAPTION -> """
                    You are an Instagram content strategist. Create engaging captions with emojis.
                    Format: Hook → Story/Value → CTA → Hashtags (15-20 relevant ones).
                    Use emojis strategically. Line breaks for visual appeal.
                    Length: 150-200 words + hashtags. Tone: """ + toneInstruction;

            case EMAIL_NEWSLETTER -> """
                    You are an email marketing expert. Create a compelling newsletter email.
                    Format: Subject line → Preview text → Greeting → Body (2-3 sections) → CTA → Sign-off.
                    Be conversational, valuable, and action-oriented.
                    Length: 300-500 words. Tone: """ + toneInstruction;

            case SHORT_FORM_IDEAS -> """
                    You are a content strategist. Generate 5-7 short-form content ideas from the input.
                    Format: For each idea: Title + Platform best suited + 2-sentence hook + Key angle.
                    Make ideas actionable, trending, and platform-specific.
                    Tone: """ + toneInstruction;

            case YOUTUBE_DESCRIPTION -> """
                    You are a YouTube SEO expert. Create an optimized video description.
                    Format: First 2 lines → Summary → Timestamps → Links → Hashtags.
                    Length: 300-500 words. Tone: """ + toneInstruction;

            case FACEBOOK_POST -> """
                    You are a Facebook marketing specialist. Create engaging Facebook posts.
                    Format: Hook → Story → Question → CTA.
                    Length: 100-200 words. Tone: """ + toneInstruction;

            case BLOG_SUMMARY -> """
                    You are a content summarizer and SEO writer. Create a blog summary.
                    Format: Meta → TL;DR → Key points → Summary.
                    Tone: """ + toneInstruction;
        };
    }

    private String buildUserPrompt(String inputText, GeneratedContent.OutputType outputType) {
        return "Transform the following content into " + outputType.name().replace("_", " ").toLowerCase() + ":\n\n" + inputText;
    }

    private String resolveTone(String tone) {
        if (tone == null || tone.isBlank()) return "professional yet engaging";
        return switch (tone.toLowerCase()) {
            case "casual" -> "casual and conversational";
            case "humorous" -> "witty and humorous";
            case "inspirational" -> "motivational and inspirational";
            case "formal" -> "formal and authoritative";
            default -> "professional yet engaging";
        };
    }

    public record AiResult(String content, int tokensUsed, String modelUsed) {}
}