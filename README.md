# NLPDate

[![Circle CI](https://circleci.com/gh/ShotaOki/NLPDate.svg?style=svg)](CIRCLECI)
[![Maintainability](https://api.codeclimate.com/v1/badges/37f152e8e132e9c2bb9f/maintainability)](https://codeclimate.com/github/ShotaOki/NLPDate/maintainability)
[![Test Coverage](https://api.codeclimate.com/v1/badges/37f152e8e132e9c2bb9f/test_coverage)](https://codeclimate.com/github/ShotaOki/NLPDate/test_coverage)

A JavaScript date library for Parse, manipulate, and formatting. Users can write it using Natural Language.

# コンセプト

- 自然に話す言葉（Natural Language）で日時を操作できる
- メソッドは 3 つだけ。簡単で、覚えやすく、読みやすい
- 軽量で、ライブラリが外部と通信しない

## できること

- 日本語や記号で書かれた日時文字列を AI で解析して、思い通りの日時を作ること
- 「3 時間後」「月末」「次の火曜日」のような相対表現で日時を操作すること
- 和暦やエポック秒を含む好きなフォーマットの変換
- タイムゾーンの操作

# 使い方

## 導入

以下のテキストを HTML のヘッダに置いてください<br />

```html
<script src="https://cdn.jsdelivr.net/gh/ShotaOki/NLPDate@v0.0.1/modern/nlpdate-main.min.js"></script>
```

※もし IE11 で動かす必要があれば、上のリンクの代わりにこちらを置いてください。

```html
<!-- ES2015版：新しいブラウザのほか、IE11でも動きます。通常版よりもファイルサイズが大きくなります -->
<script src="https://cdn.jsdelivr.net/gh/ShotaOki/NLPDate@v0.0.1/es2015/nlpdate-main.min.js"></script>
```

## 基本的な使い方

NLPDate 関数 + 変換メソッドで使います。

```javascript
// NLPDate 関数：日時を作成します。
let date_object = NLPDate("2020年11月23日の今頃");

// 変換メソッドで、ほしい形式（文字列）で取得します。
let text = date_object.asString("日本語の年月日時分秒");

// 出力結果：2020年11月23日 13時47分12秒
console.log(text);
```

もちろん、そのままつなげて書くこともできます。

```javascript
// textの内容：2020年11月23日 13時47分12秒
let text = NLPDate("2020年11月23日の今頃").asString("日本語の年月日時分秒");
```

日時以外が入っていても、日時を抜き出して解析します。

```javascript
// textの内容：2021年01月12日
let text = NLPDate(
  "ふるさと納税　ワンストップ特例申請に関する申請期限（令和３年１月１２日）を掲載しました。"
).asString("日本語の年月日");
```

変換できる文章の例は、<a href = "https://shotaoki.github.io/NLPDate.github.io/index.html">こちらのドキュメント</a>でご確認ください。

## 変換メソッド

変換メソッドは、asString を含めて 3 つあります。

| メソッド | 正常時<br />戻り値 | エラー時<br />戻り値         | 引数               | 出力内容                       |
| -------- | ------------------ | ---------------------------- | ------------------ | ------------------------------ |
| asString | string 型          | undefined                    | フォーマット文字列 | 日時を文字列として出力します   |
| asNumber | number 型          | number<br />(エポックミリ秒) | asString に同じ    | 日時を数値として出力します     |
| asDate   | Date 型            | undefined                    | なし               | 日時を Date 型として出力します |

### asString

文字列型になります。引数に書いた形式で、日時文字列が取得できます。

```javascript
// textの内容：令和2年11月24日 火曜日
let text = NLPDate("明日").asString("和暦の年月日と曜日");
```

引数を省略すると ISO8601 形式になります。

```javascript
// textの内容：2020/11/23T13:47:12+09:00
let text = NLPDate("現在").asString();
```

文字列の頭と末尾を大かっこでくくると、YYYY のような形式で指定できます。

```javascript
// textの内容：2020_11_23
let text = NLPDate("現在").asString("[YYYY_MM_dd]");
```

### asDate

javascript 標準の Date 型になります。ほかのライブラリとの連携ができます。

```javascript
// Date型のオブジェクト
let date = NLPDate("今日").asDate();
```

### asNumber

数値になります。数値と比較ができます。

```javascript
// 年を取得して比較する
if (NLPDate("今日").asNumber("年") < 2019) {
  console.log("今日は2019年よりも前だ");
} else {
  console.log("今日は2019年以降だ");
}
```

## 日時の解析

作りたい日時をそのまま日本語で書けば、思い通りの日時を取得できます。

```javascript
// textの内容：2020/11/26 14:22:00
let text = NLPDate("しあさっての14時22分").asString(
  "スラッシュ区切りの年月日時分秒"
);
```

月末、年末、次の第二水曜日のような表現でも、思い通りの日時になります

```javascript
// textの内容：2020/10/21 15:00:00
let text = NLPDate("2020年10月の第三水曜日の午後3時").asString(
  "スラッシュ区切りの年月日時分秒"
);
```

「6 分後」のような相対表現もできます

```javascript
// textの内容：2020/11/26 14:28:00
let text = NLPDate("しあさっての14時22分の6分後").asString(
  "スラッシュ区切りの年月日時分秒"
);
```

操作は前から順に反映されます

```javascript
// textの内容：2021/03/31 15:22:12
let text = NLPDate(
  "明日の三か月後の3日後の６日後の19時、やっぱりそうじゃなくて午後3時の22分12秒の月末"
).asString("スラッシュ区切りの年月日時分秒");
```

先頭にエポック秒や記号の日時を書いて、そこから操作することもできます

```javascript
// textの内容：2020-10-23 21:54:00
let text = NLPDate("1606136040の一か月前").asString(
  "ハイフン区切りの年月日時分秒"
);
```

### あいまいな表現

うろ覚えでも一番それに近いものに解析されます。

```javascript
// ISO8601ではなく、間違ってINO8001になっている
// -> ISO8601として解析される
// textの内容：2020-10-23T21:54:00+09:00
let text = NLPDate("1606136040の一か月前").asString("INO8001");
```

解析できるトークンだけが反映されます

```javascript
// 余分なテキストが入っており、アイエスオーも間違えている
// -> 余分なテキストは無視、間違いは補正され、ISO8601として解析される
// textの内容：2020-11-22T02:02:00+09:00
let text = NLPDate("予定は午前2時の2分後のつもり").asString(
  "よくわからんけどアイエヌオーみたいなやつ"
);
```

## パラメータ

タイムゾーンは NLPDate の引数で指定します <br />
※何も指定しない場合の初期値は Asia/Tokyo です。

```javascript
// タイムゾーンを指定する（タイムゾーンの例：Asia/Tokyoなど）
const UTC = {
  time_zone: "UTC",
};

// textの内容：2020/11/19T05:40:29+00:00
let text = NLPDate("現在", UTC).asString();
```

mode を指定することで、変換タイミングを変えることができます<br />
※何も指定しない場合の初期値は static です

static は変数を確保した時点で日時が決まるため、以下のような書き方で便利です。

```javascript
const date = NLPDate("今日", { mode: "static" });

// 変換メソッドを複数回呼んだあと、足し算で繋ぐ
// textの内容：2020_11
let formatted = date.asString("数字の年") + "_" + date.asString("数字の月");
```

dynamic は実行時に日時が決まるため、以下のような書き方で便利です。

```javascript
// 現在日時をオブジェクトで持っておく
const dynamic_date = NLPDate("現在", { mode: "dynamic" });

// ボタンをクリックするたびに、日時から違うファイル名を作る
// file_nameの内容：20201010121011.png
function on_click_button(event) {
  const format = "区切り文字なしの年月日時分秒";
  fetch("http://api.xxx.com", {
    method: "POST",
    body: JSON.stringify({
      file_name: dynamic_date.asString(format) + ".png",
      binary: data,
    }),
  });
}
```

## ヒント

### ブラウザ以外で使う方法の例

node がインストールされた環境であれば、bash や Windows のコマンドプロンプトでも使えます。

github のソースを Clone した後、取り込んだプロジェクトのルートにある bin までのパスを通してください。

例：MyName さんのデスクトップに、NLPDate のフォルダ名で clone した場合<br />
　　環境変数に登録する：C:\Users\MyName\Desktop\NLPDate\bin

```bash
# 以下のコマンドをコマンドプロンプトで入力：現在日時を和暦で出力します
nlp-date -f "和暦の年月日時分"
>> 令和3年01月10日 12時04分
```

```bash
# 以下のコマンドをコマンドプロンプトで入力：入力した日時を別のフォーマットに変換します
nlp-date "2020年4月1日" -f "和暦の年月日"
>> 令和2年4月1日
```

Node で使う場合は、たとえば次のように書いてください。

```javascript
const NLPDate = import(
  "${Cloneしたフォルダのルート}/modern/nlpdate-main.min.js"
);
```

### どうして NLPDate が関数になっているのか

もともと JQuery の日時版を作りたかったから

```javascript
// HTMLのscriptの頭で以下のように書けば、別名で再宣言できます
window.$_ = NLPDate;

// JQueryらしい書き方になります
let date_string = $_("今日の4日後").asString("年月日");
```

### ライブラリの仕組み

大まかな流れは以下の通りです

```bash
# 入力
"あさっての3年後の12時30分の44秒"

# ひらがなの名詞を置換する
"${KEY:A}の3年後の12時30分の44秒"

# 数字の前に区切り文字を入れる
-> "${KEY:A}の、3年後の、12時、30分の、44秒"

# ひらがなまたは区切り文字で文字列を切断する
-> "${KEY:A}" "3年後" "12時" "30分" "44秒"

# 置換した名詞を戻す
-> "あさって" "3年後" "12時" "30分" "44秒"
```

あいまい検索して、対応する関数を前から順に呼び出し、date を変換していきます。

```javascript
// 例：3年後であれば、
// { method: "${0}年後", argments: [ 3 ] }
// に分解して、"${0}年後"に対応した以下のような関数を割り当てる
(date, argments) => {
  // テキストからn年後のnを取り出す
  const n = argments[0];
  // 引数として受け取ったDateを操作、操作したDateを次の関数に渡す
  date.setFullYear(date.getFullYear() + n);
  return date;
};
```

あいまい検索はレーベンシュタイン距離が最小になるテキストを探して検索します。

処理の中に乱数はないため、同じ入力であれば同じ解析をします。

# その他

## 動作要件

### Modern 版

Chrome、Edge、Firefox で動作します。

### ES2015 版

Chrome、Edge、Firefox のほか、IE11 で動作します。

## ライセンス

MIT ライセンスです。

自由に利用（商用含む）、改変、再配布ができます。

利用によって生じた損害について、開発者は責任を持ちません。
