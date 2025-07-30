# HealthCare AI Chat Interface
A Laravel-based web interface that allows users to interact with an LLM (Large Language Model) to ask health-related questions.

This application is fully Dockerized for seamless deployment.

## 🚀 Prerequisites

- [Docker Desktop](https://www.docker.com/products/docker-desktop/)
- [Git](https://git-scm.com/) (optional, for cloning)

## ⚙️ Getting Started

1. **Clone the Repository**     

   You can either clone the repo or download it as a `.zip` file:
   ```bash
   git clone https://github.com/YzENT/AI-Chat-Interface-Dockerized.git
   ```

2. **Navigate to the Project Directory**  
   ```bash
   cd AI-Chat-Interface-Dockerized
   ```

4. **Run the Application (First-Time Initialization)**  

   This will build and start all necessary containers:
   ```bash
   docker-compose up --build
   ```
   ⏳ Note: Initial setup may take a few minutes to download dependencies and set up services.

4. **Access the Services**

   Once running, you’ll see a message such as:
   ```shell
    fpm: ready to handle connections
   ```

    Web interface: http://localhost

    phpMyAdmin: http://localhost:8080
    (Use credentials provided in the `.env` file.)


## 🧪 Environment Details

- **🔐 Database Credentials (.env)**     

   ```env
    DB_NAME=aichat
    DB_USERNAME=phpmyadmin
    DB_PASSWORD=@dmin12345
    DB_ROOT_PASSWORD=nwgMWNtTDjImvPR2fPYoP4jEWuzMDv
   ```

- **🛠️ Developer Notes**    

    - Run all commands such as `git`, `curl`, and `bash` inside the `app_engine` container.
    - Use `npm` commands only inside the `node` container.


- **🐳 Common Docker Commands**
   ```shell
    # Stop and remove containers (while keeping database volumes)
    docker-compose down

    # Rebuild and start containers in detached mode
    docker-compose up -d --build

    # Access the app container as root
    docker-compose exec --user root app bash
   ```