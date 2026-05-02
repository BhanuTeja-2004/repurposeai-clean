package com.repurposeai.model;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import java.time.LocalDateTime;

@Entity
@Table(name = "generated_content")
@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
@Builder
public class GeneratedContent {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(name = "input_text", columnDefinition = "TEXT", nullable = false)
    private String inputText;

    @Enumerated(EnumType.STRING)
    @Column(name = "output_type", nullable = false)
    private OutputType outputType;

    @Column(name = "output_text", columnDefinition = "TEXT", nullable = false)
    private String outputText;

    @Column(name = "tokens_used")
    private Integer tokensUsed;

    @Column(name = "model_used", length = 50)
    private String modelUsed;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    public enum OutputType {
        LINKEDIN_POST,
        TWITTER_THREAD,
        INSTAGRAM_CAPTION,
        EMAIL_NEWSLETTER,
        SHORT_FORM_IDEAS,
        YOUTUBE_DESCRIPTION,
        FACEBOOK_POST,
        BLOG_SUMMARY
    }
}