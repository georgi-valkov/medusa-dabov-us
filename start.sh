#!/bin/bash

# Ensure the script exits on any error
set -e

# Check for required tools
command -v npx >/dev/null 2>&1 || { echo >&2 "npx is required but not installed. Aborting."; exit 1; }
command -v npm >/dev/null 2>&1 || { echo >&2 "npm is required but not installed. Aborting."; exit 1; }

# Run database migrations
echo "Running database migrations..."
npx medusa db:migrate
echo "Database migrations completed successfully."

# Seed the database
echo "Seeding database..."
if ! npm run seed; then
  echo "Seeding failed, continuing..."
fi

# Build the project
echo "Building the project..."
if ! npm run build; then
  echo "Build failed. Aborting."
  exit 1
fi
echo "Build completed successfully."

# Change to the .medusa/server directory and install dependencies
echo "Setting up the built application..."
cd .medusa/server && npm install --legacy-peer-deps

# Set NODE_ENV to production
echo "Setting NODE_ENV to production..."
export NODE_ENV=production

# Start the Medusa application
echo "Starting Medusa application..."
npm run start