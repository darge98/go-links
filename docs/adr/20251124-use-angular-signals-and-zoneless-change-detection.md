# Use Angular Signals and Zoneless Change Detection

- Status: accepted
- Date: 2025-11-24
- Decision-makers: Project Team
- Technical Story: Choose change detection strategy for Angular frontend

## Context and Problem Statement

Angular 21 introduces Signals and experimental zoneless change detection. We need to decide whether to use the traditional Zone.js-based change detection or adopt the new signal-based approach.

## Decision Drivers

- Performance and efficiency
- Modern Angular patterns
- Future-proofing the application
- Developer experience
- Learning curve

## Considered Options

1. Traditional Zone.js with automatic change detection
2. OnPush change detection strategy
3. Signals with zoneless change detection (experimental)

## Decision Outcome

Chosen option: **Signals with zoneless change detection**, because:

- **Performance**: Zoneless mode is more efficient, no global monkey-patching
- **Granular reactivity**: Signals provide fine-grained reactive state management
- **Modern patterns**: Aligns with Angular's future direction
- **Explicit**: Makes data flow more explicit and predictable
- **Bundle size**: Removes Zone.js dependency (~50KB)
- **Future-proof**: Angular team is moving toward signals as the default

### Configuration

```typescript
// app.config.ts
export const appConfig: ApplicationConfig = {
  providers: [
    provideExperimentalZonelessChangeDetection(),
    provideRouter(routes),
    provideHttpClient(),
  ],
};
```

### Example Usage

```typescript
export class GoLinkService {
  goLinks = signal<GoLink[]>([]);
  isLoading = signal(false);

  loadAll(): void {
    this.isLoading.set(true);
    this.http.get<GoLink[]>(this.baseUrl).subscribe({
      next: (links) => {
        this.goLinks.set(links);
        this.isLoading.set(false);
      },
    });
  }
}
```

### Consequences

**Positive:**

- Smaller bundle size (no Zone.js)
- Better performance
- More predictable change detection
- Clearer data flow
- Aligns with Angular's future

**Negative:**

- Experimental feature (may have breaking changes)
- Less community resources
- Learning curve for team members
- Some third-party libraries may not be compatible

## Compliance

This decision aligns with:

- Angular 21+ best practices
- Performance optimization guidelines
- Modern reactive programming patterns

## Related Decisions

- [Use Angular Standalone Components](./20251124-use-angular-standalone-components.md)
- [Use TailwindCSS](./20251124-use-tailwindcss.md)
