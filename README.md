# ig-monitoring

A simple Node.js/TypeScript service that watches Instagram follower changes and notifies a webhook when followers are gained or lost.

## Setup

```bash
npm install
npm start
```

## API

- `POST /subscribe`
  - Body: `{ "username": "<ig username>", "password": "<ig password>", "webhookUrl": "https://example.com/webhook" }`
  - Starts monitoring the specified Instagram account. Follower changes are sent to the webhook.
- `DELETE /subscribe/:username`
  - Stops monitoring the account.

The service checks followers every minute.

