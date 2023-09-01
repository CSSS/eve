FROM node:17.3.0-alpine

WORKDIR /app

COPY src src
COPY .eslintrc.json .eslintrc.json
COPY package.json package.json
COPY package-lock.json package-lock.json
COPY tsconfig.json tsconfig.json
RUN npm install

CMD ["npm", "run", "start" ]
