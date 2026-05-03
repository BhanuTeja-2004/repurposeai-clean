package com.repurposeai.controller;

import com.repurposeai.dto.*;
import com.repurposeai.model.GeneratedContent;
import com.repurposeai.service.ContentService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.http.*;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.nio.charset.StandardCharsets;

@RestController
@RequestMapping("/content")
public class ContentController {

    @Autowired
    private ContentService contentService;

    @PostMapping("/generate")
    public ResponseEntity<GenerateContentResponse> generate(
            @AuthenticationPrincipal UserDetails userDetails,
            @Valid @RequestBody GenerateContentRequest request) {

        GenerateContentResponse response = contentService.generateContent(
                userDetails.getUsername(), request);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/history")
    public ResponseEntity<Page<ContentHistoryResponse>> getHistory(
            @AuthenticationPrincipal UserDetails userDetails,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {

        Page<ContentHistoryResponse> history = contentService.getHistory(
                userDetails.getUsername(), page, size);
        return ResponseEntity.ok(history);
    }

    @GetMapping("/{id}")
    public ResponseEntity<ContentHistoryResponse> getById(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable Long id) {

        ContentHistoryResponse content = contentService.getContentByIdAsDto(
                userDetails.getUsername(), id);
        return ResponseEntity.ok(content);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable Long id) {

        contentService.deleteContent(userDetails.getUsername(), id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/{id}/download")
    public ResponseEntity<byte[]> download(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable Long id) {

        GeneratedContent content = contentService.getContentById(
                userDetails.getUsername(), id);

        String filename = content.getOutputType().name().toLowerCase() + "_" + id + ".txt";
        byte[] bytes = content.getOutputText().getBytes(StandardCharsets.UTF_8);

        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + filename + "\"")
                .contentType(MediaType.TEXT_PLAIN)
                .body(bytes);
    }

    @GetMapping("/dashboard")
    public ResponseEntity<DashboardResponse> getDashboard(
            @AuthenticationPrincipal UserDetails userDetails) {

        DashboardResponse dashboard = contentService.getDashboard(userDetails.getUsername());
        return ResponseEntity.ok(dashboard);
    }

    @GetMapping("/output-types")
    public ResponseEntity<GeneratedContent.OutputType[]> getOutputTypes() {
        return ResponseEntity.ok(GeneratedContent.OutputType.values());
    }
}