# AWS Amplify — Deploy Angular/React Frontend

Deploy frontend apps (Angular, React) using AWS Amplify.

## What is Amplify?
AWS Amplify is like Railway/Vercel but for frontend apps. It:
- Connects to your GitHub repo
- Auto-builds on every push
- Hosts your site on a CDN (fast globally)
- Gives you HTTPS automatically
- Supports custom domains

## Amplify vs Other Options

| Service | Best for | Deploys |
|---------|----------|---------|
| **Amplify** | Frontend apps (React, Angular, Vue) | Static sites + SSR |
| **S3 + CloudFront** | Simple static sites | HTML/CSS/JS only |
| **EC2** | Backend APIs | Node.js, Python, etc. |
| **ECS** | Dockerized apps | Any Docker container |

## Your Architecture

```
Frontend (Angular/React)     Backend (Node.js)
  │                            │
  v                            v
AWS Amplify                  AWS ECS / Railway
  │                            │
  └── Calls API ──────────────┘
                               │
                               v
                          MongoDB Atlas
```

---

## Exercise 1: Deploy a React App to Amplify

### Step 1: Create a React App

```bash
# Create a new React app
npx create-react-app nodelearn-frontend
cd nodelearn-frontend

# Initialize git and push to GitHub
git init
git add -A
git commit -m "Initial React app"
# Create repo on GitHub and push
```

### Step 2: Connect to Amplify

```
AWS Console > Amplify > Create New App
1. Select "GitHub" as source
2. Authorize AWS to access your GitHub
3. Select the "nodelearn-frontend" repo
4. Branch: main
5. Amplify auto-detects React build settings:
   - Build command: npm run build
   - Output directory: build
6. Click "Save and Deploy"
```

### Step 3: Wait for Build

Amplify will:
1. Pull code from GitHub
2. Run `npm install`
3. Run `npm run build`
4. Deploy to CDN

You get a URL like: `https://main.d1234abcd.amplifyapp.com`

### Step 4: Auto-Deploy

Every time you `git push` to main, Amplify automatically rebuilds and deploys.

---

## Exercise 2: Deploy an Angular App to Amplify

### Step 1: Create an Angular App

```bash
# Create Angular app
npx @angular/cli new nodelearn-angular
cd nodelearn-angular

# Push to GitHub
```

### Step 2: Connect to Amplify

Same as React, but update build settings:

```
AWS Console > Amplify > App Settings > Build Settings

version: 1
frontend:
  phases:
    preBuild:
      commands:
        - npm ci
    build:
      commands:
        - npm run build
  artifacts:
    baseDirectory: dist/nodelearn-angular/browser
    files:
      - '**/*'
  cache:
    paths:
      - node_modules/**/*
```

---

## Exercise 3: Connect Frontend to Your Backend API

### In your React/Angular app:

```javascript
// services/api.js
const API_BASE = process.env.REACT_APP_API_URL || 'https://nodelearn-production-6f2e.up.railway.app';

const getUsers = async () => {
  const response = await fetch(`${API_BASE}/api/v1/users`);
  const data = await response.json();
  return data;
};

const createUser = async (userData) => {
  const response = await fetch(`${API_BASE}/api/v1/users`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(userData),
  });
  const data = await response.json();
  return data;
};
```

### Set Environment Variables in Amplify

```
AWS Console > Amplify > Your App > Environment Variables
- REACT_APP_API_URL = https://nodelearn-production-6f2e.up.railway.app
```

---

## Exercise 4: Custom Domain

```
AWS Console > Amplify > Your App > Domain Management
1. Click "Add Domain"
2. Enter your domain (e.g., app.yourdomain.com)
3. Follow DNS instructions to verify
4. Amplify handles SSL automatically
```

---

## Exercise 5: Preview Environments (Pull Request Previews)

```
AWS Console > Amplify > Your App > Previews
1. Enable "Pull request previews"
2. Now when someone opens a PR on GitHub,
   Amplify creates a temporary URL for that PR
3. Reviewers can test changes before merging
```

---

## Amplify CLI (Advanced)

```bash
# Install Amplify CLI
npm install -g @aws-amplify/cli

# Initialize Amplify in your project
amplify init

# Add authentication (Cognito)
amplify add auth

# Add API (REST or GraphQL)
amplify add api

# Add storage (S3)
amplify add storage

# Deploy everything
amplify push
```

---

## Amplify Concepts

| Concept | What it is |
|---------|-----------|
| **Hosting** | Deploys your frontend to CDN |
| **Build** | Compiles your code (npm run build) |
| **Environment** | dev, staging, production branches |
| **Previews** | Temporary URLs for pull requests |
| **Custom Domain** | Your own domain with auto SSL |
| **Backend** | Optional: Auth, API, Storage |

---

## Cost

| Feature | Free Tier |
|---------|-----------|
| Build minutes | 1000 min/month |
| Hosting | 5 GB storage, 15 GB transfer |
| SSL | Free |
| Custom domain | Free |

Very generous free tier — enough for learning and small projects.
