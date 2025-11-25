package com.example.golinks.analytics.services;

import com.example.golinks.event.repositories.EventEntity;
import com.example.golinks.event.repositories.EventRepository;
import com.example.golinks.golink.repositories.GoLinkEntity;
import com.example.golinks.golink.repositories.GoLinkRepository;
import com.example.golinks.core.exception.ResourceNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.UUID;

@Service
@Transactional
public class AnalyticsService {

    private final EventRepository eventRepository;
    private final GoLinkRepository goLinkRepository;

    public AnalyticsService(EventRepository eventRepository, GoLinkRepository goLinkRepository) {
        this.eventRepository = eventRepository;
        this.goLinkRepository = goLinkRepository;
    }

    public void trackEvent(UUID goLinkId, String ipAddress, String userAgent, String referrer) {
        GoLinkEntity goLink = goLinkRepository.findById(goLinkId)
                .orElseThrow(() -> new ResourceNotFoundException("GoLink not found with id: " + goLinkId));

        EventEntity event = new EventEntity();
        event.setId(UUID.randomUUID());
        event.setGoLink(goLink);
        event.setCreatedAt(Instant.now());
        event.setIpAddress(ipAddress);
        event.setUserAgent(userAgent);
        event.setReferrer(referrer);

        eventRepository.save(event);
    }

    public long getClickCount(UUID goLinkId, Instant from, Instant to) {
        return eventRepository.countByGoLinkIdAndCreatedAtBetween(goLinkId, from, to);
    }

    public java.util.List<com.example.golinks.golink.api.GoLink> getTopLinks(Instant from, Instant to, int limit) {
        return eventRepository.findTopLinks(from, to, org.springframework.data.domain.PageRequest.of(0, limit))
                .stream()
                .map(row -> (GoLinkEntity) row[0])
                .map(this::mapToRecord)
                .collect(java.util.stream.Collectors.toList());
    }

    private com.example.golinks.golink.api.GoLink mapToRecord(GoLinkEntity entity) {
        java.util.List<String> tags = entity.getTags() != null && !entity.getTags().isEmpty()
                ? java.util.Arrays.asList(entity.getTags().split(","))
                : java.util.List.of();
        return new com.example.golinks.golink.api.GoLink(
                entity.getId(),
                entity.getName(),
                entity.getTargetUrl(),
                entity.getDescription(),
                tags,
                entity.getCreatedAt(),
                entity.getLockUuid());
    }
}
