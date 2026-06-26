# Samples & corpus notes

PhilGEPS analysis artifacts live here alongside the bundled app projects in `public/projects/`.

| Path | Purpose |
|------|---------|
| [`philgeps/`](philgeps/) | Archival `project.json`, indicator pack copies, corpus docs |

## Bundled vs samples

| Location | Role |
|----------|------|
| `public/projects/mphilgeps.json`, `philgeps-1.5.json` | **Runtime** — loaded from the project picker |
| `samples/philgeps/project.json` | **Archive** — same mapping exercise; useful for diffing, scripts, or re-import tests |
| `samples/philgeps/docs/` | Indicator reference and corpus analysis (not rendered by the app) |
| `public/indicator_packs/` | **Authoritative** indicator definitions the app loads |

Regenerate bundled PhilGEPS projects from Excel:

```bash
npm run build-philgeps-projects
```

Indicator packs are **app-level** (browser preferences under **Risk Indicators**), not stored on project JSON.
