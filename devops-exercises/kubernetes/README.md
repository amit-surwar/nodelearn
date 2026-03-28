# Kubernetes — Deploy nodelearn to a K8s Cluster

Learn Kubernetes by deploying your Dockerized nodelearn API.

## Prerequisites
- Docker Deep Dive completed
- AWS EC2 exercise completed
- Install kubectl: https://kubernetes.io/docs/tasks/tools/

## What You'll Learn
- Pods, Deployments, Services
- ConfigMaps and Secrets
- Scaling and Load Balancing
- Health checks and auto-healing

---

## Key Concepts

### What is Kubernetes?
Docker runs ONE container. Kubernetes manages THOUSANDS of containers across multiple servers.

Think of it like this:
- **Docker** = running one restaurant
- **Kubernetes** = managing a chain of 100 restaurants (scaling, replacing bad ones, load balancing)

### Core Components

| Component | What it is | Real-world analogy |
|-----------|-----------|-------------------|
| **Pod** | Smallest unit, runs your container | A single worker |
| **Deployment** | Manages multiple pods | A team manager |
| **Service** | Exposes pods to traffic | A phone number to reach the team |
| **ConfigMap** | Non-secret configuration | A shared settings sheet |
| **Secret** | Sensitive data (passwords) | A locked safe |
| **Ingress** | Routes external traffic | A front desk receptionist |

---

## Exercise Files (we'll create these step by step)

```
kubernetes/
  deployment.yaml    # Defines how to run the app
  service.yaml       # Exposes the app to traffic
  configmap.yaml     # Environment variables
  secret.yaml        # Sensitive env vars
  ingress.yaml       # External access
```

## Coming Soon
This exercise will be built when you're ready for Phase 4.
Run the Docker and AWS exercises first!
