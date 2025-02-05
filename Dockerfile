FROM gcr.io/distroless/nodejs22-debian12

WORKDIR /usr/src/app
COPY dist/ dist/
COPY /server server/

WORKDIR /usr/src/app/server
USER apprunner

EXPOSE 3030
CMD ["dist/src/server.js"]
