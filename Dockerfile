FROM node:22.14

RUN corepack enable

RUN mkdir /app
# COPY ./app /app
WORKDIR /app

# RUN pnpm install

EXPOSE 3000

CMD pnpm migrate+dev
# or
# CMD pnpm dev
