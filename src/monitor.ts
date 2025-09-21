import { IgApiClient } from 'instagram-private-api';
import axios from 'axios';

export interface Subscription {
  username: string;
  password: string;
  webhookUrl: string;
}

export class FollowerMonitor {
  private ig = new IgApiClient();
  private previousFollowers = new Set<string>();

  constructor(private subscription: Subscription) {
    this.ig.state.generateDevice(subscription.username);
  }

  async login() {
    await this.ig.account.login(this.subscription.username, this.subscription.password);
  }

  private async fetchFollowerIds(): Promise<Set<string>> {
    const followers = this.ig.feed.accountFollowers(this.ig.state.cookieUserId);
    const ids = new Set<string>();
    let items = await followers.items();
    for (const user of items) {
      ids.add(user.pk.toString());
    }
    // Note: For large accounts this only fetches the first page of followers.
    return ids;
  }

  async check() {
    const current = await this.fetchFollowerIds();
    const added = [...current].filter(id => !this.previousFollowers.has(id));
    const removed = [...this.previousFollowers].filter(id => !current.has(id));
    if (added.length || removed.length) {
      await axios.post(this.subscription.webhookUrl, { added, removed });
    }
    this.previousFollowers = current;
  }

  start(intervalMs: number) {
    this.check();
    setInterval(() => this.check(), intervalMs);
  }
}
