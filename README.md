# chronos

Welcome to the repository for Chronos, a web UI for seeing at-a-glance info of availability based on a shared calendar in Google Calendar. The idea is pretty rudimentary and it's likely that you'll find other implementations that do all this and more, but this serves the use case I'm looking for with my specific requirements.

## Motivations

My current team keeps track of offs, leaves, and other general unavailabilities through a shared calendar on Google Calendar. While this gives easy-to-see, at-a-glance info of who would be unavailable, there isn't a way to see who's left. This little tool was therefore built to quickly determine this, based on a config file.

## Getting started

You'll need to do some setting up before you're able to use this project. Work is underway to make it easier to set up — stay tuned!

1. [Calendar set-up](#calendar-set-up)
2. [Service account set-up](#service-account-set-up)
3. [Project configuration](#project-configuration)
4. [Deployment](#deployment)

### Calendar set-up

1. [Create a new calendar](https://support.google.com/calendar/answer/37095). Open Google Calendar, select "Add other calendars", then "Create new calendar". Enter a name for the calendar, then click on the "Create calendar" button.
2. Once created, select "Configure" at the bottom of the screen or select the name of the calendar under "Settings for my calendars".
3. Navigate to the "Integrate calendar" tab and note the calendar ID. You'll need this for later!
4. Share the calendar with other people.

When creating events in the calendar, keep in mind the following:

- Create events as all-day events, even for half-day events.
- Use the following format for event names:

  ```
  (<TYPE>[-AM|-PM]) <SUBJECT/PERSON>
  ```

  where:
  - `<TYPE>` refers to a shorthand code that you can configure later (e.g. `OFF` for offs, `AL` for annual leaves)
  - `[-AM|-PM]` are optional modifiers to denote half-day events (e.g. `OFF-AM`)
  - `<SUBJECT/PERSON>` refers to the name of the event or person (e.g. `John Smith`, `New Year's Day`). While the name of the person is read case-insensitively, you should check that the spelling is accurate; not doing so might mean a missed event.

### Service account set-up

0. [Create a new project](https://console.cloud.google.com/projectcreate) if you don't have one.
1. Navigate to the [service accounts page](https://console.cloud.google.com/iam-admin/serviceaccounts) and select "Create service account".
2. Fill in the service account name and ID fields with an appropriate name of your choosing, then select "Create and continue". Select "Done".
3. Select the service account you just created, then navigate to the "Keys" tab.
4. Select "Add key", then choose "Create new key". Choose JSON as the key type.
5. Save the generated file as `credentials.json` somewhere you can access it.
6. Open `credentials.json` and note the value of `client_email`.
7. Navigate to your created calendar's settings, then select the "Shared with" tab.
8. Select "Add people and groups", then enter the `client_email` with the permission minimally at "See event details". Select "Send" once done.

### Project configuration

To run this project, you'll need any Node.js package manager with a Node.js runtime. At least [`pnpm@12`](https://pnpm.io/) is recommended.

0. Clone this repository at a location of your choosing.

   ```sh
   cd [location]
   git clone https://github.com/arashnrim/chronos.git
   cd chronos
   ```

1. Create a copy of `chronos-config.template.json` as `chronos-config.json`, and fill it with the following schema. This configures Chronos to match the name of the person in the event to the right event type.

   ```json
   {
     "people": [
       { "name": "Person A", "color": "#1A2B3C" },
       { "name": "Person B", "color": "#4D5E6F" }
     ],
     "eventTypes": [
       { "code": "AL", "label": "Annual Leave", "priority": 1 },
       { "code": "MC", "label": "Medical Certificate" }
     ]
   }
   ```

   Event types may include a numeric `priority` (defaults to `0`). If a person has overlapping events, Chronos displays only the reason with the highest priority.

2. Create a copy of `.env.template` as `.env`, then populate the values as such:
   - `API_SECRET` is the password for the user to enter to authenticate and use the platform.
   - `CALENDAR_ID` is the ID found in the "Integrate calendar" tab of the calendar's settings page.
   - `GOOGLE_CREDENTIALS_JSON` is a one-line, compact string of the `credentials.json` file. Wrap the string with single quotation marks (i.e. `'{"type":...}'`)
   - `CHRONOS_CONFIG_JSON` is a one-line, compact string of the `chronos-config.json` file. Wrap the string with single quotation marks (i.e. `'{"people":...}'`)
   - Tip: to get a one-line, compact string, you can use VS Code and select "Join lines" from the Command Palette.
   - When adding these values in Vercel's Environment Variables settings, enter only the JSON itself, without the surrounding single quotation marks or the `VARIABLE_NAME=` prefix. The quotation marks above are for `.env` file syntax; if included in Vercel's value, they are treated as part of the string and make it invalid JSON.

### Deployment

If running locally, run the `dev` script:

```sh
pnpm run dev
# or
npm run dev
```

Alternatively, if building for hosting, run the `build` script:

```sh
pnpm run build
# or
npm run build
```

## Licence

This project is made open source with the [MIT Licence](https://github.com/arashnrim/chronos/blob/main/LICENSE.md). Have a look at the licence to know what you're allowed to do.
