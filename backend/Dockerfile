# Use official slim Python image
FROM python:3.10-slim

# Set working directory inside container
WORKDIR /app

# Install system dependencies (build tools and postgres client)
RUN apt-get update && apt-get install -y \
    build-essential \
    postgresql-client \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements file and install Python dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy all backend source code into container
COPY . .

# Create uploads directory (if your app needs it)
RUN mkdir -p uploads

# Copy wait-for-db.sh script to container and make it executable
COPY wait-for-db.sh /app/wait-for-db.sh
RUN chmod +x /app/wait-for-db.sh

# Expose port 8000 to outside Docker
EXPOSE 8000

# Default command: run the wait-for-db script which waits for Postgres, runs migrations, then starts the backend server
CMD ["/app/wait-for-db.sh", "uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
