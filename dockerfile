# 1. Escolhe a imagem oficial do Node.js
FROM node:20-alpine

# 2. Cria a pasta do sistema dentro do container
WORKDIR /app

# 3. Copia os arquivos de dependências (se existirem)
COPY package*.json ./

# 4. Instala as dependências do seu sistema
RUN npm install

# 5. Copia o restante dos arquivos (incluindo seu JSON e códigos)
COPY . .

# 6. Informa a porta que o sistema vai rodar (ex: 3000)
EXPOSE 3000

# 7. O comando que inicia o seu sistema
CMD ["npm", "start"]

