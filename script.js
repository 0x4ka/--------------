let myUserId = null;
const apiEndpoint = 'https://script.google.com/macros/s/AKfycbzaGmELTSP_A4rbFEGGPWUdBBzQfp61qnPWWJbnthzptcUKDO9nqHztk_nf89zJP8lWwg/exec';
let lastMessageId = null; // 最後に読み込んだメッセージのID
let params = new URLSearchParams(window.location.search);;
let roomId = params.get('roomId');
document.title = roomId;

document.getElementById('setUserIdBtn').addEventListener('click', function() {
    let userIdInput = document.getElementById('userIdInput');
    myUserId = userIdInput.value;
    if (!myUserId) {
        alert('ユーザーIDを入力してください。');
        return;
    }
    document.title = roomId + "と" + userId;
    userIdInput.disabled = true; // IDが設定されたら入力を無効化
    loadMessages();
});

document.getElementById('messageForm').addEventListener('submit', function(e) {
    e.preventDefault();
    let messageInput = document.getElementById('messageInput');
    let message = messageInput.value;
    if (message) {
        sendMessage({ userId: myUserId, message, roomId });
        messageInput.value = '';
    }
});

function sendMessage(data) {
    const url = `${apiEndpoint}?type=postMessage&userId=${encodeURIComponent(data.userId)}&message=${encodeURIComponent(data.message)}&roomId=${encodeURIComponent(data.roomId)}`;
    fetch(url)
        .then(response => response.json())
        .then(messageData => {
            addMessage(messageData, true);
            lastMessageId = messageData.messageId; // 最後のメッセージIDを更新
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
    const url = `${apiEndpoint}?type=getMessages&lastId=${lastMessageId}&roomId=${roomId}`;
    fetch(url)
        .then(response => response.json())
        .then(messages => {
            if (messages.length === 0) {
                showNoNewMessages();
            } else {
                messages.forEach(messageData => {
                    addMessage(messageData, messageData.userId === myUserId);
                    lastMessageId = messageData.messageId;
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

//window.onload = loadMessages;
