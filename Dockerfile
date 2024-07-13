FROM oven/bun:1 

WORKDIR /usr/src/app

ENV PORT 8080
ENV HOST 0.0.0.0

COPY package*.json .
COPY bun.lockb .

RUN bun install --production

COPY . .

EXPOSE 8080

ENTRYPOINT [ "bun", "run", "index.ts" ]