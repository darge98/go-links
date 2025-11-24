package com.example.golinks.golink.api;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

public record GoLink(
                UUID id,
                String name,
                String targetUrl,
                String description,
                List<String> tags,
                Instant createdAt,
                UUID lockUuid) {
}
