# HTMLContainer Builder

> **パッケージ化したデータをブラウザ上でプレビュー・自己解凍するポータブルHTMLコンテナ生成ツール**  
> 完全サーバーレス・クライアントサイド完結型Webアプリケーション

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Platform](https://img.shields.io/badge/Platform-Web%20Browser-success.svg)]()
[![Three.js](https://img.shields.io/badge/Three.js-r160-black.svg)](https://threejs.org/)
[![three-vrm](https://img.shields.io/badge/@pixiv/three--vrm-v2.1.3-brightgreen.svg)](https://github.com/pixiv/three-vrm)

---

## 📖 概要

**HTMLContainer Builder** は、データファイルを**単一の自己展開型 `.html` ファイルにパッケージング**するWebアプリケーションです。

生成されたHTMLコンテナは、ブラウザでダブルクリックするだけで起動し、**ネットワーク環境や専用ソフトウェアに依存せず、内蔵された元データを即座に自己展開・解凍（保存）**することができます。

さらに、**対応ファイル形式については、解凍前にブラウザ上で直接リッチにプレビュー（可視化・インタラクティブ操作）**することが可能です。

従来の Polyglot HTML（HTMLとZIPの単純結合）で発生していた**ローカル実行（`file:///`）時のCORS制約（`fetch(window.location.href)` の遮断）や文字化け描画を根本から解決**した、次世代のBase64インライン型アーキテクチャを採用しています。

---

## 📂 対応ファイル形式（プレビュー対応）

本アプリケーションのビュアープラグインにより、**ブラウザ上で直接リッチにプレビュー表示（可視化・操作）できる対応形式**です。  
ファイルをドラッグ＆ドロップすると拡張子が自動判別され、最適なビューア（JS/CSS）が適用されます。

| カテゴリ | 拡張子 | フォーマット | 内部エンジン / プラグイン | プレビュー機能・特徴 |
| :--- | :--- | :--- | :--- | :--- |
| **3Dモデル** | **`.vrm`** | VRM 3Dアバター | `viewers/vrm/vrm.js`<br>`@pixiv/three-vrm`<br>`three/GLTFLoader` | 3Dアバター表示、VRM 0.0/1.0 規格自動対応、自然な脱力立ち姿、呼吸・瞬きアニメーション、メタデータ（モデル名/作者/規格）HUD、スタジオ3点照明、床グリッド、カメラ自動センタリング、OrbitControls（回転/パン/ズーム）、元データ解凍保存 |
| | **`.stl`** | 3D STLモデル | `viewers/stl/stl.js`<br>`three`<br>`three/STLLoader` | 3Dポリゴンメッシュ表示、法線自動計算、自動センタリング、OrbitControls、元データ解凍保存 |
| **ドキュメント** | **`.docx`** | Microsoft Word 文書 | `viewers/docx/docx.js`<br>`docx-preview` | Word文書の忠実なレイアウトページプレビュー、スタイル・フォント・表・画像レンダリング、元データ解凍保存 |
| **表・データ** | **`.csv`** | CSVスプレッドシート | `viewers/table/table.js` | ヘッダー固定・スクロール対応データテーブル表示、レコード件数カウント、元データ解凍保存 |
| | **`.tsv`** | タブ区切りテキスト | `viewers/table/table.js` | タブ区切りデータのテーブル展開表示、元データ解凍保存 |
| **テキスト** | **`.json`** | JSON構造化データ | `viewers/table/table.js` | 構造化テキスト展開表示、元データ解凍保存 |
| | **`.txt`** | プレーンテキスト | `viewers/table/table.js` | ドキュメント表示、元データ解凍保存 |

---

## 🧩 プラグイン分離 & `registry.json` による動的配信アーキテクチャ

ビューアはモノリシックな単一コードではなく、フォーマットごとに独立したプラグイン（例: `vrm.js` / `vrm.css`、`docx.js` / `docx.css`）として分離されています。

リポジトリおよび GitHub Pages（`https://ringo3apples.github.io/HTMLContainerBuilder/viewers/`）上に置かれた **`registry.json`（ビューアカタログ）** をもとに以下のスマートな判定・配信が行われます：

1. **パッケージ化前の最新カタログFetch**:
   - ビルド実行前に最新の `registry.json` をFetchし、対象ファイルの拡張子がプレビュー対応しているか動的に判定します。
2. **プレビュー対応形式の場合**:
   - その拡張子に必要な特定のビューアの `.js` と `.css`（および依存ライブラリ）のみをダウンロード・同梱（または GitHub Pages URL によるオンデマンド読み込み）します。
3. **プレビュー未対応形式の場合（生データ自己解凍）**:
   - プレビュー用 `.js` や `.css` のダウンロード・取得を**完全にスキップ（通信量 0 KB）**し、不要なスクリプトを一切含まない最小・安全な自己解凍コンテナとしてパッケージ化します。

---

## 📦 その他のファイル形式（パッケージング・自己解凍）

**上記以外のあらゆるファイル形式についても、同様に単一HTMLコンテナとしてパッケージングし、ダブルクリックで自己展開・解凍（保存）することができます。**

- **対象形式の例**:
  - オフィス・ドキュメント（`.xlsx`, `.pdf`, `.pptx` 等）
  - 3D / CAD / CAE データ（`.vtu`, `.vtk`, `.obj`, `.ply`, `.glb`, `.gltf`, `.step` 等）
  - 画像・メディア（`.png`, `.jpg`, `.webp`, `.mp4` 等）
  - アーカイブ・バイナリ（`.zip`, `.tar`, `.bin`, `.dat` およびその他あらゆる独自形式）
- **動作**:
  - 自動判別により「生データ自己解凍コンテナ」としてパッケージ化されます。
  - プレビュー用の余計な外部スクリプト（.js/.css）は一切ダウンロード・内包されません。
  - ブラウザでダブルクリック起動すると、ファイル名・ファイルサイズが表示され、「**💾 元ファイルを復元・保存**」ボタンから元のバイナリファイルを100%欠損なく復元・ダウンロードできます。

> 💡 **プレビューの拡張（カスタムビューア）**  
> 設定UIで `自作 viewer.js の定義` を選択することで、外部ライブラリを組み込み、上記以外の形式（例: SheetJSによる `.xlsx` プレビュー、vtk.jsによる `.vtu` プレビュー等）もブラウザ上で直接可視化できるように拡張可能です。

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
- 🧪 **ブラウザ内ライブプレビュー・シミュレーション**
  - 生成されたHTMLコンテナをダウンロードする前に、同一ブラウザ内の iframe サンドボックスで自己展開・プレビュー実行をシミュレーション確認できます。
- 🛠️ **ユーザー独自のカスタムビューア（`viewer.js`）対応**
  - ブラウザ内コードエディタまたはファイル読み込みにより、自作のレンダリングスクリプトを自由に組み込み可能。

---

## 🏗️ 全体アーキテクチャ

```text
[ ユーザーデータファイル (.vrm / .stl / 任意ファイル) ]
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
