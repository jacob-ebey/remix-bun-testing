FROM jarredsumner/bun:edge as deps
RUN mkdir /application/
WORKDIR /application/

ADD package.json bun.lockb ./
RUN bun install

FROM node:18-bullseye-slim as remix
RUN mkdir /application/
WORKDIR /application/

COPY --from=deps /opt/bun/bin/bun /bin/bun
COPY --from=deps /application/node_modules /application/node_modules

ADD . ./

RUN bun run build


FROM jarredsumner/bun:edge
RUN mkdir /application/
WORKDIR /application/

COPY --from=deps /application/node_modules /application/node_modules 
COPY --from=deps /application/package.json /application/package.json
COPY --from=deps /application/bun.lockb /application/bun.lockb
COPY --from=remix /application/build /application/build
COPY --from=remix /application/public /application/public


ADD server.ts ./

EXPOSE 3000
CMD ["run", "start"]