package com.repurposeai.repository;

import com.repurposeai.model.GeneratedContent;
import com.repurposeai.model.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface GeneratedContentRepository extends JpaRepository<GeneratedContent, Long> {

    Page<GeneratedContent> findByUserOrderByCreatedAtDesc(User user, Pageable pageable);

    List<GeneratedContent> findByUserOrderByCreatedAtDesc(User user);

    @Query("SELECT COUNT(g) FROM GeneratedContent g WHERE g.user = :user AND g.createdAt >= :since")
    long countByUserAndCreatedAtAfter(@Param("user") User user, @Param("since") LocalDateTime since);

    @Query("SELECT g.outputType, COUNT(g) FROM GeneratedContent g WHERE g.user = :user GROUP BY g.outputType")
    List<Object[]> countByOutputTypeForUser(@Param("user") User user);

    @Query("SELECT SUM(g.tokensUsed) FROM GeneratedContent g WHERE g.user = :user")
    Long sumTokensUsedByUser(@Param("user") User user);

    @Query("SELECT COUNT(g) FROM GeneratedContent g")
    long countTotalGenerations();
}
