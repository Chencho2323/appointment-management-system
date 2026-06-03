FROM node:18-alpine

WORKDIR /app

# Copiar archivos de dependencias
COPY package*.json ./

# Instalar dependencias
RUN npm install

# Copiar el resto del código
COPY . .

EXPOSE 3000

ENV PORT=3000
ENV NODE_ENV=development

CMD ["npm", "run", "dev"]
