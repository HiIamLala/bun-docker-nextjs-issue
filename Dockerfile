FROM oven/bun:alpine AS base

# Change work directory
WORKDIR /app

# Prepare dev dependencies
COPY . .

# Install dependencies
RUN bun install

# Set node env to production (don't know why build failed if not)
ENV NODE_ENV production

# Build
RUN bun run build

# Expose port 3000
EXPOSE 3000

# Set env to serve at port 3000
ENV PORT 3000

# Set hostname serve
ENV HOSTNAME "0.0.0.0"

# Start serving
ENTRYPOINT [ "bun", "start" ]
