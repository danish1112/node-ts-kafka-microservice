# node-ts-kafka-microservice

The project is an event-driven microservices architecture designed for scalability, modularity, and fault tolerance. It consists of four core services (API Gateway, User Service, Blog Service, Notification Service) that communicate via RESTful APIs for synchronous client interactions and Apache Kafka for asynchronous event-driven communication. Each service is containerized using Docker and orchestrated with Docker Compose, ensuring consistent deployment and isolation. The system uses PostgreSQL for persistent storage, Redis for caching, and JWT for authentication, all running within a shared Docker network (app-network).

The architecture supports a blogging platform where users can register, create blogs, and receive notifications (e.g., welcome messages, blog creation alerts). The design emphasizes loose coupling, enabling independent scaling and maintenance of services while leveraging Kafka for reliable event propagation.

Components
Client
Description: Represents end-users interacting with the system via a browser or API testing tools like Postman.
Role: Sends HTTP requests to the API Gateway to perform actions (e.g., register, login, create blogs, view notifications).
Interaction: Communicates exclusively with the API Gateway over HTTP/REST.
API Gateway
Description: A Node.js/Express service acting as the single entry point for all client requests.
Port: 8080
Role: Routes incoming requests to appropriate services (e.g., /api/v1/auth/* to User Service, /api/v1/blogs/* to Blog Service, /api/v1/notification/* to Notification Service). Provides basic request validation and logging.
Features:
Proxy routing using HTTP libraries (e.g., http-proxy-middleware).
Centralized error handling.
Potential for future enhancements (e.g., rate limiting, authentication offloading).
Interaction: Forwards requests to User Service (port 3001), Blog Service (port 3002), or Notification Service (port 3003) based on URL paths.
User Service
Description: A Node.js/Express microservice responsible for user management and authentication.
Port: 3001
Role: Handles user registration, login, and profile retrieval.
Features:
Authentication: Uses JWT for token-based authentication and Bcryptjs for password hashing.
Validation: Employs Zod for request payload validation (e.g., email, password).
Event Publishing: Publishes user-registered events to Kafka’s user-events topic upon successful registration.
Data Storage:
PostgreSQL: Stores user data (e.g., ID, username, email, hashed password) in user_db (port 5433).
Redis: Caches user profiles for faster retrieval.
Endpoints:
POST /api/v1/users/register: Creates a new user.
POST /api/v1/users/login: Authenticates and returns a JWT.
GET /api/v1/users/profile: Retrieves user profile (JWT-protected).
Interaction: Receives proxied requests from API Gateway, interacts with PostgreSQL/Redis, and publishes events to Kafka.
Blog Service
Description: A Node.js/Express microservice for managing blog posts.
Port: 3002
Role: Handles CRUD operations for blogs (create, read, update, delete).
Features:
Authorization: Verifies JWT tokens to ensure only authenticated users can create/update/delete blogs.
Validation: Uses Zod to validate blog data (e.g., title, content).
Event Publishing: Publishes blog-published and blog-updated events to Kafka’s blog-events topic.
Data Storage:
PostgreSQL: Stores blog data (e.g., ID, title, content, authorId) in blog_db (port 5434).
Redis: Caches blog posts for quick access.
Endpoints:
POST /api/v1/blogs: Creates a new blog (JWT-protected).
GET /api/v1/blogs/:id: Retrieves a blog by ID.
PUT /api/v1/blogs/:id: Updates a blog (JWT-protected).
DELETE /api/v1/blogs/:id: Deletes a blog (JWT-protected).
Interaction: Receives proxied requests from API Gateway, interacts with PostgreSQL/Redis, and publishes events to Kafka.
Notification Service
Description: A Node.js/Express microservice for managing user notifications (e.g., email, in-app).
Port: 3003
Role: Creates and retrieves notifications triggered by events or direct API calls.
Features:
Event Consumption: Subscribes to Kafka’s user-events and blog-events topics to generate notifications (e.g., “Welcome, [username]!” for user registration, “Your blog [title] has been created” for blog creation).
Authorization: JWT-protected endpoints for retrieving user-specific notifications.
Validation: Zod for validating notification payloads.
Data Storage:
PostgreSQL: Stores notifications (e.g., ID, userId, message, type, createdAt) in notification_db (port 5435).
Redis: Caches notifications for fast retrieval.
Endpoints:
POST /api/v1/notifications: Creates a notification manually (JWT-protected).
GET /api/v1/notifications/user: Retrieves notifications for the authenticated user (JWT-protected).
Interaction: Consumes Kafka events, interacts with PostgreSQL/Redis, and receives proxied requests from API Gateway.
PostgreSQL
Description: Three separate PostgreSQL instances for data isolation.
Instances:
user_db (port 5433): Stores user data for User Service.
blog_db (port 5434): Stores blog data for Blog Service.
notification_db (port 5435): Stores notification data for Notification Service.
Role: Provides persistent, relational storage with ACID compliance.
Schema:
Users: id (UUID), username, email, password (hashed), createdAt.
Blogs: id (UUID), title, content, authorId (UUID), createdAt, updatedAt.
Notifications: id (UUID), userId (UUID), message, type (email/in-app), createdAt.
Interaction: Each service connects to its respective database via TypeScript database clients (e.g., pg library).
Redis
Description: A single Redis instance for in-memory caching.
Port: 6379
Role: Caches frequently accessed data (e.g., user profiles, blog posts, notifications) to reduce database load.
Usage:
User Service: Caches user profiles by ID.
Blog Service: Caches blog posts by ID.
Notification Service: Caches user notifications by userId.
Interaction: All services connect to Redis via a TypeScript client (e.g., ioredis).
Kafka
Description: Apache Kafka message broker for asynchronous, event-driven communication.
Port: 9092
Topics:
user-events: For events like user-registered.
blog-events: For events like blog-published, blog-updated.
Role: Decouples services by enabling asynchronous event propagation.
Features:
Producers: User Service (publishes user-registered), Blog Service (publishes blog-published, blog-updated).
Consumer: Notification Service (subscribes to user-events, blog-events).
Library: Kafkajs for Node.js integration.
Interaction: Services connect to Kafka via kafka:9092 within the Docker network.
Zookeeper
Description: Manages Kafka cluster coordination.
Port: 2181
Role: Handles broker metadata, leader election, and topic configuration for Kafka.
Interaction: Kafka depends on Zookeeper for operation.
Docker Network (app-network)
Description: A bridge network defined in docker-compose.yml to enable communication between containers.
Role: Ensures all services, databases, Redis, Kafka, and Zookeeper can resolve each other’s hostnames (e.g., kafka, redis, postgres-user).
Interaction: All components run within this network for seamless connectivity.
Interactions
REST Communication:
Clients send HTTP requests to the API Gateway (http://localhost:3000).
The API Gateway proxies requests to services based on URL paths:
/api/v1/auth/* → User Service (http://user-service:3001).
/api/v1/blogs/* → Blog Service (http://blog-service:3002).
/api/v1/notification/* → Notification Service (http://notification-service:3003).
Authenticated endpoints require a JWT token in the Authorization: Bearer <token> header, validated by each service using a shared JWT_SECRET.
Event-Driven Communication:
User Service: On user registration, publishes a user-registered event to Kafka’s user-events topic (e.g., { type: "user-registered", userId: "uuid", username: "testuser" }).
Blog Service: On blog creation or update, publishes blog-published or blog-updated events to blog-events (e.g., { type: "blog-published", blogId: "uuid", title: "My Blog", authorId: "uuid" }).
Notification Service: Consumes events from user-events and blog-events, creating notifications in notification_db (e.g., “Welcome, testuser!” or “Your blog My Blog has been created”).
Data Storage:
Each service interacts with its PostgreSQL database for persistent storage.
Redis is used for caching to improve performance (e.g., cached user profiles reduce user_db queries).
Docker Networking:
All components communicate via the app-network, using service names as hostnames (e.g., kafka:9092, redis:6379).
Health checks in docker-compose.yml ensure services start only when dependencies (e.g., PostgreSQL, Kafka) are ready.
Example Flow: User Registration and Notification
Client Request:
Client sends POST http://localhost:3000/api/v1/auth/register with { "username": "testuser", "email": "test@example.com", "password": "password123" }.
API Gateway:
Proxies request to User Service (http://user-service:3001/api/v1/users/register).
User Service:
Validates payload with Zod.
Hashes password with Bcryptjs.
Stores user in user_db (PostgreSQL:5433).
Caches user profile in Redis.
Publishes user-registered event to Kafka’s user-events topic.
Returns 201 Created with user details (excluding password).
Kafka:
Propagates user-registered event to consumers.
Notification Service:
Consumes user-registered event from user-events.
Creates a notification in notification_db (PostgreSQL:5435): { userId: "uuid", message: "Welcome, testuser! Your account has been created.", type: "email" }.
Caches notification in Redis.
Client Retrieval:
Client logs in (POST /api/v1/auth/login), receives JWT.
Client sends GET http://localhost:3000/api/v1/notification/user with JWT.
API Gateway proxies to Notification Service.
Notification Service retrieves notifications from Redis (or notification_db if cache miss) and returns them.
Design Choices
Microservices: Separate services (User, Blog, Notification) enable independent development, deployment, and scaling. Each service owns its database for data sovereignty.
Event-Driven Architecture: Kafka decouples services, allowing asynchronous communication and resilience (e.g., Notification Service can process events even if User Service is down).
Separate Databases: PostgreSQL instances (user_db, blog_db, notification_db) ensure data isolation and prevent tight coupling.
Caching with Redis: Improves performance by reducing database queries for frequently accessed data.
JWT Authentication: Stateless, secure, and scalable for microservices, with a shared JWT_SECRET for token validation across services.
Docker and Docker Compose: Ensures consistent environments, simplifies setup, and supports local development with a single docker-compose up.
Zod Validation: Provides type-safe, runtime validation for API payloads, enhancing reliability.
Logging with Winston: Centralized logging for debugging and monitoring, with file and console outputs.
Health Checks: Docker Compose health checks ensure services start only when dependencies are ready, preventing issues like Kafka connection failures.
Scalability and Resilience
Scalability:
Horizontal Scaling: Each service can be scaled independently by adding more Docker containers (e.g., multiple User Service instances behind a load balancer).
Kafka: Supports high-throughput event processing and can scale with additional brokers.
Redis: Can be clustered for higher cache capacity.
PostgreSQL: Can use read replicas or sharding for database scaling (not implemented but possible).
Resilience:
Kafka Retry Logic: Kafkajs retries failed connections (15 retries, 60s max) to handle transient issues.
Health Checks: Ensure services wait for PostgreSQL, Redis, and Kafka readiness.
Error Handling: Express middleware and Winston logging catch and log errors, returning user-friendly responses.
Data Isolation: Separate databases prevent cascading failures.
Monitoring: Winston logs provide visibility into service behavior; future enhancements could include Prometheus/Grafana.
Security
JWT: Protects endpoints with token-based authentication, validated by each service.
Bcryptjs: Secures user passwords with strong hashing.
Helmet: Sets secure HTTP headers to mitigate common web vulnerabilities.
CORS: Configured to allow only trusted origins (e.g., frontend URL).
Environment Variables: Sensitive data (e.g., JWT_SECRET, database credentials) stored in .env files, not hardcoded.
Deployment
Docker Compose: Defines services, databases, Redis, Kafka, and Zookeeper in a single docker-compose.yml.
Ports: 3000 (API Gateway), 3001-3003 (services), 5433-5435 (PostgreSQL), 6379 (Redis), 9092 (Kafka), 2181 (Zookeeper).
Networks: All components in app-network for hostname resolution.
Volumes: Persist PostgreSQL data (postgres-user-data, postgres-blog-data, postgres-notification-data).
Build: Each service has a Dockerfile for Node.js (based on node:18-alpine).
Run: docker-compose up --build starts all components locally.
Production: Can be deployed to Kubernetes or a cloud provider (e.g., AWS ECS) with secrets management and load balancing.
Testing
Unit/Integration Tests: Jest tests validate service logic (e.g., user registration, blog creation, notification processing).
API Testing: Postman collection (Microservices-API-Collection.json) includes requests for all endpoints, with JWT authentication.
End-to-End: Register a user, create a blog, and verify notifications using Postman to test the full flow.
