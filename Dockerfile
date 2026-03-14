FROM node:20

# Install python + pipx
RUN apt-get update && apt-get install -y python3 python3-pip pipx
RUN pipx ensurepath

# Install yt-dlp using pipx
RUN pipx install yt-dlp

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

CMD ["npm","start"]
