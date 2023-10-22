FROM node:18
WORKDIR /usr/src/app
COPY package*.json ./
RUN npm instal
EXPOSE 3000
COPY . .
CMD ["npm", "run", "cluster"]