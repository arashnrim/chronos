# Astro Starter Kit: Minimal

```sh
pnpm create astro@latest -- --template minimal
```

> 🧑‍🚀 **Seasoned astronaut?** Delete this file. Have fun!

## 🚀 Project Structure

Inside of your Astro project, you'll see the following folders and files:

```text
/
├── public/
├── src/
│   └── pages/
│       └── index.astro
└── package.json
```

Astro looks for `.astro` or `.md` files in the `src/pages/` directory. Each page is exposed as a route based on its file name.

There's nothing special about `src/components/`, but that's where we like to put any Astro/React/Vue/Svelte/Preact components.

Any static assets, like images, can be placed in the `public/` directory.

## 🧞 Commands

All commands are run from the root of the project, from a terminal:

| Command                | Action                                           |
| :--------------------- | :----------------------------------------------- |
| `pnpm install`         | Installs dependencies                            |
| `pnpm dev`             | Starts local dev server at `localhost:4321`      |
| `pnpm build`           | Build your production site to `./dist/`          |
| `pnpm preview`         | Preview your build locally, before deploying     |
| `pnpm astro ...`       | Run CLI commands like `astro add`, `astro check` |
| `pnpm astro -- --help` | Get help using the Astro CLI                     |

## 👀 Want to learn more?

Feel free to check [our documentation](https://docs.astro.build) or jump into our [Discord server](https://astro.build/chat).

## Calendar configuration

Edit `chronos-config.yml` to configure people and event types. Each person has a unique calendar name and color. The trailing text in an event title must match that name exactly. Event type codes are matched against the code in parentheses.

```yaml
people: [{ name: "Person A", color: "#26734D" }]
eventTypes: [{ code: AL, label: "Annual Leave" }]
```

Calendar event titles use `(<TYPE>[-AM|-PM]) <PERSON OR SUBJECT>`, such as `(AL) Person A`, `(OFF-PM) Person B`, `(PH) Holiday`, or `(XYZ) Custom Event`. The optional period is parsed but not returned separately. If the trailing text does not exactly match a configured person name, it is returned as the subject. The event description is also searched for complete configured person names, case-insensitively, so one event can be associated with multiple people. If the description contains the complete word `everyone`, all configured people are associated with the event. Matched people include their configured color; event types have no color. Unknown type codes use the code as their fallback label; malformed titles have null `subject` and `type` fields, but can still have matched `people`.

The `/api/events` response keeps its `{ events }` envelope and reduces each event to `startDate`, `endDate`, `subject`, `people`, and `type`. `people` contains all matches from the title and description. All-day events use Calendar's `date` values; timed events use `dateTime` values. Configuration is bundled at build time, so config changes require a new deployment.
