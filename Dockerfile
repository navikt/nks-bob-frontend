FROM europe-north1-docker.pkg.dev/cgr-nav/pull-through/nav.no/node:26-slim

WORKDIR /usr/src/app
COPY dist/ dist/
COPY /server server/
COPY node_modules/ node_modules/

WORKDIR /usr/src/app/server
USER apprunner

EXPOSE 3030
CMD ["dist/src/server.js"]
