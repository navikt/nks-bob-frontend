FROM gcr.io/distroless/nodejs24-debian13

WORKDIR /usr/src/app
COPY .next/standalone ./
COPY .next/static ./.next/static
COPY public ./public

USER apprunner

EXPOSE 3030
ENV PORT=3030
ENV HOSTNAME="0.0.0.0"
CMD ["server.js"]
