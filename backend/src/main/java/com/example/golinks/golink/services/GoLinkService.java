package com.example.golinks.golink.services;

import com.example.golinks.golink.api.GoLink;
import com.example.golinks.golink.repositories.GoLinkEntity;
import com.example.golinks.golink.repositories.GoLinkRepository;
import com.example.golinks.core.exception.ResourceConflictException;
import com.example.golinks.core.exception.ResourceNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.Arrays;
import java.util.List;
import java.util.UUID;
import java.util.regex.Pattern;
import java.util.stream.Collectors;

@Service
@Transactional
public class GoLinkService {

    private static final Pattern NAME_PATTERN = Pattern.compile("^[a-z0-9_-]+$");
    private final GoLinkRepository repository;

    public GoLinkService(GoLinkRepository repository) {
        this.repository = repository;
    }

    public GoLink create(GoLink input) {
        validateName(input.name());
        validateTargetUrl(input.targetUrl());

        String name = input.name().toLowerCase();
        if (repository.findByName(name).isPresent()) {
            throw new ResourceConflictException("GoLink with name '" + name + "' already exists");
        }

        GoLinkEntity entity = new GoLinkEntity();
        entity.setId(UUID.randomUUID());
        entity.setName(name);
        entity.setTargetUrl(input.targetUrl());
        entity.setDescription(input.description());
        entity.setTags(input.tags() != null ? String.join(",", input.tags()) : null);
        entity.setCreatedAt(Instant.now());
        entity.setUpdatedAt(Instant.now());
        entity.setLockUuid(UUID.randomUUID());

        GoLinkEntity saved = repository.save(entity);
        return mapToRecord(saved);
    }

    public GoLink update(UUID id, GoLink input, UUID ifMatch) {
        validateTargetUrl(input.targetUrl());

        GoLinkEntity entity = repository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("GoLink not found with id: " + id));

        if (!entity.getLockUuid().equals(ifMatch)) {
            throw new ResourceConflictException(
                    "Optimistic locking failure: Resource has been modified by another transaction");
        }

        // Name is immutable for now, or at least not updated here based on plan (only
        // target, desc, tags)
        // If name update is needed, we'd need validation and uniqueness check again.
        // Plan says "Update fields from input". Let's assume name is immutable or we
        // just update other fields.
        // Usually slugs are immutable or hard to change. Let's update targetUrl,
        // description, tags.

        entity.setTargetUrl(input.targetUrl());
        entity.setDescription(input.description());
        entity.setTags(input.tags() != null ? String.join(",", input.tags()) : null);
        entity.setUpdatedAt(Instant.now());
        entity.setLockUuid(UUID.randomUUID());

        GoLinkEntity saved = repository.save(entity);
        return mapToRecord(saved);
    }

    public void delete(UUID id) {
        if (!repository.existsById(id)) {
            throw new ResourceNotFoundException("GoLink not found with id: " + id);
        }
        repository.deleteById(id);
    }

    @Transactional(readOnly = true)
    public List<GoLink> findAll() {
        return repository.findAll().stream()
                .map(this::mapToRecord)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public GoLink findById(UUID id) {
        return repository.findById(id)
                .map(this::mapToRecord)
                .orElseThrow(() -> new ResourceNotFoundException("GoLink not found with id: " + id));
    }

    @Transactional(readOnly = true)
    public GoLink findByName(String name) {
        return repository.findByName(name.toLowerCase())
                .map(this::mapToRecord)
                .orElseThrow(() -> new ResourceNotFoundException("GoLink not found with name: " + name));
    }

    private void validateName(String name) {
        if (name == null || !NAME_PATTERN.matcher(name.toLowerCase()).matches()) {
            throw new IllegalArgumentException("Invalid name format. Allowed characters: a-z, 0-9, _, -");
        }
    }

    private void validateTargetUrl(String url) {
        if (url == null || (!url.startsWith("http://") && !url.startsWith("https://"))) {
            throw new IllegalArgumentException("Target URL must start with http:// or https://");
        }
    }

    private GoLink mapToRecord(GoLinkEntity entity) {
        List<String> tags = entity.getTags() != null && !entity.getTags().isEmpty()
                ? Arrays.asList(entity.getTags().split(","))
                : List.of();
        return new GoLink(
                entity.getId(),
                entity.getName(),
                entity.getTargetUrl(),
                entity.getDescription(),
                tags,
                entity.getCreatedAt(),
                entity.getLockUuid());
    }
}
