package com.example.golinks.event.repositories;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.Instant;
import java.util.UUID;

@Repository
public interface EventRepository extends JpaRepository<EventEntity, UUID> {
    long countByGoLinkIdAndCreatedAtBetween(UUID goLinkId, Instant from, Instant to);

    @org.springframework.data.jpa.repository.Query("SELECT e.goLink, COUNT(e) as cnt FROM EventEntity e WHERE e.createdAt BETWEEN :from AND :to GROUP BY e.goLink ORDER BY cnt DESC")
    java.util.List<Object[]> findTopLinks(Instant from, Instant to, org.springframework.data.domain.Pageable pageable);
}
