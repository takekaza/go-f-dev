# Go用のDockerfile
FROM golang:1.19.1-alpine

# 必要なパッケージをインストール
RUN apk update && apk add git

# 作業ディレクトリを指定
RUN mkdir -p /go/src/github.com/go-f-dev
WORKDIR /go/src/github.com/go-f-dev

# 依存関係をコピー
ADD go.mod go.sum /go/src/github.com/go-f-dev

RUN go mod download && go mod verify

# ソースをコピー
ADD . /go/src/github.com/go-f-dev

# パッケージのインポート
# RUN go get -u golang.org/x/tools/cmd/goimports
RUN go install golang.org/x/tools/cmd/goimports@latest
RUN go install github.com/ramya-rao-a/go-outline@latest
RUN go install golang.org/x/tools/gopls@latest

# ビルド
# RUN go build -o go-app ./cmd/main.go

# ポートを公開
EXPOSE 8080

# Airで自動ビルド
RUN go install github.com/cosmtrek/air@latest
CMD ["air"]

# 実行コマンド
# CMD ["./go-app"]