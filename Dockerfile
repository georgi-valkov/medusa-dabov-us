# Development Dockerfile for Medusa
FROM node:22

# Set working directory
WORKDIR /server

# Add build argument for GitHub token
ARG GITHUB_TOKEN

# Set the token as an environment variable
ENV GITHUB_TOKEN=$GITHUB_TOKEN

# Copy package files and npm config
COPY package.json package-lock.json .npmrc ./

# Install all dependencies using npm
RUN npm install --legacy-peer-deps

# Copy source code
COPY . .

# Expose the port Medusa runs on
EXPOSE 9000

# Start with migrations and then the development server
CMD ["/bin/sh", "/server/start.sh"]