// Google Apps Script - 学童チェック通知メール送信
// このスクリプトをGoogle Apps Scriptにコピーして「ウェブアプリ」としてデプロイしてください

function doPost(e) {
  try {
    var data = JSON.parse(e.postData.contents);

    var location = data.location; // "佐古小学童" or "トモデココ"
    var direction = data.direction; // "行き" or "帰り"
    var datetime = data.datetime; // "2026年4月10日(木) 15時30分"

    var subject, body;

    if (direction === "行き") {
      subject = "【学童】杏ちゃん送り完了";
      body = datetime + "、" + location + "に杏ちゃんを送り届けました。";
    } else {
      subject = "【学童】杏ちゃんお迎え完了";
      body = datetime + "、" + location + "に杏ちゃんをお迎えしました。";
    }

    var recipients = "nakamuramtk93@gmail.com,mixxxho@gmail.com";

    MailApp.sendEmail({
      to: recipients,
      subject: subject,
      body: body
    });

    return ContentService
      .createTextOutput(JSON.stringify({ status: "ok" }))
      .setMimeType(ContentService.MimeType.JSON);

  } catch (error) {
    return ContentService
      .createTextOutput(JSON.stringify({ status: "error", message: error.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

// テスト用
function testSend() {
  var e = {
    postData: {
      contents: JSON.stringify({
        location: "佐古小学童",
        direction: "行き",
        datetime: "2026年4月10日(木) 15時30分"
      })
    }
  };
  var result = doPost(e);
  Logger.log(result.getContent());
}
