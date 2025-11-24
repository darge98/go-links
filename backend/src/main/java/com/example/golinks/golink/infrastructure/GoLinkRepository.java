package com.example.golinks.golink.infrastructure;

import com.example.golinks.golink.domain.GoLinkEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface GoLinkRepository extends JpaRepository<GoLinkEntity, UUID> {
    Optional<GoLinkEntity> findByName(String name);
}
