# DevOps Learning Path — Complete Guide

Your company uses: AWS, Jenkins, GitHub Actions, GitLab, Terraform, Ansible, Prometheus, Grafana, Docker, Kubernetes

This folder contains hands-on exercises for EACH tool, using your nodelearn project.

---

## The Path (follow in order)

| Phase | Tool | Folder | Time | Status |
|-------|------|--------|------|--------|
| 2 | Docker Deep Dive | `docker/` | 3-5 days | START HERE |
| 3 | AWS EC2 + CloudWatch | `aws/` | 3-5 days | After Docker |
| 4 | Kubernetes | `kubernetes/` | 1-2 weeks | After AWS |
| 5 | Terraform | `terraform/` | 1 week | After Kubernetes |
| 6 | Ansible | `ansible/` | 1 week | After Terraform |
| 7 | Prometheus + Grafana | `monitoring/` | 3-5 days | After Ansible |
| 8 | Jenkins + GitLab CI | `jenkins/` | 3-5 days | After Monitoring |

---

## How Everything Connects

```
Code (GitHub)
  |
  v
CI/CD (Jenkins/GitHub Actions) --- runs tests, builds Docker image
  |
  v
Docker (Container) --- packages your app
  |
  v
Kubernetes (Orchestration) --- runs containers at scale
  |
  v
AWS EC2 (Infrastructure) --- servers that run Kubernetes
  |
  v
Terraform (Infra as Code) --- creates AWS resources automatically
  |
  v
Ansible (Config Management) --- configures servers automatically
  |
  v
Prometheus + Grafana (Monitoring) --- watches everything
```

---

## Rules for Learning

1. ALWAYS do the exercises hands-on — don't just read
2. Break things on purpose — then fix them
3. Follow the order — each phase builds on the previous one
4. Take notes — write down what each command does
5. If stuck, re-read the exercise, then search, then ask

Good luck!
