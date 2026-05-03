package com.repurposeai.dto;

import com.repurposeai.model.GeneratedContent;
import lombok.*;
import java.time.LocalDateTime;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class ContentHistoryResponse {
    private Long id;
    private String inputTextPreview;
    private String outputType;
    private String outputTextPreview;
    private String outputText;
    private Integer tokensUsed;
    private LocalDateTime createdAt;

    public static ContentHistoryResponse fromContent(GeneratedContent content) {
        String inputPreview = content.getInputText().length() > 100
                ? content.getInputText().substring(0, 100) + "..."
                : content.getInputText();

        String outputPreview = content.getOutputText().length() > 150
                ? content.getOutputText().substring(0, 150) + "..."
                : content.getOutputText();

        return ContentHistoryResponse.builder()
                .id(content.getId())
                .inputTextPreview(inputPreview)
                .outputType(content.getOutputType().name())
                .outputTextPreview(outputPreview)
                .outputText(content.getOutputText())
                .tokensUsed(content.getTokensUsed())
                .createdAt(content.getCreatedAt())
                .build();
    }
}