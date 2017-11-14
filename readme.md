# 記憶のしおり

簡単なWebブックマークアプリです(IndexedDBテスト)。

## 仕様

- 登録
    - URL、サイト名、カテゴリを入力して「登録」ボタンをクリックするとサイトが登録されます。
- 検索
    - キーワードで検索できます
    - 以下の条件で絞り込みができます
        - 全て: URL、サイト名、カテゴリの全て
        - サイト名: サイト名のみ
        - カテゴリ: カテゴリのみ
- 一覧
    - 登録したサイトを一覧表示します
    - 削除は全削除のみです(テストなので……)

## 使い方

ある程度ローカル(`file://`で開く)でも動作するようにしています。

### Windows

1. zipをダウンロード
2. 適当な場所に解凍します
    - `dist`の中身が本体です
3. ブラウザで`index.html`を開きます(ローカルで構いません)
    - ※動作環境については下記を参照
4. 使用します
5. 終了時はブラウザもしくはタブを閉じてください

### Mac

1. zipをダウンロード
2. 適当な場所に解凍します
    - `dist`の中身が本体です
3. `.command`ファイルを実行します
    - Pythonのバージョンが2.x系ならば`kioku2.command`を実行
    - Pythonのバージョンが3.x系ならば`kioku3.command`を実行
    - ※Pythonの`SimpleHTTPServer`が起動し、そのWebサーバ上で動作します
4. 使用します
5. 終了時はブラウザもしくはタブを閉じてください
    - コマンドラインでPythonが実行されたままになるので、コマンドラインも×で閉じてください

## 動作環境(想定)

### Windows

- Firefox
- Chrome

で動作します(IEは×。Edgeは不明)。

### Mac

- Safari

※ただしコマンドラインが起動し、Pythonを使用します。

## 検証環境

WindowsのChromeで検証しています

## 免責

ご使用は自己責任でお願いします。本アプリを使用したことによるトラブル・損失・損害について一切の責任は負えないことをご了承ください。

## 参考

### IndexedDB

- [たぶん世界一簡単なIndexedDBのサンプル \- DRYな備忘録](http://otiai10.hatenablog.com/entry/2015/01/30/020858)
- [IndexedDBの（少し詳しい）サンプルコード \- Qiita](https://qiita.com/lamrongol/items/55ce60576af2aa665f5a)
- [IndexedDBの使い方 \- Qiita](https://qiita.com/butakoma/items/2c1c956b63fcf956a137)
- [【HTML5】Indexed Database API を真面目に勉強してみる ｜ Developers\.IO](https://dev.classmethod.jp/ria/html5/html5-indexed-database-api/)
- [indexedDB \- ねとめもー](http://nmm.blog.jp/archives/48208772.html)
- [TypeScriptでIndexedDBの登録・更新・削除・検索をする \| Black Everyday Company](https://kuroeveryday.blogspot.jp/2015/03/indexedDBforTypeScript.html)
- [IndexedDB を試す – アカベコマイリ](http://akabeko.me/blog/2015/02/indexeddb/)

### コールバック

- [JavaScriptコールバックを整理してみた【再入門】 \- Qiita](https://qiita.com/nekoneko-wanwan/items/f6979f687246ba089a35)
- [JavaScript中級者への道【5\. コールバック関数】 \- Qiita](https://qiita.com/matsuby/items/3f635943f25e520b7c20)

### MacOS

- [Macでローカルサーバー構築あれこれ \- Qiita](https://qiita.com/YuukiWatanabe/items/f89fe047ace61d2d2b45)
- [Macで簡易ローカルサーバーをたてる \- Qiita](https://qiita.com/0084ken/items/27ffb19fcc4d81d6bbbb)
- [Python 3ではSimpleHTTPServerではなくhttp\.serverを使う \- tacamy\.blog](http://tacamy.hatenablog.com/entry/2017/01/04/155137)
