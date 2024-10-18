#!/bin/sh
if [[ -z "$BOT_TOKEN" ]]; then
    echo "Please set BOT_TOKEN";
    exit 1;
fi

npx sequelize db:migrate
node index.js