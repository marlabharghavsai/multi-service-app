# Multi-Service Web Application with Docker Compose

## Project Overview
- This project demonstrates the design and orchestration of a production-like multi-service web application using Docker Compose.
- The application stack consists of a frontend, a backend API, a PostgreSQL database, a Redis cache, and a RabbitMQ message queue.
- The primary goal of this project is to showcase service orchestration, container networking, health-based startup sequencing, secure configuration management, data persistence, and development/production separation, which are fundamental skills in modern cloud-native development.

## Architecture Overview
- Services Included
```
Service	              Description
Frontend       	 Web client exposed to the host
Backend API	     Application server that communicates with internal services
PostgreSQL	     Relational database with persistent storage
Redis	           In-memory cache
RabbitMQ	       Message queue
```

## Architecture Diagram
```
                  ┌──────────────┐
                  │   Web Browser │
                  └───────┬──────┘
                          │
                    (Port 3000)
                          │
                  ┌───────▼──────┐
                  │   Frontend   │
                  └───────┬──────┘
                          │
        ┌─────────────────┼─────────────────┐
        │                 │                 │
┌───────▼───────┐  ┌──────▼──────┐  ┌────────▼────────┐
│   Backend API │  │    Redis    │  │    RabbitMQ     │
└───────┬───────┘  └─────────────┘  └─────────────────┘
        │
┌───────▼────────┐
│  PostgreSQL DB │
└────────────────┘

(Custom Docker Bridge Network)
```

## Project Structure
```
multi-service-app/
├── frontend/
│   ├── Dockerfile
│   ├── .dockerignore
│   └── index.html
│
├── backend/
│   ├── Dockerfile
│   ├── .dockerignore
│   ├── server.js
│   └── package.json
│
├── docker-compose.yml
├── docker-compose.override.yml
├── .env.example
└── README.md
```

## Technology Stack
- Frontend: Nginx (Alpine)
- Backend: Node.js (Alpine)
- Database: PostgreSQL (official image)
- Cache: Redis (official image)
- Message Queue: RabbitMQ (official image)
- Orchestration: Docker Compose

## Configuration Management
- All configuration values are managed using environment variables.
  - A single .env file is used to configure all services.
  - No secrets are hardcoded in docker-compose.yml.
  - An .env.example file is provided for reference.
  - The real .env file is excluded from version control via .gitignore.
- .env.example
```
POSTGRES_DB=appdb
POSTGRES_USER=appuser
POSTGRES_PASSWORD=apppassword

DATABASE_URL=postgresql://appuser:apppassword@postgres:5432/appdb
REDIS_HOST=redis
RABBITMQ_HOST=rabbitmq
```
- This approach prevents secret leakage and follows industry-standard security practices. 

## Docker Compose Design
- Key Design Decisions
  - Custom bridge network is used to allow services to communicate via service names.
  - Only the frontend service exposes a port to the host.
  - Backend, database, cache, and message queue remain internal.
  - Named volume is used for PostgreSQL data persistence.
  - Healthchecks are used to ensure correct startup ordering.

## Healthchecks & Dependency Management
- Why Healthchecks Are Used
- Docker’s depends_on only waits for containers to start, not for services to be ready.
- To ensure a resilient startup process:
  - PostgreSQL defines a healthcheck using pg_isready
  - Backend defines a healthcheck using its /health endpoint
  - depends_on uses condition: service_healthy
- This guarantees that:
  - The backend starts only after PostgreSQL is fully ready
  - The frontend starts only after the backend is healthy

## Backend Dockerfile (Multi-Stage Build)
- The backend uses a multi-stage Docker build to optimize image size and security.
### Why Multi-Stage Builds?
- Separates dependency installation from runtime execution
- Reduces final image size
- Minimizes attack surface
- Follows Docker best practices

### Backend Dockerfile (Simplified Explanation)
- Builder stage
  - Installs dependencies
  - Prepares the application
- Runtime stage
  - Copies only the required artifacts
  - Runs the application in a clean environment
- This design satisfies production-grade containerization standards.

## Development vs Production Configuration
### Development Mode (docker-compose.override.yml)
- The override file enables a developer-friendly environment:
  - Bind mounts local source code into containers
  - Enables live reload without rebuilding images
  - Uses a named volume to preserve node_modules
```
services:
  backend:
    volumes:
      - ./backend:/app
      - backend_node_modules:/app/node_modules

  frontend:
    volumes:
      - ./frontend:/usr/share/nginx/html
```
### Production Mode
- When the override file is not used:
  - Containers run using optimized images
  - No bind mounts
  - Fully production-ready behavior
- This clean separation follows Docker Compose best practices.

## Data Persistence
- PostgreSQL uses a named Docker volume:
```
multi-service-app_postgres-data
```
- This ensures:
  - Data survives container restarts
  - Data remains intact after docker compose down and up

## How to Run the Application
### Clone the Repository
```
git clone https://github.com/marlabharghavsai/multi-service-app
cd multi-service-app
```
### Create Environment File
```
cp .env.example .env
```
### Start the Stack
```
docker compose up --build
```

## Verification Commands
### Check running services
```
docker ps
```
- All services should be Up, with backend and PostgreSQL marked healthy.

### Test frontend
```
curl http://localhost:3000
```
### Test backend internally
```
docker exec -it multi-service-app-frontend-1 curl http://backend:5000/health
```
- Expected response:
```
OK
```

## Accessing the Application
```
Component	         Access
Frontend	      http://localhost:3000
Backend API	    Internal only
PostgreSQL	    Internal only
Redis	          Internal only
RabbitMQ	      Internal only
```
