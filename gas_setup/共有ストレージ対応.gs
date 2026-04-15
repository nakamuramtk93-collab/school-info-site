// Google Apps Script - 共有ストレージ + メール通知
// このスクリプトで既存のコードを上書きし、「新しいデプロイ」を行ってください

function doGet(e) {
  var props = PropertiesService.getScriptProperties();
  var action = e.parameter.action || 'loadAll';

  if (action === 'loadAll') {
    return jsonResponse(props.getProperties());
  } else if (action === 'save') {
    props.setProperty(e.parameter.key, e.parameter.value);
    return jsonResponse({ status: 'ok' });
  } else if (action === 'delete') {
    props.deleteProperty(e.parameter.key);
    return jsonResponse({ status: 'ok' });
  } else if (action === 'email') {
    sendNotification(e.parameter);
    props.setProperty(e.parameter.key, '1');
    return jsonResponse({ status: 'ok' });
  } else if (action === 'todoEmail') {
    sendTodoNotification(e.parameter);
    return jsonResponse({ status: 'ok' });
  }
  return jsonResponse({ status: 'ok' });
}

function doPost(e) {
  try {
    var data = JSON.parse(e.postData.contents);
    var props = PropertiesService.getScriptProperties();

    if (data.action === 'saveBulk') {
      props.setProperties(data.items);
      return jsonResponse({ status: 'ok' });
    }
    return jsonResponse({ status: 'ok' });
  } catch (err) {
    return jsonResponse({ status: 'error', message: err.toString() });
  }
}

function sendNotification(p) {
  var subject, body;
  if (p.direction === '行き') {
    subject = '【学童】杏ちゃん送り完了';
    body = p.datetime + '、' + p.location + 'に杏ちゃんを送り届けました。';
  } else {
    subject = '【学童】杏ちゃんお迎え完了';
    body = p.datetime + '、' + p.location + 'に杏ちゃんをお迎えしました。';
  }
  MailApp.sendEmail({
    to: 'nakamuramtk93@gmail.com,mixxxho@gmail.com',
    subject: subject,
    body: body,
  });
}

function sendTodoNotification(p) {
  var subject = '【To Do】新しいタスクが追加されました';
  var body = p.addedBy + 'さんが新しいTo Doを追加しました。\n\n'
    + '■ タスク内容：' + p.todoText + '\n'
    + '■ 追加日時：' + p.datetime + '\n'
    + '■ 追加者：' + p.addedBy;
  MailApp.sendEmail({
    to: 'nakamuramtk93@gmail.com,mixxxho@gmail.com',
    subject: subject,
    body: body,
  });
}

function jsonResponse(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(
    ContentService.MimeType.JSON
  );
}
