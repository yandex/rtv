FROM vitalets/tizen-webos-sdk:2.0

WORKDIR /app

# Prerequisites (Node.js v12)
RUN curl -sL https://deb.nodesource.com/setup_16.x | bash -
RUN apt-get update && \
    apt-get upgrade -y && \
    apt-get install -y \
      nodejs \
      iputils-ping

# prevent /tmp/sdb.log grow
RUN ln -fs /dev/null /tmp/sdb.log

COPY package*.json ./
RUN npm install

COPY packages ./packages/
COPY lerna.json ./lerna.json
COPY tsconfig.json ./tsconfig.json

RUN npm run bootstrap
RUN npm run build

# set rtv-server config
RUN echo "{ \"aresPath\": \"/webOS_TV_SDK/CLI/bin\" }" > ./packages/server/.rtv-server

# Setup rtv cli globally to make it available in shell
# RUN npm i -g packages/cli

# Run server
CMD ["node", "./packages/server/dist/cli.js"]
