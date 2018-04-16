FROM node:8
COPY . .
ENTRYPOINT ["node", "server/bin/www.js"]
ENV PORT=80
EXPOSE 80