# AWS DevOps Complete Reference Guide
### Project: nodelearn (Node.js + Express + MongoDB API)
### Date: March 28-29, 2026
### AWS Account: 024893219891 | Region: ap-south-1 (Mumbai)

---

## Table of Contents
1. [Architecture Overview](#1-architecture-overview)
2. [AWS Account Setup & Cost Protection](#2-aws-account-setup--cost-protection)
3. [IAM — Identity & Access Management](#3-iam--identity--access-management)
4. [VPC — Virtual Private Cloud](#4-vpc--virtual-private-cloud)
5. [EC2 — Deploy App on Virtual Server](#5-ec2--deploy-app-on-virtual-server)
6. [S3 — File Storage](#6-s3--file-storage)
7. [Docker — Containerization](#7-docker--containerization)
8. [ECR — Push Docker Image to AWS](#8-ecr--push-docker-image-to-aws)
9. [ECS Fargate — Run Containers on AWS](#9-ecs-fargate--run-containers-on-aws)
10. [CodePipeline — Full CI/CD](#10-codepipeline--full-cicd)
11. [Amplify — Deploy React Frontend](#11-amplify--deploy-react-frontend)
12. [Errors & Fixes](#12-errors--fixes)
13. [Cleanup & Cost Management](#13-cleanup--cost-management)
14. [Commands Cheat Sheet](#14-commands-cheat-sheet)
15. [Real Company Project Workflow](#15-real-company-project-workflow)

---

## 1. Architecture Overview

### What We Built
```
Developer pushes code to GitHub
         │
         v
┌─────────────────────────────────────────────┐
│           AWS CodePipeline (CI/CD)          │
│                                             │
│  Stage 1: SOURCE                            │
│  └── Pull code from GitHub (main branch)    │
│                                             │
│  Stage 2: BUILD (CodeBuild)                 │
│  ├── npm ci (install dependencies)          │
│  ├── npm test (run tests)                   │
│  ├── docker build (create Docker image)     │
│  └── docker push to ECR (store image)       │
│                                             │
│  Stage 3: DEPLOY                            │
│  └── Update ECS Service (new container)     │
└─────────────────────────────────────────────┘
         │
         v
┌─────────────────────────────────────────────┐
│              AWS ECS Fargate                │
│  ┌─────────────────────────────────┐        │
│  │  nodelearn container (port 3000)│        │
│  │  - Node.js API                  │        │
│  │  - Express.js                   │        │
│  └─────────────────────────────────┘        │
│              │                              │
└──────────────│──────────────────────────────┘
               v
         MongoDB Atlas (external DB)
```

### Services Used & Their Roles

| Service | Role | Analogy |
|---------|------|---------|
| **IAM** | Access control — who can do what | Security badges in an office |
| **VPC** | Private network for your resources | Your own office building |
| **EC2** | Virtual server (manual deploy) | Renting a physical server |
| **S3** | File/object storage | Google Drive for servers |
| **ECR** | Docker image registry | Docker Hub, but private on AWS |
| **ECS Fargate** | Run Docker containers (serverless) | Managed container hosting |
| **CodeBuild** | Build & test code | Jenkins build step |
| **CodePipeline** | Orchestrate CI/CD workflow | Jenkins pipeline |

---

## 2. AWS Account Setup & Cost Protection

### Account Details
- **Account ID**: 024893219891
- **IAM User**: amit-surwar (root account)
- **Region**: ap-south-1 (Asia Pacific - Mumbai)
- **Free Tier**: 12 months from signup

### Step 1: Create AWS Account
1. Go to https://aws.amazon.com/free/
2. Sign up with email
3. Payment info required (Rs 2 verification charge, refunded)
4. Select "Basic Support - Free" plan

### Step 2: Set Zero-Spend Budget (DO THIS FIRST)
Go to: https://us-east-1.console.aws.amazon.com/billing/home#/budgets/create

```
Budget name: zero-spend-budget
Budget amount: $1
Email: your-email@example.com
```

This sends email alerts if any charges appear.

![Budget Setup](screenshots/23-aws-budget-setup.png)

### Step 3: Set Region to Mumbai
- Top-right corner of AWS Console → Click region dropdown → Select **Asia Pacific (Mumbai) ap-south-1**

### Free Tier Limits

| Service | Free Tier Limit |
|---------|----------------|
| EC2 (t3.micro) | 750 hours/month |
| S3 | 5 GB storage |
| ECR | 500 MB storage |
| CodePipeline | 1 active pipeline |
| CodeBuild | 100 build minutes/month |
| VPC, IAM | Always free |

---

## 3. IAM — Identity & Access Management

### What is IAM?
Controls WHO can do WHAT in your AWS account.

| Concept | What it is | Example |
|---------|-----------|---------|
| **User** | A person or app identity | Your dev account |
| **Group** | Collection of users | "developers" team |
| **Role** | Temporary permissions | EC2 accessing S3 |
| **Policy** | JSON permission rules | "Allow read from S3 bucket X" |
| **Access Key** | Programmatic access credential | Used with AWS CLI |

### What We Did

#### Created IAM User
```
AWS Console → IAM → Users → Create User
- User name: nodelearn-dev
- Check "Provide user access to the AWS Management Console"
- Attach policies:
  - AmazonEC2FullAccess
  - AmazonS3FullAccess
  - AmazonVPCFullAccess
```

![IAM User Create](screenshots/24-iam-user-create.png)

#### Created Access Keys (for CLI)
```
IAM → Users → nodelearn-dev → Security Credentials → Create Access Key
- Use case: CLI
- Download the CSV file with Access Key ID and Secret Access Key
```

#### Configured AWS CLI
```bash
# Install AWS CLI (macOS)
brew install awscli

# Verify installation
aws --version

# Configure with your credentials
aws configure
# AWS Access Key ID: AKIAQLS6AMQZUDP7CRUY
# AWS Secret Access Key: (your secret key)
# Default region: ap-south-1
# Default output: json

# Verify connection
aws sts get-caller-identity
# Output: { "UserId": "024893219891", "Account": "024893219891" }
```

### IAM Best Practices for Real Projects
- NEVER use root account for daily work
- ALWAYS enable MFA on root and admin accounts
- Use groups, not individual user permissions
- Follow "least privilege" — minimum permissions needed
- Rotate access keys every 90 days
- Use IAM Roles for services (not access keys)

---

## 4. VPC — Virtual Private Cloud

### What is VPC?
Your own private network inside AWS. You control who can enter and what can communicate.

### Architecture
```
VPC (10.0.0.0/16) — Your private network
│
├── Public Subnet (10.0.1.0/24) — Has internet access
│   ├── EC2 instance (Node.js server)
│   └── ECS Fargate tasks
│
├── Private Subnet (10.0.2.0/24) — No direct internet
│   └── Database (if using RDS)
│
├── Internet Gateway — Door to the internet
│
├── Route Table — Traffic directions
│   └── 0.0.0.0/0 → Internet Gateway
│
└── Security Groups — Firewall rules
    ├── Port 22  (SSH — your IP only)
    ├── Port 80  (HTTP — anywhere)
    ├── Port 443 (HTTPS — anywhere)
    └── Port 3000 (Node.js — anywhere)
```

### What We Did

#### Created Custom VPC
```
AWS Console → VPC → Create VPC
- Name: nodelearn-vpc
- CIDR: 10.0.0.0/16
```

![VPC Create](screenshots/25-vpc-create.png)

#### Created Subnets
```
VPC → Subnets → Create Subnet
- Public Subnet:  name=public-1,  CIDR=10.0.1.0/24, AZ=ap-south-1a
- Private Subnet: name=private-1, CIDR=10.0.2.0/24, AZ=ap-south-1a
```

#### Created Internet Gateway
```
VPC → Internet Gateways → Create
- Name: nodelearn-igw
- Attach to: nodelearn-vpc
```

#### Created Route Table
```
VPC → Route Tables → Create
- Name: public-routes
- Add route: 0.0.0.0/0 → nodelearn-igw
- Associate with: public-1 subnet
```

#### Created Security Group
```
VPC → Security Groups → Create
- Name: nodelearn-sg
- VPC: nodelearn-vpc
- Inbound Rules:
  | Type       | Port | Source    | Purpose           |
  |------------|------|----------|-------------------|
  | SSH        | 22   | My IP    | Terminal access   |
  | HTTP       | 80   | 0.0.0.0/0| Web traffic      |
  | Custom TCP | 3000 | 0.0.0.0/0| Node.js app      |
```

### VPC Concepts for Real Projects

| Component | Purpose | When to Use |
|-----------|---------|-------------|
| **Public Subnet** | Resources that need internet | Load balancers, bastion hosts |
| **Private Subnet** | Internal resources | Databases, app servers |
| **NAT Gateway** | Let private subnet access internet (outgoing) | Private instances needing updates |
| **Security Group** | Instance-level firewall | Every EC2/ECS resource |
| **Network ACL** | Subnet-level firewall | Extra security layer |

---

## 5. EC2 — Deploy App on Virtual Server

### What is EC2?
A virtual server in the cloud. You choose OS, CPU, RAM, and manage everything yourself.

### What We Did

#### Step 1: Launch EC2 Instance
```
AWS Console → EC2 → Launch Instance
- Name: nodelearn-server
- AMI: Ubuntu Server 24.04 LTS
- Instance type: t3.micro (free tier — t2.micro wasn't available)
- Key pair: Create "nodelearn-key" → Download .pem file
- Network: nodelearn-vpc → public-1 subnet
- Auto-assign public IP: Enable
- Security group: nodelearn-sg (ports 22, 80, 3000)
- Storage: 8 GB gp3
```

![EC2 Launch](screenshots/26-ec2-launch.png)

#### Step 2: Connect via SSH
```bash
# Set permissions on key file
chmod 400 ~/Downloads/nodelearn-key.pem

# Connect to EC2
ssh -i ~/Downloads/nodelearn-key.pem ubuntu@YOUR_PUBLIC_IP
```

![SSH Connected](screenshots/27-ec2-ssh-connected.png)

#### Step 3: Install Node.js and Deploy
```bash
# On the EC2 instance:

# Install Node.js 20
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

# Verify
node --version    # v20.x
npm --version     # 10.x

# Clone project
git clone https://github.com/amit-surwar/nodelearn.git
cd nodelearn

# Install production dependencies
npm ci --only=production

# Create environment file
nano .env
# PORT=3000
# MONGODB_URI=mongodb+srv://your-atlas-uri
# JWT_SECRET=your-secret-key
# NODE_ENV=production

# Start the server
node src/server.js
```

![App Running on EC2](screenshots/28-ec2-app-running.png)

#### Step 4: Test from Browser/Postman
```
GET http://YOUR_EC2_PUBLIC_IP:3000/api/v1/health
→ { "success": true, "data": { "status": "OK" } }
```

#### Step 5: Stop Instance (save costs)
```
EC2 Console → Instances → Select → Instance State → Stop Instance
```

### EC2 vs ECS (When to Use Which)

| Aspect | EC2 | ECS Fargate |
|--------|-----|-------------|
| **Setup** | Manual (install Node, Nginx, PM2) | Just provide Docker image |
| **Scaling** | Manual or Auto Scaling Group | Automatic with desired count |
| **Updates** | SSH + git pull + restart | Push new image, service updates |
| **Cost** | Pay for instance 24/7 | Pay per container per second |
| **Best for** | Full control, custom setups | Microservices, Docker apps |

---

## 6. S3 — File Storage

### What is S3?
Cloud file storage. Store anything: images, backups, logs, static websites.

### What We Did

#### Created S3 Bucket
```
AWS Console → S3 → Create Bucket
- Bucket name: nodelearn-uploads (globally unique name)
- Region: ap-south-1
- Block all public access: ON (keep private)
```

![S3 Bucket](screenshots/29-s3-bucket.png)

#### S3 CLI Commands
```bash
# Upload file
aws s3 cp test.txt s3://nodelearn-uploads/test.txt

# List files
aws s3 ls s3://nodelearn-uploads/

# Download file
aws s3 cp s3://nodelearn-uploads/test.txt downloaded.txt

# Sync folder
aws s3 sync ./logs s3://nodelearn-uploads/logs/

# Delete file
aws s3 rm s3://nodelearn-uploads/test.txt

# Delete bucket
aws s3 rb s3://nodelearn-uploads --force
```

### S3 Use Cases in Real Projects

| Use Case | Example |
|----------|---------|
| **User uploads** | Profile pictures, documents |
| **Static website** | React/Angular build files |
| **Backups** | Database dumps, logs |
| **Build artifacts** | CodePipeline stores artifacts here |
| **Logs** | Application and access logs |

---

## 7. Docker — Containerization

### What is Docker?
Docker packages your app + all dependencies into a container. "Works on my machine" → "Works everywhere."

### Role in Real Company Projects
```
Developer Machine → Docker Container → Same container runs on:
├── Other developer's machine
├── CI/CD pipeline (CodeBuild)
├── Staging server (ECS)
└── Production server (ECS)
```

### Our Dockerfile (Multi-stage Build)
```dockerfile
# File: Dockerfile
FROM node:20-alpine AS base
WORKDIR /app
COPY package.json package-lock.json ./

FROM base AS production
ENV NODE_ENV=production
RUN npm ci --only=production
COPY src/ ./src/
EXPOSE 3000
USER node
CMD ["node", "src/server.js"]

FROM base AS development
ENV NODE_ENV=development
RUN npm install
COPY . .
EXPOSE 3000
CMD ["npx", "nodemon", "src/server.js"]
```

**Why multi-stage?**
- `production` stage: Only production dependencies, smaller image (~150 MB)
- `development` stage: All dependencies + nodemon for hot reload

### Our Docker Compose (Local Development)
```yaml
# File: docker-compose.yml
services:
  app:
    build:
      context: .
      target: development
    ports:
      - "3000:3000"
    environment:
      - PORT=3000
      - MONGODB_URI=mongodb://mongo:27017/users_db
      - JWT_SECRET=dev_secret_key_change_in_production
      - NODE_ENV=development
    depends_on:
      mongo:
        condition: service_healthy
    volumes:
      - ./src:/app/src
    restart: unless-stopped

  mongo:
    image: mongo:7
    ports:
      - "27017:27017"
    volumes:
      - mongo_data:/data/db
    healthcheck:
      test: ["CMD", "mongosh", "--eval", "db.adminCommand('ping')"]
      interval: 10s
      timeout: 5s
      retries: 5
      start_period: 10s

volumes:
  mongo_data:
```

### Docker Commands
```bash
# Start everything (app + MongoDB)
docker compose up -d

# View logs
docker compose logs -f app

# Stop everything
docker compose down

# Rebuild after code changes
docker compose up -d --build

# Enter container shell
docker compose exec app sh

# Build production image
docker build --target production -t nodelearn:prod .

# Run production image
docker run -p 3000:3000 --env-file .env nodelearn:prod
```

---

## 8. ECR — Push Docker Image to AWS

### What is ECR?
ECR (Elastic Container Registry) is AWS's private Docker Hub. It stores your Docker images so ECS can pull and run them.

### What We Did

```bash
# Step 1: Create ECR repository
aws ecr create-repository --repository-name nodelearn --region ap-south-1
# Output: repositoryUri: 024893219891.dkr.ecr.ap-south-1.amazonaws.com/nodelearn

# Step 2: Login to ECR
aws ecr get-login-password --region ap-south-1 | \
  docker login --username AWS --password-stdin \
  024893219891.dkr.ecr.ap-south-1.amazonaws.com

# Step 3: Build production image
docker build --target production -t nodelearn:prod .

# Step 4: Tag for ECR
docker tag nodelearn:prod \
  024893219891.dkr.ecr.ap-south-1.amazonaws.com/nodelearn:latest

# Step 5: Push to ECR
docker push 024893219891.dkr.ecr.ap-south-1.amazonaws.com/nodelearn:latest
```

![ECR Push](screenshots/19-ecr-push.png)

### ECR in Real Projects
- Every microservice has its own ECR repository
- Images are tagged with git commit hash for traceability
- Old images are cleaned up with lifecycle policies

---

## 9. ECS Fargate — Run Containers on AWS

### What is ECS?
ECS runs your Docker containers without managing servers. Fargate = serverless containers.

### ECS Concepts
```
Cluster (nodelearn-cluster)
  └── Service (nodelearn-task-service)
        └── Task (running container)
              └── Container (nodelearn — port 3000)
```

| Concept | What it is | Analogy |
|---------|-----------|---------|
| **Cluster** | Group of resources | A kitchen |
| **Task Definition** | Container recipe (image, CPU, RAM, env vars) | A recipe card |
| **Task** | Running container instance | A dish being cooked |
| **Service** | Keeps desired number of tasks running | Head chef ensuring dishes are ready |

### What We Did

#### Step 1: Create ECS Cluster
```
AWS Console → ECS → Create Cluster
- Cluster name: nodelearn-cluster
- Infrastructure: AWS Fargate (serverless)
```

![ECS Cluster](screenshots/20-ecs-cluster-create.png)

#### Step 2: Create Task Definition
```
ECS → Task Definitions → Create
- Task name: nodelearn-task
- Launch type: Fargate
- OS: Linux/X86_64
- CPU: 0.25 vCPU (smallest)
- Memory: 0.5 GB (smallest)

Container:
- Name: nodelearn
- Image: 024893219891.dkr.ecr.ap-south-1.amazonaws.com/nodelearn:latest
- Port: 3000

Environment Variables:
- PORT = 3000
- MONGODB_URI = mongodb+srv://your-atlas-connection-string
- JWT_SECRET = your-production-secret
- NODE_ENV = production
```

![Task Definition](screenshots/21-ecs-task-definition.png)

#### Step 3: Create Service
```
ECS → nodelearn-cluster → Create Service
- Launch type: Fargate
- Task definition: nodelearn-task
- Service name: nodelearn-task-service
- Desired tasks: 1

Networking:
- VPC: Default VPC (or nodelearn-vpc)
- Subnets: Public subnets
- Auto-assign public IP: ON
- Security group: Allow port 3000 from anywhere
```

#### Step 4: Test
```
ECS → Tasks → Click task → Find Public IP
GET http://PUBLIC_IP:3000/api/v1/health
→ { "success": true, "data": { "status": "OK" } }
```

![ECS Service Running](screenshots/22-ecs-service-running.png)

#### Step 5: Stop Service (save costs)
```
ECS → Services → Update Service → Desired tasks: 0 → Update
```

---

## 10. CodePipeline — Full CI/CD

### What is CodePipeline?
Automates the entire flow: code push → build → test → deploy. No manual steps needed.

### Pipeline Architecture
```
┌──────────┐    ┌──────────────┐    ┌──────────────┐
│  SOURCE  │───►│    BUILD     │───►│   DEPLOY     │
│  GitHub  │    │  CodeBuild   │    │  Amazon ECS  │
│          │    │              │    │              │
│ Pull code│    │ npm install  │    │ Update       │
│ from main│    │ npm test     │    │ service with │
│ branch   │    │ docker build │    │ new image    │
│          │    │ push to ECR  │    │              │
└──────────┘    └──────────────┘    └──────────────┘
```

### buildspec.yml (CodeBuild Instructions)
```yaml
# File: buildspec.yml — Tells CodeBuild what to do
version: 0.2

env:
  variables:
    REPOSITORY_URI: 024893219891.dkr.ecr.ap-south-1.amazonaws.com/nodelearn

phases:
  pre_build:
    commands:
      - echo Logging in to Amazon ECR...
      - aws ecr get-login-password --region ap-south-1 | docker login --username AWS --password-stdin $REPOSITORY_URI
      - COMMIT_HASH=$(echo $CODEBUILD_RESOLVED_SOURCE_VERSION | cut -c 1-7)
      - IMAGE_TAG=${COMMIT_HASH:-latest}

  build:
    commands:
      - echo Installing dependencies...
      - npm ci
      - echo Running tests...
      - npm test
      - echo Building Docker image...
      - docker build --target production -t $REPOSITORY_URI:latest .
      - docker tag $REPOSITORY_URI:latest $REPOSITORY_URI:$IMAGE_TAG

  post_build:
    commands:
      - echo Pushing Docker image to ECR...
      - docker push $REPOSITORY_URI:latest
      - docker push $REPOSITORY_URI:$IMAGE_TAG
      - printf '[{"name":"nodelearn","imageUri":"%s"}]' $REPOSITORY_URI:latest > imagedefinitions.json

artifacts:
  files:
    - imagedefinitions.json
```

### What We Did

#### Step 1: Create CodeBuild Project
```
AWS Console → CodeBuild → Create Build Project
- Project name: nodelearn-build
- Source: AWS CodePipeline
- Environment:
  - Managed image
  - OS: Amazon Linux
  - Runtime: Standard
  - Image: aws/codebuild/amazonlinux2-x86_64-standard:5.0
  - Compute: EC2
  - Privileged: ON (REQUIRED for Docker builds)
- Service role: New role (codebuild-nodelearn-build-service-role)
- Buildspec: Use a buildspec file (buildspec.yml)
```

![CodeBuild Environment](screenshots/09-codebuild-environment.png)
![Privileged Checked](screenshots/10-privileged-checked.png)
![Buildspec File](screenshots/11-buildspec-file.png)

#### Step 2: Create CodePipeline
```
AWS Console → CodePipeline → Create Pipeline

Step 1: Choose creation option
- Category: Build custom pipeline

Step 2: Pipeline settings
- Pipeline name: nodelearn-pipeline
- Execution mode: Queued
- Service role: New service role (nodelearn-pipeline-role)

Step 3: Source stage
- Source provider: GitHub (via GitHub App)
- Connection: Connect to GitHub → Authorize AWS Connector
- Repository: amit-surwar/nodelearn
- Branch: main
- Output format: CodePipeline default

Step 4: Build stage
- Build provider: Other build providers → AWS CodeBuild
- Project name: nodelearn-build

Step 5: Test stage
- Skip test stage (tests run in buildspec.yml)

Step 6: Deploy stage
- Deploy provider: Amazon ECS
- Region: Asia Pacific (Mumbai)
- Cluster: nodelearn-cluster
- Service: nodelearn-task-service-48f68z75
- Image definitions file: imagedefinitions.json
```

![Pipeline Create](screenshots/02-codepipeline-create.png)
![Pipeline Settings](screenshots/03-pipeline-settings.png)
![Source Provider](screenshots/04-source-provider-list.png)
![GitHub Connected](screenshots/07-github-connected.png)
![CodeBuild Provider](screenshots/08-codebuild-provider.png)
![Deploy ECS](screenshots/12-deploy-ecs.png)
![Deploy Config](screenshots/13-deploy-config.png)
![Pipeline Review](screenshots/14-pipeline-review.png)

#### Step 3: Fix ECR Permission Error
First run failed because CodeBuild couldn't access ECR:

![Build Failed](screenshots/15-pipeline-build-failed.png)
![Error Details](screenshots/16-build-error-ecr.png)

**Fix:** Add ECR permissions to the CodeBuild role:
```bash
aws iam attach-role-policy \
  --role-name codebuild-nodelearn-build-service-role \
  --policy-arn arn:aws:iam::aws:policy/AmazonEC2ContainerRegistryPowerUser
```

#### Step 4: Pipeline Success
After fixing permissions, all three stages passed:

![Pipeline All Green](screenshots/17-pipeline-all-green.png)
![Final Success](screenshots/18-pipeline-final-success.png)

### How to Deploy New Code (After Pipeline is Set Up)
```bash
# 1. Make code changes
# 2. Commit and push
git add .
git commit -m "feat: add new endpoint"
git push origin main

# 3. Pipeline automatically:
#    - Pulls code from GitHub
#    - Runs npm test
#    - Builds Docker image
#    - Pushes to ECR
#    - Deploys to ECS
#    (Takes 3-5 minutes)
```

---

## 11. Amplify — Deploy React Frontend

### What is Amplify?
AWS Amplify deploys frontend apps (React, Angular, Vue) to a global CDN with HTTPS — no servers needed. It's like Vercel/Netlify but on AWS.

### What We Built
- **React app** with Vite (nodelearn-frontend)
- Health check display for nodelearn API
- User creation form and user list
- Dark theme UI

### GitHub Repository
- **Repo**: `amit-surwar/nodelearn-frontend`
- **URL**: https://github.com/amit-surwar/nodelearn-frontend

### Live URL
- **https://main.d1raqg19jw79ef.amplifyapp.com**

### What We Did

#### Step 1: Create React App
```bash
cd ~/Desktop
npm create vite@latest nodelearn-frontend -- --template react
cd nodelearn-frontend
npm install
```

#### Step 2: Push to GitHub
```bash
git init
git add -A
git commit -m "Initial React frontend for nodelearn API"
git branch -m main
git remote add origin https://github.com/amit-surwar/nodelearn-frontend.git
git push -u origin main
```

#### Step 3: Deploy with Amplify
```
AWS Console → Amplify → Create new app
- Source: GitHub
- Repository: amit-surwar/nodelearn-frontend
- Branch: main
- Build command: npm run build (auto-detected)
- Output directory: dist (auto-detected)
- Click "Save and deploy"
```

Amplify automatically:
1. Pulls code from GitHub
2. Runs `npm run build`
3. Deploys the `dist/` folder to CloudFront CDN
4. Gives you a free HTTPS URL

#### How Auto-Deploy Works
Every time you push to `main`, Amplify automatically rebuilds and redeploys:
```bash
git add .
git commit -m "update UI"
git push origin main
# Amplify deploys automatically in 1-2 minutes
```

### Amplify vs Other Frontend Hosting

| Platform | Best For | Cost |
|----------|----------|------|
| **Amplify** | AWS teams, full-stack | Free tier: 1000 build min/month |
| **Vercel** | Next.js apps | Free for personal |
| **Netlify** | Static sites, JAMstack | Free for personal |
| **S3 + CloudFront** | Manual setup, full control | Pay per request |

### Key Files
```
nodelearn-frontend/
├── src/
│   ├── App.jsx           # Main React component
│   ├── App.css           # Styles (dark theme)
│   └── main.jsx          # Entry point
├── index.html            # HTML template
├── vite.config.js        # Vite configuration
└── package.json          # Dependencies
```

---

## 12. Errors & Fixes

### Error 1: t2.micro Not Available
**Problem:** "This instance type is not eligible under the Free Plan"
**Fix:** Use `t3.micro` instead — also free tier eligible, slightly better performance

### Error 2: ECS Service Linked Role Already Exists
**Problem:** `Service role name AWSServiceRoleForECS has been taken`
**Fix:** Ignore this error — the role already exists from a previous attempt. Just proceed.

### Error 3: CloudFormation Stack Conflict
**Problem:** ECS cluster creation failed due to stuck CloudFormation stack
**Fix:**
```bash
aws cloudformation delete-stack --stack-name STACK_NAME
# Then retry creating the cluster
```

### Error 4: CodeBuild ECR Login Failed
**Problem:** `Error while executing command: aws ecr get-login-password`
**Fix:** Add ECR permissions to CodeBuild role:
```bash
aws iam attach-role-policy \
  --role-name codebuild-nodelearn-build-service-role \
  --policy-arn arn:aws:iam::aws:policy/AmazonEC2ContainerRegistryPowerUser
```

### Error 5: CodeBuild Project Already Exists
**Problem:** `Project already exists: arn:aws:codebuild:...`
**Fix:** Don't create new — use the existing project from the dropdown

### Error 6: CodeBuild Role Already Exists
**Problem:** `Role with name codebuild-nodelearn-build-service-role already exists`
**Fix:** Switch to "Existing service role" and select it, or use a different role name

### Error 7: ECS Health Check 404
**Problem:** Postman returning 404 for ECS task
**Fix:** Check request method — must be GET (not POST)

---

## 13. Cleanup & Cost Management

### Stop All Resources (Zero Cost)
```bash
# 1. Stop ECS Service (set desired tasks to 0)
# ECS Console → Clusters → nodelearn-cluster → Services → Update → Desired: 0

# 2. Stop EC2 Instances
# EC2 Console → Instances → Select → Stop Instance

# 3. Verify nothing is running
aws ecs describe-services --cluster nodelearn-cluster \
  --services nodelearn-task-service-48f68z75 --region ap-south-1 \
  --query 'services[0].{desired:desiredCount,running:runningCount}'

aws ec2 describe-instances --region ap-south-1 \
  --filters "Name=instance-state-name,Values=running" \
  --query 'Reservations[*].Instances[*].[InstanceId,State.Name]'

aws ec2 describe-nat-gateways --region ap-south-1 \
  --filter "Name=state,Values=available"

aws ec2 describe-addresses --region ap-south-1
```

### Resources That Are Free When Idle

| Resource | Idle Cost |
|----------|-----------|
| ECS Cluster (no tasks) | Free |
| ECR (< 500 MB) | Free |
| CodePipeline (1 pipeline) | Free |
| CodeBuild (< 100 min/month) | Free |
| S3 (< 5 GB) | Free |
| VPC, IAM, Security Groups | Always free |
| EC2 (stopped) | Free (EBS storage ~$0.10/GB/month) |

### Delete Everything (If Closing Account)
```bash
# Delete ECS service
aws ecs delete-service --cluster nodelearn-cluster --service nodelearn-task-service-48f68z75 --force

# Delete ECS cluster
aws ecs delete-cluster --cluster nodelearn-cluster

# Delete ECR repository
aws ecr delete-repository --repository-name nodelearn --force

# Delete CodePipeline
aws codepipeline delete-pipeline --name nodelearn-pipeline

# Delete CodeBuild project
aws codebuild delete-project --name nodelearn-build

# Terminate EC2 instance
aws ec2 terminate-instances --instance-ids YOUR_INSTANCE_ID

# Delete S3 bucket
aws s3 rb s3://YOUR_BUCKET --force

# Delete VPC (must delete subnets, IGW, route tables first)
```

---

## 14. Commands Cheat Sheet

### AWS CLI
```bash
# Identity
aws sts get-caller-identity

# EC2
aws ec2 describe-instances --region ap-south-1
aws ec2 start-instances --instance-ids i-xxx
aws ec2 stop-instances --instance-ids i-xxx

# ECR
aws ecr get-login-password --region ap-south-1 | docker login --username AWS --password-stdin ACCOUNT_ID.dkr.ecr.ap-south-1.amazonaws.com
aws ecr describe-repositories
aws ecr list-images --repository-name nodelearn

# ECS
aws ecs list-clusters
aws ecs list-services --cluster nodelearn-cluster
aws ecs describe-services --cluster nodelearn-cluster --services SERVICE_NAME
aws ecs update-service --cluster nodelearn-cluster --service SERVICE_NAME --desired-count 1
aws ecs update-service --cluster nodelearn-cluster --service SERVICE_NAME --force-new-deployment

# S3
aws s3 ls
aws s3 cp file s3://bucket/
aws s3 sync dir s3://bucket/dir

# IAM
aws iam list-users
aws iam attach-role-policy --role-name ROLE --policy-arn POLICY_ARN
```

### Docker
```bash
# Build
docker build --target production -t nodelearn:prod .
docker build --target development -t nodelearn:dev .

# Run
docker run -p 3000:3000 --env-file .env nodelearn:prod

# Docker Compose
docker compose up -d          # Start in background
docker compose down            # Stop all
docker compose logs -f app     # View logs
docker compose exec app sh     # Shell into container
docker compose up -d --build   # Rebuild and start

# Tag and push to ECR
docker tag nodelearn:prod ACCOUNT_ID.dkr.ecr.ap-south-1.amazonaws.com/nodelearn:latest
docker push ACCOUNT_ID.dkr.ecr.ap-south-1.amazonaws.com/nodelearn:latest
```

### SSH
```bash
chmod 400 ~/Downloads/nodelearn-key.pem
ssh -i ~/Downloads/nodelearn-key.pem ubuntu@PUBLIC_IP
```

---

## 15. Real Company Project Workflow

### How This Maps to a Real Company

```
1. Developer writes code locally
   └── Uses Docker Compose for local dev (app + DB)

2. Developer pushes to GitHub (feature branch)
   └── Creates Pull Request

3. CI/CD Pipeline runs automatically
   ├── Runs tests (npm test)
   ├── Builds Docker image
   ├── Pushes to ECR
   └── Deploys to staging ECS cluster

4. QA tests on staging environment

5. PR is merged to main branch

6. Production pipeline runs
   ├── Builds production Docker image
   ├── Pushes to ECR
   └── Deploys to production ECS cluster (rolling update)
```

### Real Company Architecture (Expanded)
```
Internet
  │
  v
CloudFront (CDN) → S3 (React/Angular frontend)
  │
  v
Application Load Balancer (ALB)
  │
  ├── ECS Service: User API    (3 tasks)
  ├── ECS Service: Order API   (5 tasks)
  ├── ECS Service: Payment API (2 tasks)
  │
  v
RDS (PostgreSQL) / DynamoDB / MongoDB Atlas
  │
  v
S3 (file uploads, backups)
ElastiCache (Redis — caching)
SQS (message queues)
```

### What You'd Add for Production

| What | Why | Service |
|------|-----|---------|
| **Load Balancer** | Distribute traffic across containers | ALB |
| **Auto Scaling** | Handle traffic spikes | ECS Auto Scaling |
| **Custom Domain** | yourapp.com instead of IP | Route 53 + ACM |
| **HTTPS** | Secure connections | ACM (free SSL) |
| **Monitoring** | Know when things break | CloudWatch Alarms |
| **Logging** | Debug issues | CloudWatch Logs |
| **Secrets** | Store API keys safely | AWS Secrets Manager |
| **Database** | Managed database | RDS / DynamoDB |
| **CDN** | Fast frontend delivery | CloudFront |
| **WAF** | Block attacks | AWS WAF |

---

## Files in This Project

```
nodelearn/
├── src/                          # Application source code
│   ├── server.js                 # Entry point
│   ├── controllers/              # HTTP handlers
│   ├── services/                 # Business logic
│   ├── repositories/             # Database queries
│   ├── models/                   # Mongoose schemas
│   └── routes/                   # API routes
├── Dockerfile                    # Multi-stage Docker build
├── docker-compose.yml            # Local dev with MongoDB
├── buildspec.yml                 # CodeBuild instructions
├── package.json
├── .dockerignore
├── .gitignore
└── devops-exercises/
    ├── LEARNING_PATH.md          # Learning order
    ├── aws-core/README.md        # IAM, VPC, EC2, S3 guide
    ├── aws-ecs/README.md         # ECR + ECS Fargate guide
    ├── aws-codepipeline/README.md# CI/CD pipeline guide
    ├── aws-amplify/README.md     # Frontend deployment guide
    ├── screenshots/              # All screenshots from setup
    └── AWS_DEVOPS_COMPLETE_REFERENCE.md  # THIS FILE
```
