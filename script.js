let myUserId = 'user_' + Math.random().toString(36).substr(2, 9); // このユーザーの一意なID
const apiEndpoint = 'https://script.google.com/macros/s/AKfycbwbsDxzmCW3M3J2p-IYWbydxoDrUgmpYOeOmFGrluosoVp3O5B_Dl2QkT1f9smXtFN6Kw/exec';
let lastMessageId = null; // 最後に読み込んだメッセージのID

/*
document.getElementById('setUserIdBtn').addEventListener('click', function() {
    let userIdInput = document.getElementById('userIdInput');
    myUserId = userIdInput.value;
    if (!myUserId) {
        alert('ユーザーIDを入力してください。');
        return;
    }
    userIdInput.disabled = true; // IDが設定されたら入力を無効化
});*/

document.getElementById('messageForm').addEventListener('submit', function(e) {
    e.preventDefault();
    let messageInput = document.getElementById('messageInput');
    let message = messageInput.value;
    if (message) {
        sendMessage({ userId: myUserId, message });
        messageInput.value = '';
    }
});

function sendMessage(data) {
    const url = `${apiEndpoint}?type=postMessage&userId=${encodeURIComponent(data.userId)}&message=${encodeURIComponent(data.message)}`;
    fetch(url)
        .then(response => response.json())
        .then(messageData => {
            addMessage(messageData, true);
            lastMessageId = messageData.id; // 最後のメッセージIDを更新
        });
}

function addMessage(messageData, isMyMessage) {
    let container = document.createElement('div');
    container.className = 'message-container ' + (isMyMessage ? 'sent' : 'received');

    let messageBubble = document.createElement('div');
    messageBubble.textContent = messageData.message;
    messageBubble.className = 'message-bubble';

    let timestamp = document.createElement('div');
    timestamp.textContent = formatTimestamp(messageData.timestamp);
    timestamp.className = 'message-timestamp';

    container.appendChild(messageBubble);
    container.appendChild(timestamp);

    document.getElementById('messages').appendChild(container);
}

function formatTimestamp(timestamp) {
    let date = new Date(timestamp);
    return date.getHours() + ':' + date.getMinutes().toString().padStart(2, '0');
}

function loadMessages() {
    const url = `${apiEndpoint}?type=getMessages&lastId=${lastMessageId}`;
    console.log(url);
    fetch(url)
        .then(response => response.json())
        .then(messages => {
            if (messages.length === 0) {
                showNoNewMessages();
            } else {
                messages.forEach(messageData => {
                    addMessage(messageData, messageData.userId === myUserId);
                    lastMessageId = messageData.id;
                });
            }
        });
}

function showNoNewMessages() {
    let li = document.createElement('li');
    li.textContent = "最新のメッセージはありません";
    li.className = 'no-new-messages';
    document.getElementById('messages').appendChild(li);
}

document.getElementById('loadMessagesBtn').addEventListener('click', function() {
    loadMessages();
});

window.onload = loadMessages;
