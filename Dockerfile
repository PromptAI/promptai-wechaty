FROM node:16.14.2

WORKDIR /app
COPY . /app
COPY start.sh /app
RUN chmod 777 /app/start.sh
RUN npm install

ENTRYPOINT /app/start.sh
