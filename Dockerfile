FROM node:12-alpine AS install
COPY package.json /app/
WORKDIR /app
RUN npm install

FROM install AS config
COPY models ./models
COPY config ./config
COPY migrations ./migrations
WORKDIR /app

FROM config AS run
WORKDIR /app
VOLUME /database
COPY index.js bristol.js /app/
ENTRYPOINT ["/bin/sh", "/app/run.sh"]