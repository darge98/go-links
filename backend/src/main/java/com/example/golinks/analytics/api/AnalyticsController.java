package com.example.golinks.analytics.api;

import com.example.golinks.analytics.services.AnalyticsService;
import com.example.golinks.golink.api.GoLink;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/analytics")
public class AnalyticsController {

    private final AnalyticsService service;

    public AnalyticsController(AnalyticsService service) {
        this.service = service;
    }

    @GetMapping("/stats/{id}")
    public ResponseEntity<Long> getStats(
            @PathVariable UUID id,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) Instant from,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) Instant to) {

        if (from == null)
            from = Instant.now().minus(30, ChronoUnit.DAYS);
        if (to == null)
            to = Instant.now();

        return ResponseEntity.ok(service.getClickCount(id, from, to));
    }

    @GetMapping("/top")
    public ResponseEntity<List<GoLink>> getTopLinks(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) Instant from,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) Instant to,
            @RequestParam(defaultValue = "10") int limit) {

        if (from == null)
            from = Instant.now().minus(30, ChronoUnit.DAYS);
        if (to == null)
            to = Instant.now();

        return ResponseEntity.ok(service.getTopLinks(from, to, limit));
    }
}
