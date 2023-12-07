package main

import (
	// "fmt"
	// "log"
	"net/http"
	"net/url"
	"os"
	// "time"

	"backend/db"
	"github.com/labstack/echo/v4"
	"github.com/labstack/echo/v4/middleware"
)

// Prefecture 都道府県データ
type Prefecture struct {
	PrefCode int    `json:"prefCode"`
	PrefName string `json:"prefName"`
}

// PopulationData 人口データ
type PopulationData struct {
	Label string `json:"label"`
	Value int    `json:"value"`
}

// PopulationDataset 都道府県コードごとの人口データセット
type PopulationDataset struct {
	PrefCode int              `json:"prefCode"`
	Data     []PopulationData `json:"data"`
}

func main() {

	// ここでdb/db.goのMySQL接続用の関数を呼び出します。
	db.NewDB()

	e := echo.New()

	/*
		CORSミドルウェア設定
	*/
	e.Use(middleware.CORSWithConfig(middleware.CORSConfig{
		// AllowOrigins: []string{"*"}, // すべてのオリジンからのリクエストを許可
		AllowOrigins: []string{"http://localhost:3000"}, // Reactアプリケーションのオリジン
		AllowMethods: []string{echo.GET, echo.HEAD, echo.PUT, echo.PATCH, echo.POST, echo.DELETE},
		AllowHeaders: []string{"Content-Type", "X-API-KEY"}, // ここでAPIキーのヘッダーを許可
	}))

	// e.GET("/", articleIndex) // テスト用の疎通確認
	// エンドポイント 都道府県データを返す
	e.GET("/api/prefectures", handlePrefectures)

	// エンドポイント 人口データを返す
	e.GET("/api/population/:prefCode", handlePopulation)

	// サーバーを8080ポートで起動
	e.Logger.Fatal(e.Start(":8080"))
}

/*
都道府県データを返すハンドラー
*/
func handlePrefectures(c echo.Context) error {
	// RESAS APIから都道府県リストを取得してクライアントに返す
	client := &http.Client{}
	req, err := http.NewRequest("GET", "https://opendata.resas-portal.go.jp/api/v1/prefectures", nil)
	if err != nil {
		return echo.NewHTTPError(http.StatusInternalServerError, err.Error())
	}

	// APIキーをリクエストヘッダーに設定
	req.Header.Set("X-API-KEY", os.Getenv("RESAS_API_KEY"))

	res, err := client.Do(req)
	// エラーハンドリング
	if err != nil {
		return echo.NewHTTPError(http.StatusInternalServerError, err.Error())
	}
	defer res.Body.Close()

	// 取得したレスポンスをそのままクライアントに転送
	return c.Stream(res.StatusCode, res.Header.Get("Content-Type"), res.Body)
}

/*
人口データを返すハンドラー
*/
func handlePopulation(c echo.Context) error {
	// クエリパラメータから都道府県コードを取得
	prefCode := c.QueryParam("prefCode")
	// httpクライアントを使用
	client := &http.Client{}
	// RESAS APIのエンドポイントを構築
	url := "https://opendata.resas-portal.go.jp/api/v1/population/composition/perYear?prefCode=" + prefCode
	// RESAS APIから人口データを取得してクライアントに返す
	req, err := http.NewRequest("GET", url, nil)
	// エラーハンドリング
	if err != nil {
		return echo.NewHTTPError(http.StatusInternalServerError, err.Error())
	}

	// APIキーをリクエストヘッダーに設定
	req.Header.Set("X-API-KEY", os.Getenv("RESAS_API_KEY"))

	// リクエストに対してのレスポンスを受け取る
	res, nil := client.Do(req)
	// nilでない場合はエラー処理
	if err != nil {
		return echo.NewHTTPError(http.StatusInternalServerError, err.Error())
	}
	defer res.Body.Close() // 最後にbodyを閉じる

	// 取得したレスポンスをそのままクライアントに転送
	return c.Stream(res.StatusCode, res.Header.Get("Content-Type"), res.Body)
}

/*
テスト用の疎通確認
*/
// func articleIndex(c echo.Context) error {
// 	// localhost:8080にアクセスした時、ブラウザ画面に「Hello, World!」と表示されるよう設定しています。
// 	return c.String(http.StatusOK, "Hello, World!")
// }
