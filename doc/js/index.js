//オブジェクト宣言
var obj = {
    db: null,
    regexp: obj
};

/* ************************************* *
 *                                       *
 * 初期化のメソッド定義                     *
 *                                       *
 * ************************************* */
obj.init = function() {
    //indexedDBを開く
    var idbReq = indexedDB.open("easyBookmark", 1);
    //初期化(DBの新規作成時、またはバージョン変更時に実行)
    idbReq.onupgradeneeded = function(event) {
        var db = event.target.result;
        event.target.transaction.onerror = function(event) {
            showError("DBの初期化に失敗しました");
        }
        //バージョン変更時はデータスキーマを変更する可能性が高いので、既に存在しているのであればいったん削除して改めて作り直す
        if (db.objectStoreNames.contains("bookmark")) {
            db.deleteObjectStore("bookmark");
        }
        //オブジェクトストアを作成(新規、もしくはバージョン変更時)
        var sizeStore = db.createObjectStore("bookmark", {
            keyPath: "bookmark_id",
            autoIncrement: true
        }); //オートインクリメントする
    }

    //DB読み込み
    idbReq.onerror = function(event) {
        showError("DBの読み込みに失敗しました");
    }
    idbReq.onsuccess = function(event) {
        obj.db = (event.target) ? event.target.result : event.result; //取得
        obj.getAll(); //全件表示
    }
}

/* ************************************* *
 *                                       *
 * 取得メソッド定義                         *
 *                                       *
 * ************************************* */
//全件取得・表示のメソッド
obj.getAll = function() {
    var bookmarkList = $("#bookmarkList");
    bookmarkListEmpty(); //一旦リストを全削除
    var db = obj.db;
    var readTx = db.transaction(["bookmark"], "readonly");
    var bookmarkStore = readTx.objectStore("bookmark");
    //keyPathに対して検索をかける範囲を取得
    var range = IDBKeyRange.lowerBound(0);
    //その範囲を走査するカーソルリクエストを生成
    var cursorRequest = bookmarkStore.openCursor(range);
    //カーソルリクエストが成功した場合
    cursorRequest.onsuccess = function(event) {
        var result = event.target.result;
        //走査すべきObjectがこれ以上無い場合 result == null となる
        if (!!result == false) return;
        //処理
        bookmarkListRender(result.value);
        //カーソルを一個ずらす
        result.continue();
    }
    //カーソルリクエストが失敗した場合
    cursorRequest.onerror =  function(event) {
        return showError("ブックマークの読み込みに失敗しました");
    }
}
//検索で絞り込んで取得のメソッド
obj.getBookmark = function() {
    var searchKeyword = $("#search").val();
    var searchCat = $("input[name=\"searchCat\"]:checked").val();
    var bookmarkList = $("#bookmarkList");
    bookmarkListEmpty(); //一旦リストを全削除
    var db = obj.db;
    var readTx = db.transaction(["bookmark"], "readonly");
    var bookmarkStore = readTx.objectStore("bookmark");
    //keyPathに対して検索をかける範囲を取得
    var range = IDBKeyRange.lowerBound(0);
    //その範囲を走査するカーソルリクエストを生成
    var cursorRequest = bookmarkStore.openCursor(range);
    //カーソルリクエストが成功した場合
    cursorRequest.onsuccess = function(event) {
        var cursor = event.target.result;
        if(cursor) {
            obj.regexp = new RegExp(searchKeyword, "i");
            if(searchCat === "all") {
                //サイト名、URL、カテゴリのどれでも良いので検索ワードと部分一致しているものがあれば表示
                if (obj.regexp.test(cursor.value.url) || obj.regexp.test(cursor.value.name) || obj.regexp.test(cursor.value.category)) {
                    bookmarkListRender(cursor.value);
                }
            }
            else {
                //ラジオボタンで選んだ項目の中で、検索ワードと部分一致しているものがあれば表示
                if (obj.regexp.test(cursor.value[searchCat])) {
                    bookmarkListRender(cursor.value);
                }
            }
            //カーソルを一個ずらす
            cursor.continue();
        }
        else { //走査すべきcursorオブジェクトがなくなった場合 result == null
            if(bookmarkList.has("a").length === 0) { //bookmarkListがaタグを子要素として持っていなければ
                bookmarkListNotfound();
            }
        }
    }
    //カーソルリクエストが失敗した場合
    cursorRequest.onerror =  function(event) {
        return showError("検索中にエラーが発生しました");
    }
}
/* ************************************* *
 *                                       *
 * データセットのメソッド定義                *
 *                                       *
 * ************************************* */
