const apiEndpoint = 'https://script.google.com/macros/s/AKfycbzaGmELTSP_A4rbFEGGPWUdBBzQfp61qnPWWJbnthzptcUKDO9nqHztk_nf89zJP8lWwg/exec';
let lastMessageId = null; // 最後に読み込んだメッセージのID
let lastMessageDate = null;
let params = new URLSearchParams(window.location.search);
let roomId = params.get('roomId');
let userId = params.get('userId');
document.title = roomId + "ルームに" + userId;

/*
document.getElementById('setUserIdBtn').addEventListener('click', function() {
    let userIdInput = document.getElementById('userIdInput');
    userId = userIdInput.value;
    if (!userId) {
        alert('ユーザーIDを入力してください。');
        return;
    }
    document.title = roomId + "ルームに" + userId;
    userIdInput.disabled = true; // IDが設定されたら入力を無効化
    loadMessages();
});
*/

document.getElementById('messageForm').addEventListener('submit', function(e) {
    e.preventDefault();
    let messageInput = document.getElementById('messageInput');
    let message = messageInput.value;
    if (message) {
        sendMessage({ userId: userId, message, roomId });
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

    if(!isMyMessage){
        let userIdSpan = document.createElement('span');
        userIdSpan.textContent = messageData.userId;
        userIdSpan.className = 'message-user-id';
        container.appendChild(userIdSpan);
    }

    let bubbleContainer = document.createElement('div');
    bubbleContainer.className = 'bubble-container';

    let messageBubble = document.createElement('div');
    messageBubble.textContent = messageData.message;
    messageBubble.className = 'message-bubble';
    bubbleContainer.appendChild(messageBubble);

    const messageDate = new Date(messageData.timestamp);
    let messageDateString = messageDate.toLocaleDateString();
    
    if (lastMessageDate !== messageDateString) {
        // 日付が変わった場合、日付を表示
        addDateStamp(messageDateString);
        lastMessageDate = messageDateString;
    }

    let timestamp = document.createElement('div');
    timestamp.textContent = formatTimestamp(messageData.timestamp);
    timestamp.className = 'message-timestamp';
    bubbleContainer.appendChild(timestamp);

    container.appendChild(bubbleContainer);

    document.getElementById('messages').appendChild(container);
}

function formatTimestamp(timestamp) {
    let date = new Date(timestamp);
    return date.getHours() + ':' + date.getMinutes().toString().padStart(2, '0');
}

function addDateStamp(dateString) {
    const dateStamp = document.createElement('div');
    dateStamp.className = 'date-stamp';
    dateStamp.textContent = dateString;
    document.getElementById('messages').appendChild(dateStamp);
}

function loadMessages() {
    const url = `${apiEndpoint}?type=getMessages&lastId=${lastMessageId}&roomId=${roomId}&userId=${userId}`;
    fetch(url)
        .then(response => response.json())
        .then(messages => {
            if (messages.length === 0) {
                showNoNewMessages();
            } else {
                messages.forEach(messageData => {
                    addMessage(messageData, messageData.userId === userId);
                    lastMessageId = messageData.messageId;
                });
            }
        });
}

function newMessageAmount() {
    const url = `${apiEndpoint}?type=getMessages&lastId=${lastMessageId}&roomId=${roomId}`;
    fetch(url)
        .then(response => response.json())
        .then(messages => {
            console.log(messages.length);
            //let messageBubble = document.createElement('div');
            //messageBubble.textContent = messages.length;
        });
}

function showNoNewMessages() {
    let li = document.createElement('li');
    li.textContent = "最新のメッセージはありません";
    li.className = 'no-new-messages';
    document.getElementById('messages').appendChild(li);
}

document.getElementById('loadMessagesBtn').addEventListener('click', function() {
    if(userId != null){
        loadMessages();
    } else {
        alert('ユーザーIDを入力してください。');
        return;
    }
});

window.onload = newMessageAmount;
window.onload = loadMessages;