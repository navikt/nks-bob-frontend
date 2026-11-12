FROM europe-north1-docker.pkg.dev/cgr-nav/pull-through/nav.no/node:26-slim@sha256:0e19ffaf566a98bec82888be8820196ec0fad053a3a624c588c08e01ea82ccd2

WORKDIR /usr/src/app
COPY dist/ dist/
COPY /server server/
COPY node_modules/ node_modules/

WORKDIR /usr/src/app/server
USER apprunner

EXPOSE 3030
CMD ["dist/src/server.js"]
