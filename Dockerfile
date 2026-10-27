FROM europe-north1-docker.pkg.dev/cgr-nav/pull-through/nav.no/node:26-slim@sha256:03e02d35d9041ee6b174c0663aa1e1efec554b7121014cc613dee6c9fbe07e88

WORKDIR /usr/src/app
COPY dist/ dist/
COPY /server server/
COPY node_modules/ node_modules/

WORKDIR /usr/src/app/server
USER apprunner

EXPOSE 3030
CMD ["dist/src/server.js"]
