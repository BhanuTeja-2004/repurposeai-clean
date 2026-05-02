package com.repurposeai.dto;

import com.repurposeai.model.GeneratedContent;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.*;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor
public class GenerateContentRequest {
    @NotBlank(message = "Input text is required")
    @Size(min = 50, max = 10000, message = "Input text must be between 50 and 10000 characters")
    private String inputText;

    @NotNull(message = "Output type is required")
    private GeneratedContent.OutputType outputType;

    private String tone; // professional, casual, humorous, inspirational
}
