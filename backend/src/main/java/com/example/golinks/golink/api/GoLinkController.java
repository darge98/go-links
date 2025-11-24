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
                .body(created);
    }

    @GetMapping
    public List<GoLink> getAll() {
        return service.findAll();
    }

    @GetMapping("/{id}")
    public ResponseEntity<GoLink> getById(@PathVariable UUID id) {
        return ResponseEntity.ok(service.findById(id));
    }
}
