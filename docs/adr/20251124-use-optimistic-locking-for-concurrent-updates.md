# Use Optimistic Locking for Concurrent Updates

- Status: accepted
- Date: 2025-11-24
- Decision-makers: Project Team
- Technical Story: Prevent lost updates when multiple users edit the same GoLink

## Context and Problem Statement

Multiple users may attempt to edit the same GoLink simultaneously. We need a mechanism to prevent lost updates while maintaining good user experience.

## Decision Drivers

- Data integrity
- User experience
- Scalability
- Database compatibility
- Implementation complexity

## Considered Options

1. **No concurrency control** - Last write wins
2. **Pessimistic locking** - Lock database rows during edit
3. **Optimistic locking** - Check version before update
4. **Versioned entities** - Maintain full version history

## Decision Outcome

Chosen option: **Optimistic locking with UUID-based ETag**, because:

- **Better UX**: Users are not blocked while editing
- **Scalability**: No database locks held during user interaction
- **Simple**: UUID-based version tracking
- **RESTful**: Uses standard HTTP `ETag` and `If-Match` headers
- **Conflict detection**: Detects concurrent modifications
- **Fail-safe**: Returns 409 Conflict on version mismatch

### Implementation

**Database:**

```sql
CREATE TABLE golink (
    id UUID PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    target_url VARCHAR(2000) NOT NULL,
    lock_uuid UUID NOT NULL  -- Version identifier
);
```

**Backend:**

```java
@PutMapping("/{id}")
public ResponseEntity<GoLink> update(
    @PathVariable UUID id,
    @RequestBody GoLinkRequest request,
    @RequestHeader("If-Match") String etag
) {
    return ResponseEntity.ok()
        .eTag(updated.lockUuid().toString())
        .body(updated);
}
```

**Frontend:**

```typescript
update(id: string, data: Partial<GoLink>, etag: string) {
  return this.http.put<GoLink>(`${this.baseUrl}/${id}`, data, {
    headers: { 'If-Match': etag }
  });
}
```

### Consequences

**Positive:**

- No database locks during user editing
- Clear conflict detection
- Standard HTTP semantics
- Users are informed of conflicts
- Good scalability

**Negative:**

- User may lose work if conflict occurs
- Requires handling 409 errors on frontend
- More complex than "last write wins"
- Users must refresh and re-edit on conflict

### Conflict Resolution

When a 409 Conflict occurs:

1. Display error message to user
2. Prompt to refresh data
3. User must manually merge changes

## Compliance

This decision aligns with:

- REST API design principles
- HTTP specification (ETag, If-Match)
- Concurrent programming best practices

## Related Decisions

- [Use Java 21 Records](./20251124-use-java-21-records-for-dtos.md)
- [Use PostgreSQL](./20251124-use-postgresql.md)