//ブックマークデータをセット(prmArray["url", "name", "category", "createTime"])
obj.setBookmark = function(prmArray) {
    var db = obj.db;
    //ブックマークは読み書き権限付きで使用することを宣言
    var rwTx = db.transaction(["bookmark"], "readwrite");
    //オブジェクトストアの取り出し
    var bookmarkStore = rwTx.objectStore("bookmark");
    //ブックマークオブジェクトストアに書き込むリクエストを生成
    var putReq = bookmarkStore.put({
        url: prmArray["url"],
        name: prmArray["name"],
        category: prmArray["category"],
        createTime: prmArray["createTime"]
    });
    //putリクエスト」が成功した場合
    rwTx.oncomplete = function(event) {
        obj.getAll(); //リストを再描画
        return true;
    };
    //putリクエストが失敗した場合
    rwTx.onerror = function(event) {
        return showError("DBへの書き込みに失敗しました"); //false
    };
}

/* ************************************* *
 *                                       *
 * 削除メソッド定義                         *
 *                                       *
 * ************************************* */
//全削除
obj.delAll = function(event) {
    var bookmarkList = $("#bookmarkList");
    var db = obj.db;
    //sizeは読み書き権限付きで使用することを宣言
    var rwTx = db.transaction(["bookmark"], "readwrite");
    //オブジェクトストアの取り出し
    var bookmarkStore = rwTx.objectStore("bookmark");
    //全データ削除
    var delReq = bookmarkStore.clear();
    //全削除成功
    delReq.onsuccess = function(event) {
        bookmarkList.empty(); //子要素を削除
        return true;
    };
    //全削除失敗
    delReq.onerror = function(event) {
        return showError("ブックマーク削除中にエラーが発生しました"); //false
    };
}

/* ************************************* *
 *                                       *
 * コントローラ処理                         *
 *                                       *
 * ************************************* */
//ブックマークの一覧を表示
function bookmarkListRender(dataRow) {
    var bookmarkList = $("#bookmarkList");
    var a = $("<a/>").addClass("list-group-item").attr("href", dataRow.url).attr("target", "_blank");
    $("<h4/>").addClass("list-group-item-heading").text(dataRow.name).appendTo(a);
	$("<p/>").addClass("list-group-item-text").text(dataRow.createTime).appendTo(a);
    $("<span/>").addClass("label label-info").text(dataRow.category).appendTo(a);
	bookmarkList.append(a);
}
//ブックマーク検索結果0件の場合
function bookmarkListNotfound() {
    var bookmarkList = $("#bookmarkList");
    var i = $("<i/>").addClass("fa fa-fw fa-info-circle").attr("aria-hidden", "true");
    var p = $("<p/>").addClass("text-info").text("検索条件に一致するブックマークはありませんでした").prepend(i);
    bookmarkList.append(p);
}
//ブックマークの一覧を全削除
function bookmarkListEmpty() {
    var bookmarkList = $("#bookmarkList");
    bookmarkList.empty();
}
//エラー表示
function showError(errMsg) {
    var msg = $("#errMsg");
    msg.text(""); //一旦空っぽにしてから
    msg.text(errMsg); //テキスト挿入
    $("#modal").modal();
    return false;
}

