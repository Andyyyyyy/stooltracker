FROM node:12-alpine AS install
COPY package.json /app/
WORKDIR /app
RUN npm install

FROM install AS config
COPY models ./models
COPY config ./config
COPY migrations ./migrations
COPY .env .
WORKDIR /app
RUN mkdir database 
RUN touch database/database.sqlite
RUN npx sequelize db:migrate

FROM config AS run
WORKDIR /app
VOLUME /database
COPY index.js bristol.js /app/
CMD ["node", "index"]
