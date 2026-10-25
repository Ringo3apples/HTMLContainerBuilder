# HTMLContainer Builder

> **ダブルクリック一発でブラウザに表示・自己展開するポータブルHTMLコンテナ生成ツール**  
> 完全サーバーレス・クライアントサイド完結型Webアプリケーション

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Platform](https://img.shields.io/badge/Platform-Web%20Browser-success.svg)]()
[![Three.js](https://img.shields.io/badge/Three.js-r160-black.svg)](https://threejs.org/)
[![three-vrm](https://img.shields.io/badge/@pixiv/three--vrm-v2.1.3-brightgreen.svg)](https://github.com/pixiv/three-vrm)

---

## 📖 概要

**HTMLContainer Builder** は、各種データファイル（`.vrm`, `.stl`, `.xlsx`, `.csv`, 画像や各種独自バイナリなど）を、**単一の自己展開型 `.html` ファイルにパッケージング**するWebアプリケーションです。

生成されたHTMLファイルは、ブラウザでダブルクリックするだけで即座に内蔵ビューアが立ち上がり、データの可視化や元のバイナリデータの取り出し・保存が行えます。

従来の Polyglot HTML（HTMLとZIPの単純結合）で発生していた**ローカル実行（`file:///`）時のCORS制約（`fetch(window.location.href)` の遮断）や文字化け描画を根本から解決**した、次世代のBase64インライン型アーキテクチャを採用しています。

---

## ✨ 主な特徴

- 🔒 **`file:///` ダブルクリック実行時のCORSエラー（Failed to fetch）ゼロ保証**
  - ZIPアーカイブをBase64エンコードし、HTML内の `<script id="container-zip-data" type="text/plain">` に安全に封入。
  - ネットワーク通信（`fetch`）を一切使わず、DOMから直接Base64を取得してインメモリ解凍するため、ローカルファイル実行やオフライン環境でも100%確実に起動します。
- 🧩 **動的モジュール解決（`es-module-shims`）**
  - 解凍された `importmap.json` を `importShim.addImportMap()` により動的登録。
  - `shimMode: true` を組み込み、ブラウザネイティブの動的 importmap 制約（`Unsupported in polyfill mode`）を完全に回避。
- 📦 **完全オフライン密閉バンドル（エアギャップ対応）**
  - Three.js や `@pixiv/three-vrm` などの外部依存ライブラリの実体を生成時に取得し、ZIP内の `/vendor` に完全同梱可能。
  - 起動時にインメモリの依存ファイルを動的 Blob URL にマッピングするため、インターネット接続が一切ない環境でも動作します。
- 🎭 **本格的な組み込みデータビューア**
  - **VRM 3Dアバタービューア**:
    - 公式 `@pixiv/three-vrm` & `GLTFLoader` によるインメモリパース。
    - VRM 0.0 / 1.0 座標系の自動正規化。
    - 自然な立ち姿（腕の脱力ポーズ）、呼吸モーション、約3.5秒周期のまばたきアニメーション。
    - モデル名・作者・規格バージョンを表示するグラスモーフィズム HUD。
    - 3点スタジオライティング、床グリッド、OrbitControls（回転・パン・ズーム）。
  - **3D STLビューア**: Three.js によるメッシュレンダリング・法線計算・カメラ自動センタリング。
  - **表・テキストビューア**: CSV / TSV / JSON / TXT を洗練されたテーブルとして表示。
  - **生データ保存プリセット**: 任意の独自バイナリを安全に取り出してダウンロード保存可能。
- 🛠️ **拡張性とカスタマイズ**
  - リモート CDN / GitHub Pages 等の外部ビューア URL（ES Module）指定。
  - ユーザー独自のカスタム `viewer.js` のブラウザ内エディタ編集 & ファイル読込。
- 🧪 **ブラウザ内ライブプレビュー**
  - 生成されたHTMLコンテナをダウンロードする前に、同一ブラウザ内の iframe サンドボックスで自己展開とビューア実行をシミュレーション可能。

---

## 🏗️ 全体アーキテクチャ

```text
[ ユーザーデータファイル (.vrm / .stl / etc.) ]
         +
[ ビューアモジュール (viewer.js) ]
         +
[ 依存関係マップ (importmap.json) ]
         +
[ (オプション) 依存ライブラリ実体 (/vendor/*) ]
         │
         ▼
     [ fflate ] によるZIP書庫の圧縮生成
         │
         ▼
     [ Base64 エンコード ]
         │
         ▼
┌────────────────────────────────────────────────────────┐
│  単一の HTMLContainer (.html)                          │
│                                                        │
│  <head>                                                │
│    ・es-module-shims (shimMode: true)                  │
│    ・fflate ランタイム (CDN または インライン)           │
│  </head>                                               │
│                                                        │
│  <body>                                                │
│    <!-- 安全に格納された Base64 ZIP データ -->           │
│    <script id="container-zip-data" type="text/plain">  │
│      UEsDBAoAAAAAA... (Base64文字列)                   │
│    </script>                                           │
│                                                        │
│    <!-- 自己展開ブートローダー -->                      │
│    <script>                                            │
│      1. DOMからBase64を取得                             │
│      2. fflateでインメモリZIP解凍                       │
│      3. vendorファイルをBlob URLに変換                 │
│      4. importShim.addImportMap() でモジュール解決       │
│      5. importShim('./viewer.js') でビューア起動        │
│    </script>                                           │
│  </body>                                               │
└────────────────────────────────────────────────────────┘
```

---

## 🚀 クイックスタート

本アプリケーションはサーバーレスの単一静的ページとして構築されています。

### 1. 起動方法

リポジトリをクローンまたはダウンロードし、Webサーバー（XAMPP, Live Server, `npx serve` 等）経由、またはブラウザで直接開きます。

```bash
# ローカルWebサーバーを起動する場合の例:
npx serve .
# またはブラウザで index.html を直接ダブルクリック
```

### 2. コンテナの生成手順

1. **データファイルの選択**:
   - 画面中央のドロップゾーンに対象ファイル（`.vrm`, `.stl`, `.xlsx`, `.csv` 等）をドラッグ＆ドロップ。
   - または、ヘッダー右上の `[STLサンプル]` や `[VRMサンプル読込]` ボタンを押して即座にデモデータをロード。
2. **パッケージング構成の設定**:
   - **ブートローダー基幹ランタイム**: `外部CDN読み込み`（軽量 約2KB）または `完全インライン埋め込み`（完全オフライン 約45KB）
   - **データビューアの選定**: `自動判別ビューア` / `Git・CDNビューア` / `カスタムJS同梱`
   - **依存ライブラリの解決方法**: `CDN importmap` または `完全オフラインバンドル (全部入り)`
3. **HTMLコンテナ生成**:
   - 「**HTMLコンテナを生成・ダウンロード**」をクリック。
   - ビルドログに進捗が表示され、完了後に自動的に `.html` ファイルがダウンロードされます。
4. **プレビュー再生**:
   - 右下の「**生成したコンテナをプレビュー再生**」をクリックすると、モーダル内の iframe で即座に展開・レンダリングを確認できます。

---

## 📋 書き出しオプション詳細

| 項目 | オプション | 説明 | 推奨用途 |
| :--- | :--- | :--- | :--- |
| **ブートローダー** | **外部CDN読み込み** | HTMLヘッダで `fflate` と `es-module-shims` をCDN参照。ファイルサイズ最小（約2KB + ペイロード）。 | 通常の配布・共有 |
| | **完全インライン埋め込み** | ランタイムコードをHTML内に直接インライン封入。 | ネットワーク隔離環境 |
| **ビューア選定** | **自動判別ビューア** | 拡張子（`.vrm`, `.stl`, `.csv`, その他）に応じて最適な内蔵ビューアを自動選定。 | 一般的な用途 |
| | **Git / CDN ビューア** | GitHub Pages等の外部ESモジュールURLを指定して実行時に動的読み込み。 | 独自ビューアのリモート管理 |
| | **カスタムJS同梱** | ブラウザ上で記述または読み込んだ `viewer.js` をZIP内に直接同梱。 | 独自ビューアの密閉配布 |
| **依存関係解決** | **CDN importmap** | `importmap.json` に CDN のURLを記述。必要なライブラリのみをブラウザが取得。 | ファイルサイズ重視 |
| | **完全オフラインバンドル** | Three.js, @pixiv/three-vrm 等のモジュール実体をZIP内の `/vendor` に密閉。 | 完全オフライン・長期保存 |

---

## 🛠️ 自作ビューア（viewer.js）のインターフェース仕様

独自のビューアモジュールを作成・同梱する場合、以下のシグネチャを持つ ES モジュールとして記述します：

```javascript
import * as THREE from 'three'; // importmapにより自動解決

/**
 * HTMLContainerのエントリーポイント
 * @param {Uint8Array} dataBytes - メモリ上に展開された元データのバイナリ配列
 * @param {Object} context - メタ情報
 * @param {string} context.fileName - 元ファイル名（例: sample.vrm）
 * @param {string} context.fileType - MIMEタイプ
 */
export async function render(dataBytes, context) {
  const container = document.getElementById('viewer-root') || document.body;
  
  // 例: 3Dシーンの構築やデータの可視化処理を実装
  console.log(`Rendering: ${context.fileName}, size: ${dataBytes.byteLength} bytes`);
}
```

---

## 💻 動作環境

- **対応ブラウザ**:
  - Google Chrome / Chromium 最新版
  - Mozilla Firefox 最新版
  - Microsoft Edge 最新版
  - Apple Safari 最新版
- **必要機能**: ES2020+、WebGL / WebGL2（3D表示時）、Blob URL サポート

---

## 📄 ライセンス

本プロジェクトは [MIT License](LICENSE) の下で公開されています。
組み込みライブラリのライセンスについては各提供元の利用規約に準拠します：
- [fflate](https://github.com/101arrowz/fflate) (MIT)
- [es-module-shims](https://github.com/guybedford/es-module-shims) (MIT)
- [three.js](https://github.com/mrdoob/three.js) (MIT)
- [@pixiv/three-vrm](https://github.com/pixiv/three-vrm) (MIT)
