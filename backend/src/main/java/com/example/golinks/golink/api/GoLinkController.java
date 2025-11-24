package com.example.golinks.golink.api;

import com.example.golinks.golink.services.GoLinkService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.net.URI;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/golinks")
public class GoLinkController {

    private final GoLinkService service;

    public GoLinkController(GoLinkService service) {
        this.service = service;
    }

    @PostMapping
    public ResponseEntity<GoLink> create(@RequestBody GoLink input) {
        GoLink created = service.create(input);
        return ResponseEntity
                .created(URI.create("/api/golinks/" + created.id()))
                .eTag(created.lockUuid().toString())
                .body(created);
    }

    @GetMapping
    public List<GoLink> getAll() {
        return service.findAll();
    }

    @GetMapping("/{id}")
    public ResponseEntity<GoLink> getById(@PathVariable UUID id) {
        GoLink found = service.findById(id);
        return ResponseEntity.ok()
                .eTag(found.lockUuid().toString())
                .body(found);
    }

    @PutMapping("/{id}")
    public ResponseEntity<GoLink> update(
            @PathVariable UUID id,
            @RequestBody GoLink input,
            @RequestHeader(value = "If-Match", required = false) String ifMatch) {

        if (ifMatch == null) {
            throw new IllegalArgumentException("If-Match header is required for updates");
        }

        // ETag header often comes with quotes, e.g., "uuid". Remove them if present.
        String cleanIfMatch = ifMatch.replace("\"", "");
        UUID lockUuid;
        try {
            lockUuid = UUID.fromString(cleanIfMatch);
        } catch (IllegalArgumentException e) {
            throw new IllegalArgumentException("Invalid If-Match header format");
        }

        GoLink updated = service.update(id, input, lockUuid);
        return ResponseEntity.ok()
                .eTag(updated.lockUuid().toString())
                .body(updated);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable UUID id) {
        service.delete(id);
        return ResponseEntity.noContent().build();
    }
}
