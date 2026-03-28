# Node.js + Docker + AWS ECS

Deploy your Dockerized nodelearn API to AWS Elastic Container Service.

## What is ECS?
ECS runs your Docker containers in AWS. Instead of managing EC2 servers yourself, ECS handles:
- Starting/stopping containers
- Scaling up when traffic increases
- Restarting crashed containers
- Load balancing across containers

## ECS vs EC2 vs Kubernetes

| Service | What you manage | Best for |
|---------|----------------|----------|
| **EC2** | Everything (OS, Node, Nginx, PM2) | Full control, learning |
| **ECS** | Just Docker containers | Production Docker apps |
| **EKS** | Kubernetes on AWS | Teams already using K8s |
| **Lambda** | Just code (no servers) | Small functions, APIs |

## Architecture

```
Internet
  │
  v
Application Load Balancer (ALB)
  │
  ├── ECS Task 1 (Docker container running nodelearn)
  ├── ECS Task 2 (Docker container running nodelearn)
  └── ECS Task 3 (Docker container running nodelearn)
  │
  v
MongoDB Atlas (external database)
```

---

## Prerequisites
- Docker exercises completed
- AWS CLI configured (`aws configure`)
- Docker image of nodelearn built and tested locally

---

## Step 1: Push Docker Image to AWS ECR

ECR (Elastic Container Registry) is AWS's Docker Hub.

```bash
# Create ECR repository
aws ecr create-repository \
  --repository-name nodelearn \
  --region ap-south-1

# Login to ECR
aws ecr get-login-password --region ap-south-1 | \
  docker login --username AWS --password-stdin \
  YOUR_ACCOUNT_ID.dkr.ecr.ap-south-1.amazonaws.com

# Build production image
docker build --target production -t nodelearn:prod .

# Tag for ECR
docker tag nodelearn:prod \
  YOUR_ACCOUNT_ID.dkr.ecr.ap-south-1.amazonaws.com/nodelearn:latest

# Push to ECR
docker push \
  YOUR_ACCOUNT_ID.dkr.ecr.ap-south-1.amazonaws.com/nodelearn:latest
```

---

## Step 2: Create ECS Cluster

```
AWS Console > ECS > Create Cluster
- Cluster name: nodelearn-cluster
- Infrastructure: AWS Fargate (serverless — no EC2 to manage)
- Click Create
```

### Fargate vs EC2 Launch Type

| Type | What it means | Cost |
|------|-------------|------|
| **Fargate** | AWS manages the servers | Pay per task (container) |
| **EC2** | You manage the servers | Pay for EC2 instances |

Use Fargate for simplicity. Use EC2 launch type for cost optimization at scale.

---

## Step 3: Create Task Definition

A Task Definition is like a recipe — it tells ECS how to run your container.

```
AWS Console > ECS > Task Definitions > Create
- Task name: nodelearn-task
- Launch type: Fargate
- OS: Linux/X86_64
- CPU: 0.25 vCPU
- Memory: 0.5 GB

Container:
- Name: nodelearn
- Image: YOUR_ACCOUNT_ID.dkr.ecr.ap-south-1.amazonaws.com/nodelearn:latest
- Port: 3000

Environment Variables:
- PORT = 3000
- MONGODB_URI = your_atlas_connection_string
- JWT_SECRET = your_production_secret
- NODE_ENV = production

Logging:
- Log driver: awslogs
- Log group: /ecs/nodelearn
- Region: ap-south-1
```

---

## Step 4: Create a Service

A Service keeps your tasks (containers) running and connects them to a load balancer.

```
AWS Console > ECS > Your Cluster > Create Service
- Launch type: Fargate
- Task definition: nodelearn-task
- Service name: nodelearn-service
- Desired tasks: 2 (runs 2 containers for reliability)

Networking:
- VPC: your VPC
- Subnets: public subnets
- Security group: allow port 3000
- Auto-assign public IP: ON

Load Balancer:
- Type: Application Load Balancer
- Create new ALB: nodelearn-alb
- Listener port: 80
- Target group: nodelearn-targets
- Health check path: /api/v1/health
```

---

## Step 5: Test Your Deployment

```bash
# Find your ALB DNS name
aws elbv2 describe-load-balancers \
  --names nodelearn-alb \
  --query 'LoadBalancers[0].DNSName' \
  --output text

# Test it!
curl http://YOUR_ALB_DNS/api/v1/health
```

You should get: `{ "success": true, "data": { "status": "OK" } }`

---

## Step 6: Auto-Scaling

```
AWS Console > ECS > Your Service > Update > Auto Scaling
- Min tasks: 1
- Max tasks: 5
- Target tracking:
  - Metric: ECSServiceAverageCPUUtilization
  - Target: 70%
```

This means: if CPU goes above 70%, automatically launch more containers.

---

## Step 7: View Logs in CloudWatch

```
AWS Console > CloudWatch > Log Groups > /ecs/nodelearn
```

You'll see logs from all your running containers — same as the terminal output you saw locally.

---

## Step 8: Update Deployment

When you push new code:

```bash
# Build new image
docker build --target production -t nodelearn:prod .

# Tag and push to ECR
docker tag nodelearn:prod YOUR_ACCOUNT_ID.dkr.ecr.ap-south-1.amazonaws.com/nodelearn:latest
docker push YOUR_ACCOUNT_ID.dkr.ecr.ap-south-1.amazonaws.com/nodelearn:latest

# Force new deployment (pulls latest image)
aws ecs update-service \
  --cluster nodelearn-cluster \
  --service nodelearn-service \
  --force-new-deployment
```

---

## ECS Concepts Summary

| Concept | What it is | Analogy |
|---------|-----------|---------|
| **Cluster** | Group of resources | A kitchen |
| **Task Definition** | Container recipe | A recipe card |
| **Task** | Running container | A dish being cooked |
| **Service** | Manages tasks | A head chef ensuring dishes are ready |
| **ECR** | Docker image storage | A pantry of ingredients |
| **ALB** | Load balancer | A waiter distributing orders |
| **Fargate** | Serverless compute | A kitchen that manages itself |

---

## Cost Estimate

| Resource | Cost |
|----------|------|
| Fargate (0.25 vCPU, 0.5 GB) | ~$9/month per task |
| ALB | ~$16/month + traffic |
| ECR | $0.10/GB stored |
| CloudWatch Logs | First 5 GB free |

For learning: run 1 task, delete when done.
