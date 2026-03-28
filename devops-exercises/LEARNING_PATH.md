# AWS + DevOps Learning Path

Learn step by step, hands-on, using your nodelearn project.

---

## The Path (follow in order)

| Step | Topic | Folder | Time |
|------|-------|--------|------|
| 1 | IAM (Access Control) | `aws-core/` | 1 day |
| 2 | VPC (Networking) | `aws-core/` | 1 day |
| 3 | EC2 (Virtual Servers) | `aws-core/` | 2 days |
| 4 | S3 (File Storage) | `aws-core/` | 1 day |
| 5 | Docker (Containers) | `docker/` | 3 days |
| 6 | ECS (Run Docker on AWS) | `aws-ecs/` | 3 days |
| 7 | Amplify (Deploy React/Angular) | `aws-amplify/` | 2 days |
| 8 | CodePipeline (CI/CD on AWS) | `aws-codepipeline/` | 2 days |

---

## How It All Connects

```
Frontend (Angular/React)        Backend (Node.js)
  │                               │
  v                               v
AWS Amplify (Step 7)            Docker (Step 5)
  │                               │
  │                               v
  │                             AWS ECS (Step 6)
  │                               │
  └───── both deployed via ───────┘
                │
                v
        AWS CodePipeline (Step 8)
                │
        runs inside ──→ VPC (Step 2)
        uses ──→ IAM (Step 1) for permissions
        uses ──→ EC2 (Step 3) for compute
        uses ──→ S3 (Step 4) for storage
```

---

## Rules

1. Do exercises hands-on — don't just read
2. Follow the order — each step builds on the previous
3. STOP EC2 instances when not using them (avoid charges)
4. Delete resources after learning (avoid charges)
5. We will do each step together — just tell me when ready
