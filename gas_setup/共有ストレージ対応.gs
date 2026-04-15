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
    + (p.deadline ? '■ 期限：' + formatDateJP(p.deadline) + '\n' : '')
    + '■ 追加日時：' + p.datetime + '\n'
    + '■ 追加者：' + p.addedBy;
  MailApp.sendEmail({
    to: 'nakamuramtk93@gmail.com,mixxxho@gmail.com',
    subject: subject,
    body: body,
  });
}

// 日付を日本語形式にフォーマット (2026-04-20 → 4月20日)
function formatDateJP(dateStr) {
  var parts = dateStr.split('-');
  return parseInt(parts[1]) + '月' + parseInt(parts[2]) + '日';
}

// 毎朝7:00にリマインド通知（前日・当日のTo Doを通知）
// GASのトリガーで毎日7:00に実行するよう設定してください
function checkTodoReminders() {
  var props = PropertiesService.getScriptProperties();
  var todosJson = props.getProperty('sako_todos');
  if (!todosJson) return;

  var todos = JSON.parse(todosJson);
  var today = new Date();
  var todayStr = Utilities.formatDate(today, 'Asia/Tokyo', 'yyyy-MM-dd');
  var tomorrow = new Date(today.getTime() + 24 * 60 * 60 * 1000);
  var tomorrowStr = Utilities.formatDate(tomorrow, 'Asia/Tokyo', 'yyyy-MM-dd');

  var todayTasks = [];
  var tomorrowTasks = [];

  for (var i = 0; i < todos.length; i++) {
    var t = todos[i];
    if (t.done || !t.deadline) continue;
    if (t.deadline === todayStr) {
      todayTasks.push(t);
    } else if (t.deadline === tomorrowStr) {
      tomorrowTasks.push(t);
    }
  }

  if (todayTasks.length === 0 && tomorrowTasks.length === 0) return;

  var subject = '【To Do リマインド】期限が近いタスクがあります';
  var body = '';

  if (todayTasks.length > 0) {
    body += '＜本日が期限のタスク＞\n';
    for (var j = 0; j < todayTasks.length; j++) {
      body += '  ・' + todayTasks[j].text + '（追加者：' + (todayTasks[j].addedBy || '不明') + '）\n';
    }
    body += '\n';
  }

  if (tomorrowTasks.length > 0) {
    body += '＜明日が期限のタスク＞\n';
    for (var k = 0; k < tomorrowTasks.length; k++) {
      body += '  ・' + tomorrowTasks[k].text + '（追加者：' + (tomorrowTasks[k].addedBy || '不明') + '）\n';
    }
  }

  MailApp.sendEmail({
    to: 'nakamuramtk93@gmail.com,mixxxho@gmail.com',
    subject: subject,
    body: body,
  });
}

// トリガー自動設定（1回だけ実行してください）
function setupDailyTrigger() {
  // 既存のcheckTodoRemindersトリガーを削除
  var triggers = ScriptApp.getProjectTriggers();
  for (var i = 0; i < triggers.length; i++) {
    if (triggers[i].getHandlerFunction() === 'checkTodoReminders') {
      ScriptApp.deleteTrigger(triggers[i]);
    }
  }
  // 毎日AM7:00に実行するトリガーを作成
  ScriptApp.newTrigger('checkTodoReminders')
    .timeBased()
    .everyDays(1)
    .atHour(7)
    .nearMinute(0)
    .inTimezone('Asia/Tokyo')
    .create();
}

function jsonResponse(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(
    ContentService.MimeType.JSON
  );
}
