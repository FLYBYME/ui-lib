# Build stage
FROM node:18-slim AS builder

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .
RUN npm run build
RUN npm run build:browser

# Final stage
FROM nginx:alpine

# Copy the build artifacts from the builder stage
# Assuming we might want to serve a demo or just have the files available
COPY --from=builder /app/dist /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
