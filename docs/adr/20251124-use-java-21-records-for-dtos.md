# Use Java 21 Records for DTOs

- Status: accepted
- Date: 2025-11-24
- Decision-makers: Project Team
- Technical Story: Design data transfer layer for REST API

## Context and Problem Statement

We need to define data transfer objects (DTOs) for the REST API. Java offers several options: traditional POJOs with getters/setters, Lombok annotations, or Java 21 Records.

## Decision Drivers

- Immutability by default is preferred for DTOs
- Reduce boilerplate code
- Type safety and compile-time validation
- Modern Java features
- Clear, concise code

## Considered Options

1. Traditional POJOs with manual getters/setters
2. Lombok @Data annotations
3. Java 21 Records

## Decision Outcome

Chosen option: **Java 21 Records**, because:

- **Immutability**: Records are immutable by default, which is ideal for DTOs
- **Conciseness**: One line of code instead of dozens of boilerplate
- **Built-in features**: Automatic `equals()`, `hashCode()`, `toString()`
- **No dependencies**: No need for Lombok annotation processor
- **Modern Java**: Leverages Java 21 native features
- **Pattern matching**: Enables future use of pattern matching features

### Example

```java
public record GoLink(
    UUID id,
    String name,
    String targetUrl,
    String description,
    List<String> tags,
    Instant createdAt,
    UUID lockUuid
) {}
```

### Consequences

**Positive:**

- Clean, readable code
- Immutable objects prevent accidental modification
- Better IDE support for Java Records
- Easier refactoring

**Negative:**

- Cannot use inheritance (records are final)
- All fields are final (cannot be modified after creation)
- Requires Java 16+

## Compliance

This decision aligns with:

- Modern Java best practices
- Functional programming principles
- API design guidelines for immutability

## Related Decisions

- [Use Spring Boot 3.3](./20251125-use-spring-boot-3-3.md)
- [No Lombok in Backend](./20251125-no-lombok-in-backend.md)
