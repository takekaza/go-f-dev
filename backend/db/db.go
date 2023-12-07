package db

import (
	"fmt"
	"log"
	"os"

	"github.com/joho/godotenv"
	"gorm.io/driver/mysql"
	"gorm.io/gorm"
)

// DBとの接続設定
func NewDB() *gorm.DB {

	// ここで環境変数を読み込んでいます。
	// 環境変数を記述する「.env」にDB接続用のURLを記載しているため
	err := godotenv.Load()
	if err != nil {
		log.Fatalln(err)
	}

	//「.env」のDB接続用のURLのDB_DNSを呼び出します。
	url := os.Getenv("DB_DNS")

	// ここでGoの外部パッケージである「GORM」を使用し、MySQLと接続します。
	db, err := gorm.Open(mysql.Open(url), &gorm.Config{})
	if err != nil {
		log.Fatalln(err)
	}

	// 成功したら「Connected」を出力します。
	fmt.Println("Connected")
	return db
}

// DBのclose設定
func CloseDB(db *gorm.DB) {
	sqlDB, _ := db.DB()
	if err := sqlDB.Close(); err != nil {
		log.Fatalln(err)
	}
}
