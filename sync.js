// 共有ストレージ同期（Google Apps Script経由）
const GAS_URL = 'https://script.google.com/macros/s/AKfycbxIsNBqwNjYhR5SkX0DbvM8iac6r3l_y8ogxU4hYaJBMXA8wAiR9E77jLv1aSIolvRHFg/exec';

// 全データを読み込み
async function syncLoad() {
  try {
    const res = await fetch(GAS_URL + '?action=loadAll');
    const data = await res.json();
    return data;
  } catch {
    return null;
  }
}

// キー1つを保存
function syncSave(key, value) {
  const url = GAS_URL + '?action=save&key=' + encodeURIComponent(key) + '&value=' + encodeURIComponent(value);
  fetch(url).catch(() => {});
  localStorage.setItem(key, value);
}

// キー1つを削除
function syncDelete(key) {
  const url = GAS_URL + '?action=delete&key=' + encodeURIComponent(key);
  fetch(url).catch(() => {});
  localStorage.removeItem(key);
}

// 学童メール通知を送信
function syncEmail(location, direction, datetime, key) {
  const url = GAS_URL + '?action=email'
    + '&location=' + encodeURIComponent(location)
    + '&direction=' + encodeURIComponent(direction)
    + '&datetime=' + encodeURIComponent(datetime)
    + '&key=' + encodeURIComponent(key);
  fetch(url).catch(() => {});
}

// To Do追加メール通知を送信
function syncTodoEmail(todoText, addedBy, datetime, deadline) {
  const url = GAS_URL + '?action=todoEmail'
    + '&todoText=' + encodeURIComponent(todoText)
    + '&addedBy=' + encodeURIComponent(addedBy)
    + '&datetime=' + encodeURIComponent(datetime)
    + '&deadline=' + encodeURIComponent(deadline || '');
  fetch(url).catch(() => {});
}

// チェックボックスを共有データで初期化
function syncCheckboxes() {
  syncLoad().then(data => {
    if (!data) return;
    document.querySelectorAll('.checklist input[type="checkbox"], .check-row input[type="checkbox"]').forEach(cb => {
      if (data[cb.id] !== undefined) {
        cb.checked = data[cb.id] === '1';
        localStorage.setItem(cb.id, data[cb.id]);
      } else {
        cb.checked = localStorage.getItem(cb.id) === '1';
      }
    });
  });
}
