# Improved version of web-app/1.0/Dockerfile (see tutorial chapter 19)

# Pin a specific major version instead of the moving "current" tag
FROM node:24-alpine

# tini runs as PID 1 and forwards SIGTERM to node, so Pods stop quickly
RUN apk add --no-cache tini

WORKDIR /src

# Copy the dependency list first: this layer is only rebuilt when package.json changes
COPY package.json ./
RUN npm install --omit=dev

# Then copy the rest of the source code
COPY . .

# Don't run as root (the node user ships with the official image)
USER node

EXPOSE 8080
ENTRYPOINT ["/sbin/tini", "--"]
CMD ["node", "app.js"]
