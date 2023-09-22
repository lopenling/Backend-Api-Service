# Base image
FROM node:14-alpine

# Set working directory
WORKDIR /app

# Copy package.json and yarn.lock
COPY package*.json  yarn.lock ./

# Install dependencies

RUN yarn install

# Copy source code
COPY ./src ./src

# Expose the API port
EXPOSE 3000

# Run the TypeScript compiler and start the server
CMD ["yarn", "start"]