# AWS CodePipeline — CI/CD on AWS

Automate build, test, and deploy using AWS-native CI/CD tools.

## What is CodePipeline?
AWS CodePipeline is AWS's version of Jenkins/GitHub Actions. It:
- Watches your GitHub repo for changes
- Builds your code (CodeBuild)
- Deploys to ECS, EC2, Lambda, or S3

## AWS CI/CD Tools

| Tool | What it does | Similar to |
|------|-------------|------------|
| **CodePipeline** | Orchestrates the workflow | Jenkins Pipeline |
| **CodeBuild** | Builds and tests code | Jenkins Build Step |
| **CodeDeploy** | Deploys to EC2/ECS | Jenkins Deploy Step |
| **ECR** | Stores Docker images | Docker Hub |

## Pipeline Architecture

```
GitHub Push
  │
  v
CodePipeline (orchestrator)
  │
  ├── Stage 1: Source
  │   └── Pull code from GitHub
  │
  ├── Stage 2: Build (CodeBuild)
  │   ├── npm install
  │   ├── npm test
  │   └── docker build & push to ECR
  │
  └── Stage 3: Deploy (CodeDeploy / ECS)
      └── Update ECS service with new image
```

---

## Prerequisites
- AWS ECS exercise completed (or at least EC2)
- Docker image in ECR
- nodelearn repo on GitHub

---

## Step 1: Create buildspec.yml

This file tells CodeBuild what to do. Create it in your project root:

```yaml
# buildspec.yml — AWS CodeBuild instructions
version: 0.2

env:
  variables:
    REPOSITORY_URI: YOUR_ACCOUNT_ID.dkr.ecr.ap-south-1.amazonaws.com/nodelearn

phases:
  pre_build:
    commands:
      - echo Logging in to ECR...
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
      - echo Pushing Docker image...
      - docker push $REPOSITORY_URI:latest
      - docker push $REPOSITORY_URI:$IMAGE_TAG
      - echo Writing image definition file...
      - printf '[{"name":"nodelearn","imageUri":"%s"}]' $REPOSITORY_URI:latest > imagedefinitions.json

artifacts:
  files:
    - imagedefinitions.json
```

---

## Step 2: Create CodeBuild Project

```
AWS Console > CodeBuild > Create Build Project
- Project name: nodelearn-build
- Source: GitHub (connect your account, select nodelearn repo)
- Environment:
  - Managed image
  - OS: Ubuntu
  - Runtime: Standard
  - Image: aws/codebuild/standard:7.0
  - Privileged: ON (required for Docker)
- Service role: Create new role
- Buildspec: Use buildspec.yml in source code
```

### Test the Build

```
CodeBuild > Your Project > Start Build
```

Watch the logs — you should see:
1. npm install
2. npm test (5 tests pass)
3. Docker build
4. Docker push to ECR

---

## Step 3: Create CodePipeline

```
AWS Console > CodePipeline > Create Pipeline
- Pipeline name: nodelearn-pipeline

Stage 1 - Source:
- Provider: GitHub (Version 2)
- Repository: amit-surwar/nodelearn
- Branch: main
- Trigger: On push

Stage 2 - Build:
- Provider: AWS CodeBuild
- Project: nodelearn-build

Stage 3 - Deploy:
- Provider: Amazon ECS
- Cluster: nodelearn-cluster
- Service: nodelearn-service
- Image definitions file: imagedefinitions.json
```

---

## Step 4: Test the Pipeline

1. Make a small change in your code
2. `git add . && git commit -m "test pipeline" && git push`
3. Go to CodePipeline — watch it:
   - Pull code from GitHub
   - Build and test
   - Build Docker image
   - Push to ECR
   - Deploy to ECS

The entire process takes 3-5 minutes.

---

## Step 5: Add Approval Stage (Optional)

For production deployments, add a manual approval step:

```
CodePipeline > Edit > Add Stage after Build
- Stage name: Approval
- Action: Manual Approval
- SNS Topic: Create one that emails you

Now the pipeline pauses after build and waits for you to approve before deploying.
```

---

## Pipeline for EC2 (Alternative to ECS)

If deploying to EC2 instead of ECS:

### Create appspec.yml

```yaml
# appspec.yml — CodeDeploy instructions for EC2
version: 0.0
os: linux
files:
  - source: /
    destination: /var/www/nodelearn
hooks:
  AfterInstall:
    - location: deploy/after-install.sh
      timeout: 300
  ApplicationStart:
    - location: deploy/start.sh
      timeout: 300
```

### Create deploy scripts

```bash
# deploy/after-install.sh
cd /var/www/nodelearn
npm ci --only=production

# deploy/start.sh
cd /var/www/nodelearn
pm2 restart nodelearn || pm2 start ecosystem.config.js --env production
```

---

## CodePipeline vs GitHub Actions vs Jenkins

| Feature | CodePipeline | GitHub Actions | Jenkins |
|---------|-------------|---------------|---------|
| **Where it runs** | AWS | GitHub | Self-hosted |
| **Cost** | $1/pipeline/month | Free for public repos | Free (server cost) |
| **AWS integration** | Native | Via actions | Via plugins |
| **Docker support** | Via CodeBuild | Built-in | Via plugins |
| **Setup effort** | Medium | Easy | Hard |
| **Best for** | AWS-heavy teams | GitHub-first teams | Enterprise |

---

## Concepts Summary

| Concept | What it is |
|---------|-----------|
| **Pipeline** | The full workflow (source → build → deploy) |
| **Stage** | A phase in the pipeline (Build, Test, Deploy) |
| **Action** | A single step within a stage |
| **Artifact** | Output from one stage, input to the next |
| **buildspec.yml** | Build instructions for CodeBuild |
| **appspec.yml** | Deploy instructions for CodeDeploy |
| **imagedefinitions.json** | Tells ECS which Docker image to use |

---

## Cost

| Service | Cost |
|---------|------|
| CodePipeline | $1/month per active pipeline |
| CodeBuild | 100 build min/month free, then $0.005/min |
| CodeDeploy | Free for EC2/ECS |
| ECR | $0.10/GB stored |
