package com.example.golinks.repository;

import com.example.golinks.model.GoLinkEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface GoLinkRepository extends JpaRepository<GoLinkEntity, UUID> {
    Optional<GoLinkEntity> findByName(String name);
}
