# Docker Deep Dive — Hands-On Exercises

Learn Docker by containerizing and running the nodelearn API.

## Prerequisites
- Install Docker Desktop: https://www.docker.com/products/docker-desktop/
- Make sure Docker is running (whale icon in menu bar)

## Verify Docker is installed
```bash
docker --version
docker compose version
```

---

## Exercise 1: Understand the Dockerfile

Open `/Dockerfile` and understand each line:

```dockerfile
FROM node:20-alpine AS base     # Use Node.js 20 on lightweight Alpine Linux
WORKDIR /app                     # Set working directory inside container
COPY package.json package-lock.json ./  # Copy dependency files first (for caching)

FROM base AS production          # Production stage
ENV NODE_ENV=production
RUN npm ci --only=production     # Install only production deps
COPY src/ ./src/                 # Copy source code
EXPOSE 3000                      # Document which port the app uses
USER node                        # Run as non-root user (security)
CMD ["node", "src/server.js"]    # Start the app

FROM base AS development         # Development stage
ENV NODE_ENV=development
RUN npm install                  # Install all deps including devDependencies
COPY . .                         # Copy everything
EXPOSE 3000
CMD ["npx", "nodemon", "src/server.js"]  # Start with hot-reload
```

### Key Concepts:
- **Multi-stage build**: One Dockerfile, two outputs (dev vs prod)
- **Layer caching**: Copy package.json BEFORE source code so npm install is cached
- **USER node**: Never run containers as root in production

---

## Exercise 2: Build a Docker Image

```bash
# Build the production image
docker build --target production -t nodelearn:prod .

# Build the development image
docker build --target development -t nodelearn:dev .

# List your images
docker images | grep nodelearn
```

### Questions to answer:
1. Which image is smaller — prod or dev? Why?
2. What does `--target` do?
3. What does `-t nodelearn:prod` mean?

---

## Exercise 3: Run a Single Container

```bash
# Run the production image (will fail — no MongoDB!)
docker run -p 3000:3000 nodelearn:prod

# See the error? The app can't connect to MongoDB
# because MongoDB is not inside this container
# That's why we need docker-compose!
```

### Key Concepts:
- `-p 3000:3000` maps host port to container port
- Each container is isolated — it can't see your local MongoDB
- Containers need to be connected via a network

---

## Exercise 4: Run with Docker Compose

```bash
# Start both app + MongoDB together
docker compose up

# Watch the logs — you'll see:
# mongo  | Waiting for connections
# app    | MongoDB Connected: mongo
# app    | Server running on port 3000

# Test in Postman: GET http://localhost:3000/api/v1/health
```

### What docker-compose does:
1. Creates a private network for your services
2. Starts MongoDB container
3. Waits for MongoDB to be healthy (healthcheck)
4. Starts your app container
5. Connects app to MongoDB via the network

---

## Exercise 5: Docker Compose Commands

```bash
# Start in background (detached mode)
docker compose up -d

# See running containers
docker compose ps

# See logs
docker compose logs app
docker compose logs mongo

# Follow logs in real-time
docker compose logs -f app

# Stop everything
docker compose down

# Stop and DELETE all data (volumes)
docker compose down -v
```

---

## Exercise 6: Enter a Running Container

```bash
# Start containers
docker compose up -d

# Enter the app container (like SSH into a server)
docker compose exec app sh

# Now you're INSIDE the container:
ls                    # See your files
node --version        # Check Node version
cat package.json      # View package.json
env                   # See environment variables
exit                  # Leave the container

# Enter the MongoDB container
docker compose exec mongo mongosh
# Run: show dbs
# Run: use users_db
# Run: db.users.find()
# Run: exit
```

---

## Exercise 7: Push Image to Docker Hub

```bash
# Login to Docker Hub (create account at hub.docker.com first)
docker login

# Tag your image for Docker Hub
docker tag nodelearn:prod YOUR_DOCKERHUB_USERNAME/nodelearn:latest

# Push to Docker Hub
docker push YOUR_DOCKERHUB_USERNAME/nodelearn:latest

# Now anyone can pull and run your image:
# docker pull YOUR_DOCKERHUB_USERNAME/nodelearn:latest
```

---

## Exercise 8: Docker Volumes (Data Persistence)

```bash
# Start containers
docker compose up -d

# Create a user via Postman (POST /api/v1/users)

# Stop containers (data is preserved in volume)
docker compose down

# Start again — your user data is still there!
docker compose up -d
# GET /api/v1/users — user still exists!

# Now stop AND remove volumes
docker compose down -v

# Start again — data is gone!
docker compose up -d
# GET /api/v1/users — empty! Volume was deleted.
```

### Key Concept:
- Volumes persist data between container restarts
- `docker compose down` keeps volumes
- `docker compose down -v` deletes volumes (fresh start)

---

## Cheat Sheet

| Command | What it does |
|---------|-------------|
| `docker build -t name .` | Build image from Dockerfile |
| `docker run -p 3000:3000 name` | Run a container |
| `docker ps` | List running containers |
| `docker images` | List images |
| `docker compose up` | Start all services |
| `docker compose up -d` | Start in background |
| `docker compose down` | Stop all services |
| `docker compose down -v` | Stop + delete data |
| `docker compose logs -f` | Follow logs |
| `docker compose exec app sh` | Enter container shell |
| `docker system prune` | Clean up unused resources |
