import express from 'express';
import { FollowerMonitor, Subscription } from './monitor';

const app = express();
app.use(express.json());

const monitors = new Map<string, FollowerMonitor>();

app.post('/subscribe', async (req, res) => {
  const { username, password, webhookUrl } = req.body as Subscription;
  if (!username || !password || !webhookUrl) {
    return res.status(400).json({ message: 'username, password and webhookUrl required' });
  }
  if (monitors.has(username)) {
    return res.status(409).json({ message: 'Already subscribed' });
  }
  const monitor = new FollowerMonitor({ username, password, webhookUrl });
  try {
    await monitor.login();
  } catch (err) {
    return res.status(401).json({ message: 'Instagram login failed', error: (err as Error).message });
  }
  monitor.start(60 * 1000);
  monitors.set(username, monitor);
  res.json({ message: 'Subscribed' });
});

app.delete('/subscribe/:username', (req, res) => {
  const username = req.params.username;
  const monitor = monitors.get(username);
  if (!monitor) {
    return res.status(404).json({ message: 'not found' });
  }
  monitors.delete(username);
  res.json({ message: 'Unsubscribed' });
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`IG monitor service running on port ${port}`);
});
