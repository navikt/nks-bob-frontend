FROM europe-north1-docker.pkg.dev/cgr-nav/pull-through/nav.no/node:26-slim@sha256:d78042255221985a7827aef5a3bea0c3e8db44e5d18e67ede50c3895ec9d3ac4

WORKDIR /usr/src/app
COPY dist/ dist/
COPY /server server/
COPY node_modules/ node_modules/

WORKDIR /usr/src/app/server
USER apprunner

EXPOSE 3030
CMD ["dist/src/server.js"]
