# Build env
FROM node
WORKDIR /src
ADD . .
RUN npm install && npm run build

# Runtime env
FROM node
ENV NODE_ENV=production DEBUG=ha-covid19,ha-covid19:* CHROMIUM_OPTS="--no-sandbox,--disable-setuid-sandbox"
RUN apt-get update \
    && apt-get install -y wget gnupg \
    && wget -q -O - https://dl-ssl.google.com/linux/linux_signing_key.pub | apt-key add - \
    && sh -c 'echo "deb [arch=amd64] http://dl.google.com/linux/chrome/deb/ stable main" >> /etc/apt/sources.list.d/google.list' \
    && apt-get update \
    && apt-get install -y google-chrome-unstable fonts-ipafont-gothic fonts-wqy-zenhei fonts-thai-tlwg fonts-kacst fonts-freefont-ttf \
      --no-install-recommends \
    && rm -rf /var/lib/apt/lists/*
WORKDIR /app
COPY --from=0 /src/dist .
ADD package.json .
RUN npm install
CMD ["app.js"]
