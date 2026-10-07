FROM europe-north1-docker.pkg.dev/cgr-nav/pull-through/nav.no/node:26-slim@sha256:6b6cfb279bf11f96e9c665712987eb2bad0d74bea81fd617d0bae566c7d74818

WORKDIR /usr/src/app
COPY dist/ dist/
COPY /server server/
COPY node_modules/ node_modules/

WORKDIR /usr/src/app/server
USER apprunner

EXPOSE 3030
CMD ["dist/src/server.js"]