/* ************************************* *
 *                                       *
 * 時刻取得                                *
 *                                       *
 * ************************************* */
//時刻を取得
function getTime() {
    var date = new Date(); 

    //年・月・日を取得する
    var year = date.getFullYear();
    var month = zeroPadding(date.getMonth() + 1);
    var day = zeroPadding(date.getDate());
    //時・分・秒を取得する
    var hour = zeroPadding(date.getHours());
    var minute = zeroPadding(date.getMinutes());
    var second = zeroPadding(date.getSeconds());

    //"yyyy-MM-dd hh:ii:ss"の形式に整形して返す
    var str = year + "-" + month + "-" + day + " " + hour + ":" + minute + ":" + second;
    return str;
}
//頭に0を追加
function zeroPadding(str) {
    if (str < 10) {
        str = "0" + str;
    }
    return str;
}

/* ************************************* *
 *                                       *
 * 処理実行ロジック                         *
 *                                       *
 * ************************************* */
//登録
function registering() {
    var url = $("#url").val();
    var name = $("#name").val();
    var category = $("#category").val();
    if(!url || url.length <= 0) {
        showError("URLが入力されていません");
        return false;
    }
    else if(!name || name.length <= 0) {
        showError("サイト名が入力されていません");
        return false;
    }
    else {
        var prmArray = {
            url: url,
            name: name,
            category: category,
            createTime: getTime()
        };
        obj.setBookmark(prmArray); //書き込み処理
        return true;
    }
}
//検索
function search() {
    var searchKeyword = $("#search").val();
    var searchCat = $("input[name=\"searchCat\"]:checked").val();
    if(!searchKeyword || searchKeyword.length <= 0) {
        showError("キーワードが入力されていません");
        return false;
    }
    else if(!searchCat || searchCat.length <= 0) {
        showError("絞り込みが選択されていません");
        return false;
    }
    else {
        obj.getBookmark(); //検索
        return true;
    }
}

/* ************************************* *
 *                                       *
 * その他                                 *
 *                                       *
 * ************************************* */
//ページトップへ戻る
function pageTop() {
    var returnPageTop = $(".returnPageTop");

	var startPos = 0;
	$(window).on("scroll", function(){
        //スクロール距離が400pxより大きければページトップへ戻るボタンを表示
		var currentPos = $(this).scrollTop();
		if (currentPos > 400) {
			returnPageTop.fadeIn();
		} else {
			returnPageTop.fadeOut();
		}
	});

	//ページトップへスクロールして戻る
	returnPageTop.on("click", function () {
		$("body, html").animate({ scrollTop: 0 }, 1000, "easeInOutCirc");
		return false;
	});
}
//ある関数funcの後にdoneを実行する
function callAfter(func, done) {
  return function () {
    var returnValue = func.apply(func, [].slice.call(arguments));
    done();
    return returnValue;
  };
}
/* ************************************* *
 *                                       *
 * メイン処理                              *
 *                                       *
 * ************************************* */
$(function() {
    //ページトップへ戻る
    pageTop();

    //初期化
    obj.init();

    var registerB = $("#registerButton"); //登録
    var searchB = $("#searchButton"); //検索
    var allB = $("#allButton"); //全表示
    var allDelB = $("#allDelButton"); //全削除
    var delConB = $("#delConButton"); //全削除(確認)

    //登録ボタンをクリックしたとき
    registerB.on("click", function() {
        registering();
    });
    //検索ボタンをクリックしたとき
    searchB.on("click", function() {
        search();
    });
    //検索解除ボタンをクリックしたとき
    allB.on("click", function() {
        obj.getAll(); //全件表示
    });
    //全削除ボタンをクリックしたとき
    allDelB.on("click", function() {
        $("#modalConfirm").modal();
    });
    //全削除ボタン(確認)をクリックしたとき
    delConB.on("click", function() {
        obj.delAll();
    });
});