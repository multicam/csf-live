Here's a comprehensive summary of Convex pricing based on the available documentation:

---

## Convex Pricing Summary

### Plans Overview

Convex offers **Free/Starter** and **Professional** plans (with a **Scale** plan in development). [[Limits](https://docs.convex.dev/production/state/limits)]

---

### Team

| | Free/Starter | Professional |
|---|---|---|
| Developers | 1–6 | $25/member/month |
| Deployments | 40 | 120 |

[[Limits](https://docs.convex.dev/production/state/limits)]

---

### Database

| | Free/Starter | Professional |
|---|---|---|
| Storage | 0.5 GiB included; $0.22/GiB additional | 50 GiB included; $0.20/GiB additional |
| Bandwidth | 1 GiB/month included; $0.22/GiB additional | 50 GiB/month included; $0.20/GiB additional |
| Tables | 10,000 (per deployment) | 10,000 (per deployment) |
| Indexes per table | 32 | 32 |

[[Limits](https://docs.convex.dev/production/state/limits)]

---

### Functions

| | Free/Starter | Professional |
|---|---|---|
| Function calls | 1,000,000/month included; $2.20 per additional 1M | 25,000,000/month included; $2 per additional 1M |
| Action execution | 20 GiB-hours included; $0.33/GiB-hour additional | 250 GiB-hours included; $0.30/GiB-hour additional |
| Code size | 32 MiB | 32 MiB |

> **Note:** Action compute is billed on **wall-clock time**, not CPU time. This means waiting on long-running API calls (e.g., LLM responses) counts toward compute billing. [[Pricing thread](https://discord.com/channels/1019350475847499849/1309180091338719272)]

[[Limits](https://docs.convex.dev/production/state/limits)]

---

### File Storage

| | Free/Starter | Professional |
|---|---|---|
| Storage | 1 GiB included; $0.033/month per additional GiB | 100 GiB included; $0.03/month per additional GiB |
| Bandwidth | 1 GiB/month included; $0.33/GiB additional | 50 GiB/month included; $0.30/GiB additional |

[[File Storage](https://docs.convex.dev/production/state/limits#file-storage)]

---
 integratio
### Backups

- Free/Starter: Up to **2 backups** stored per deployment at a time; accessible for up to **7 days**.
- Professional: Many backups with standard usage-based pricing.
- Backup costs use the same bandwidth and storage pricing as user file storage. [[Backup & Restore](https://docs.convex.dev/database/backup-restore)]

---

### Spending Limits

On paid plans, you can set:
- A **warning threshold** (soft limit — email notification only)
- A **disable threshold** (hard limit — projects are disabled if exceeded)

Seat fees do **not** count toward spending limits. [[Billing](https://docs.convex.dev/dashboard/teams/teams#billing)]

---

### Key Notes

- **Free plan:** Hard resource limits apply; new mutations may fail after limits are hit.
- **Paid plans:** No hard resource limits — can scale to billions of documents and TBs of storage. [[Limits](https://docs.convex.dev/production/state/limits#vector-search)]
- A **Scale plan** is in development, aimed at teams with high traffic, offering more pass-through resource pricing. [[Pricing thread](https://discord.com/channels/1019350475847499849/1309180091338719272)]

For the most up-to-date pricing, visit the [Convex pricing page](https://www.convex.dev/pricing).