import React, { useEffect, useState } from "react";
import "./App.css";
import axios from "axios";
import Highcharts from "highcharts";
import HighchartsReact from "highcharts-react-official";
import Accessibility from "highcharts/modules/accessibility";
import log from "console";
import Select, { MultiValue } from "react-select";

/*
  都道府県のデータ型定義
 */
type Prefecture = {
  prefCode: number; // 都道府県コード
  prefName: string; // 都道府県名
};

/*
  人口データの型定義
*/
type PopulationData = {
  label: string; // 年
  value: number; // 人口数
};

/*
  人口データセット用の型定義
*/
type PopulationDataset = {
  prefCode: number; // 都道府県コード
  data: PopulationData[]; // 人口データの配列
};

/*
  都道府県の検索用OptionTypeの型定義
*/
interface OptionType {
  label: string;
  value: number;
}

/*
  Highchartsにアクセシビリティモジュールを追加
*/
Accessibility(Highcharts);

const App: React.FC = () => {
  /*
    ステート
  */
  // 各都道府県のデータを格納するステート
  const [prefectures, setPrefectures] = useState<Prefecture[]>([]);
  // 選択された都道府県の人口データセットを格納するステート
  const [populationDatasets, setPopulationDatasets] = useState<
    PopulationDataset[]
  >([]);
  // 選択された都道府県コードを格納するステート
  const [selectedPrefectures, setSelectedPrefectures] = useState<number[]>([]);

  // react-select用の選択肢を設定
  const selectOptions = prefectures.map((prefecture) => ({
    value: prefecture.prefCode,
    label: prefecture.prefName,
  }));

  // 検索ボックスから選択された都道府県を更新するハンドラ
  const handleSelectChange = (
    selectedOptions: MultiValue<OptionType> | null // null を許容する
  ) => {
    // selectedOptions が null の場合、すべての選択がクリアされた空配列に
    setSelectedPrefectures(
      selectedOptions ? selectedOptions.map((option) => option.value) : []
    );
  };

  /*
    都道府県を取得
  */
  // コンポーネントがマウントされた後に一度だけ実行される副作用
  useEffect(() => {
    // RESAS APIから都道府県リストを取得する
    axios
      .get("http://localhost:8080/api/prefectures")
      .then((res) => {
        // 取得したデータをステートに格納
        // console.log("[Debug] res.data", res.data);
        setPrefectures(res.data.result);
      })
      .catch((err) => {
        // エラー時の処理
        console.error("[Error] fetching prefectures: ", err);
      });
  }, []);

  /*
    選択された都道府県の人口データを取得する非同期関数
  */
  const fetchPopulationData = async (
    prefCode: number
  ): Promise<PopulationDataset | null> => {
    try {
      // RESAS APIから人口データを取得
      const response = await axios.get(
        `http://localhost:8080/api/population/${prefCode}`
      );
      // responseの中身が期待したデータ構造になっているか
      return {
        prefCode,
        data: response.data.result.data[0].data,
        // data: response.data.data,
      };
    } catch (err) {
      // エラー時の処理
      console.error("[Error] fetching population data: ", err);
      return null; // エラーが発生した場合はnullを返す
    }
  };

  // 選択された都道府県が変わったときに人口データを取得する副作用
  useEffect(() => {
    // 現在選択されている都道府県の人口データを更新する関数
    const updatePopulationDatasets = async () => {
      // 選択された都道府県がない場合は人口データセットを空にする
      if (!selectedPrefectures.length) {
        setPopulationDatasets([]);
        return;
      }
      // Promise.allを使って、選択された全ての都道府県の人口データを並列で取得する
      const newDatasets = await Promise.all(
        selectedPrefectures.map((prefCode) => fetchPopulationData(prefCode))
      );
      // nullでないデータセットだけをフィルタリングしてステートを更新する
      setPopulationDatasets(
        newDatasets.filter(
          (dataset): dataset is PopulationDataset => dataset !== null
        )
      );
    };
    // 選択された都道府県がある場合のみ、データ更新関数を実行
    if (selectedPrefectures.length) {
      updatePopulationDatasets();
    } else {
      // 選択された都道府県がない場合は人口データセットを空にする
      setPopulationDatasets([]);
    }
  }, [selectedPrefectures]);

  // Highchartsのオプション設定
  const chartOptions: Highcharts.Options = {
    /*
      グラフの設定
    */
    title: { text: "人口推移" },
    yAxis: { title: { text: "人口数（人）" } },
    xAxis: { title: { text: "西暦（年）" } },
    accessibility: {
      enabled: true, // アクセシビリティ機能有効
    },
    plotOptions: {
      series: {
        label: { connectorAllowed: false },
        pointInterval: 5,
        pointStart: 1960,
      },
    },
    series: populationDatasets.map((dataset) => ({
      name:
        prefectures.find((pref) => pref.prefCode === dataset.prefCode)
          ?.prefName ?? "不明",
      data: dataset.data.map((data) => data.value),
      type: "line",
    })),
  };

  // コンポーネントのレンダリング
  return (
    // JSX
    <>
      <header>
        <div className="checker-ttl">
          <svg
            className="checker-ico"
            width="38"
            height="38"
            viewBox="0 0 38 38"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              fillRule="evenodd"
              clipRule="evenodd"
              d="M26.7407 26.7407L26.7407 0L38 11.2593V38H38H11.2592L-1.14441e-05 26.7407L26.7407 26.7407H26.7407Z"
              fill="black"
            />
          </svg>
          <h1>人口チェッカー</h1>
        </div>
      </header>
      <div className="top-contents">
        <h2>都道府県</h2>
        <section className="top-prefecture">
          {/* react-selectコンポーネントを使用 */}
          <Select
            options={selectOptions}
            isMulti // 複数選択を可能にする
            onChange={handleSelectChange}
            className="react-select-container"
            classNamePrefix="react-select"
            placeholder="都道府県を入力してください"
          />
        </section>
        <div className="graph-contents">
          <h2>人口増減グラフ</h2>
          {populationDatasets.length === 0 ? (
            <p className="graph-data__title">データがありません</p>
          ) : (
            <HighchartsReact highcharts={Highcharts} options={chartOptions} />
          )}
        </div>
      </div>
    </>
  );
};

export default App;
