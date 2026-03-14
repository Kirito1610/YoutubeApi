FROM node:20

# Install python and create python alias
RUN apt-get update && apt-get install -y python3 python3-pip
RUN ln -s /usr/bin/python3 /usr/bin/python

# Install yt-dlp
RUN pip install -U yt-dlp --break-system-packages

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

CMD ["npm","start"]
