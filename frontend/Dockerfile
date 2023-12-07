# Vue.js用Dockerfile
FROM node:18-alpine

# 作業ディレクトリ指定
WORKDIR /app
RUN apk update

# 依存関係をコピー
COPY package*.json ./

# 依存関係をインストール
# RUN npm install

# ソースをコピー
COPY . .

# ビルド
# RUN npm run build
# CMD [ "npm", "start"]

# アプリが3000ポートでリッスンすることをDockerに伝える
EXPOSE 3000

# 起動
# CMD [ "npm", "start"]