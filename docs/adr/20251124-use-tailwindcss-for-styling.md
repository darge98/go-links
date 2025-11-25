# Use TailwindCSS for Frontend Styling

- Status: accepted
- Date: 2025-11-24
- Decision-makers: Project Team
- Technical Story: Choose CSS framework for Angular frontend

## Context and Problem Statement

We need a styling approach for the Angular frontend that is modern, maintainable, and efficient. Options include traditional CSS, preprocessors, or utility-first frameworks.

## Decision Drivers

- Development speed
- Bundle size
- Maintainability
- Learning curve
- Customization flexibility

## Considered Options

1. **Plain CSS/SCSS** - Write custom styles
2. **Bootstrap** - Component-based CSS framework
3. **Material Design** - Angular Material
4. **TailwindCSS** - Utility-first CSS framework

## Decision Outcome

Chosen option: **TailwindCSS 4**, because:

- **Utility-first**: Rapid UI development without leaving HTML
- **Small bundle**: PurgeCSS removes unused styles (~10KB production)
- **Customizable**: Easy to customize design tokens
- **No naming conventions**: No need to invent CSS class names
- **Consistent design**: Built-in design system
- **Modern**: Active development and community
- **JIT mode**: Instant compilation during development

### Configuration

```typescript
// tailwind.config.js
export default {
  content: ["./src/**/*.{html,ts}"],
  theme: {
    extend: {},
  },
  plugins: [],
};
```

### Example Usage

```html
<div class="container mx-auto px-4 py-8">
  <h1 class="text-3xl font-bold text-gray-900 mb-8">GoLinks</h1>
  <button
    class="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
  >
    Create New Link
  </button>
</div>
```

### Consequences

**Positive:**

- Very fast UI development
- Consistent spacing, colors, typography
- Small production bundle size
- Easy responsive design
- Good documentation
- Large community

**Negative:**

- HTML becomes verbose with many classes
- Learning curve for utility-first approach
- May feel "messy" to traditional CSS developers
- Requires build step configuration

## Compliance

This decision aligns with:

- Modern frontend development practices
- Performance optimization (tree-shaking)
- Utility-first CSS methodology

## Related Decisions

- [Use Angular Standalone Components](./20251124-use-angular-standalone-components.md)
- [Use Zoneless Change Detection](./20251124-use-angular-signals-and-zoneless-change-detection.md)
