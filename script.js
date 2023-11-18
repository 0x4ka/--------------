let myUserId = 'user_' + Math.random().toString(36).substr(2, 9); // このユーザーの一意なID
const apiEndpoint = 'https://script.google.com/macros/s/AKfycbw3sh4riBGMBZ9GEkn_rj-XnbnwsBaRRFHqcQvzcGX0JVUuO8EKefhn6YgzGb9xxqaIWw/exec';
let lastMessageId = null; // 最後に読み込んだメッセージのID

window.addEventListener('pageshow', e=>{
    document.getElementById('setUserIdBtn').addEventListener('click', function() {
        let userIdInput = document.getElementById('userIdInput');
        myUserId = userIdInput.value;
        if (!myUserId) {
            alert('ユーザーIDを入力してください。');
            return;
        }
        userIdInput.disabled = true; // IDが設定されたら入力を無効化
    });
});

document.addEventListener('DOMContentLoaded', function () {
    const liffId = "2001729246-OyV02Q24";
    initializeLiff(liffId);
});

function initializeLiff(liffId) {
    // Promiseオブジェクトを使用する方法
    liff
        .init({
            liffId: liffId, // Use own liffId
        })
        .then(() => {
            // Start to use liff's api
            myUserId = liffId;
        })
        .catch((err) => {
            // Error happens during initialization
            console.log(err.code, err.message);
        });
}


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
