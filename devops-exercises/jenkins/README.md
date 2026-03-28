# Jenkins + GitLab CI — Advanced CI/CD

Set up self-hosted CI/CD pipelines like your company uses.

## Jenkins vs GitHub Actions vs GitLab CI

| Tool | Where it runs | Used by |
|------|--------------|---------|
| **GitHub Actions** | GitHub cloud (free) | Open source, startups |
| **Jenkins** | Your own server (self-hosted) | Large companies, enterprises |
| **GitLab CI** | GitLab cloud or self-hosted | Companies using GitLab |
| **Bitbucket Pipelines** | Bitbucket cloud | Companies using Bitbucket |

## Why Companies Use Jenkins
- Full control over the build environment
- Thousands of plugins
- Complex pipelines with multiple stages
- Can run on internal network (security)

## What You'll Build

A Jenkins pipeline that:
1. Pulls code from GitHub on every push
2. Runs tests
3. Builds Docker image
4. Pushes image to Docker Hub
5. Deploys to EC2 server

## Exercise Files (we'll create these step by step)

```
jenkins/
  Jenkinsfile                # Pipeline definition
  docker-compose.jenkins.yml # Run Jenkins locally in Docker
  .gitlab-ci.yml             # GitLab CI equivalent
  bitbucket-pipelines.yml    # Bitbucket equivalent
```

## Coming Soon
This exercise will be built when you're ready for Phase 8.
