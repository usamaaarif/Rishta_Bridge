FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

# Since this is local dev environment for Sprint 1, we run the dev server
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0"]
