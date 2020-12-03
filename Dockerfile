FROM node:latest as build

WORKDIR /app

# Install dependencies
COPY package.json .
RUN npm install --no-audit --no-package-lock

# Build application
COPY src ./src/
COPY public ./public/
COPY tsconfig.json ./
RUN npm run build

# Serve enviroment
FROM nginx:stable-alpine

# Copy build application
COPY --from=build /app/build /usr/share/nginx/html

# Copy config file
COPY nginx.conf /etc/nginx/conf.d/default.conf


EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]