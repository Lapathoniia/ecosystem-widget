# Lapathoniia Ecosystem Widget

Embeddable web component for showing public Lapathoniia ecosystem projects.

This repository contains only public client-side widget code and examples. It
does not contain API keys, database credentials, ranking internals, or private
Lapathoniia infrastructure code.

## Embed

```html
<lapathoniia-ecosystem-widget
  lang="uk"
  limit="3">
</lapathoniia-ecosystem-widget>

<script
  async
  src="https://lapathoniia.top/widgets/ecosystem/v1/widget.js">
</script>
```

The widget fetches public data from:

```text
https://lapathoniia.top/api/ecosystem/widgets/top-projects?limit=3&lang=uk
```

No API key is required. The endpoint returns public project cards only.

Production widget script:

```text
https://lapathoniia.top/widgets/ecosystem/v1/widget.js
```

## Attributes

- `lang`: `uk` or `en`; default is `uk`.
- `limit`: number of projects from `1` to `12`; default is `3`.
- `api-url`: optional custom API endpoint for staging or testing.

## Styling

The widget uses Shadow DOM to avoid conflicts with host websites. Customize it
with CSS variables:

```css
lapathoniia-ecosystem-widget {
  --lapathoniia-widget-bg: #071316;
  --lapathoniia-widget-text: #f8f0da;
  --lapathoniia-widget-title: #fff8e8;
  --lapathoniia-widget-muted: rgba(248, 240, 218, 0.72);
  --lapathoniia-widget-accent: #8bdbe7;
  --lapathoniia-widget-radius: 14px;
  --lapathoniia-widget-max-width: 520px;
}
```

The component also exposes `part` names such as `container`, `header`, `card`,
`logo`, `name`, `description`, `badge`, and `footer` for advanced styling.

## Runtime Behavior

- Loads asynchronously.
- Polls for updates using the API-provided refresh interval, currently 5
  minutes.
- Adds jitter to avoid synchronized polling.
- Polls only while visible and while the document is visible.
- Uses `ETag` / `If-None-Match` and keeps the last good data on transient
  errors.
