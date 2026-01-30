import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getFirestore, collection, addDoc, onSnapshot, query, orderBy, serverTimestamp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

// --- 1. HTML 주입 (어떤 페이지든 이 코드가 실행되면 채팅창이 생김) ---
const chatHTML = `
    <div class="chat-tooltip" id="chatTooltip">채팅을 활성화 해보세요!</div>

    <div class="chat-launcher" onclick="toggleChat()">
        <i class="ph ph-chat-teardrop-text"></i>
        <span class="notification-badge" id="notificationBadge">0</span>
    </div>

    <div class="chat-container" id="chatContainer">
        <div class="chat-header">
            <span>Team Chat</span>
            <div style="display: flex; align-items: center; gap: 10px;">
                <span class="chat-status">🟢 Online</span>
                <i class="ph ph-x chat-close-btn" onclick="toggleChat()"></i>
            </div>
        </div>

        <div class="login-screen" id="loginScreen">
            <h3>대화에 참여하세요</h3>
            <p style="font-size: 0.9rem; color: #64748b; margin-bottom: 20px;">팀원들과 실시간으로 소통할 수 있습니다.</p>
            <input type="text" id="nicknameInput" class="login-input" placeholder="닉네임 (미입력시 익명)">
            <button class="join-btn" onclick="joinChat()">참여하기</button>
        </div>

        <div class="chat-body" id="chatBody"></div>

        <div class="chat-footer">
            <input type="text" id="messageInput" class="chat-input" placeholder="메시지를 입력하세요..." onkeypress="handleKeyPress(event)">
            <button class="send-btn" onclick="sendMessage()"><i class="ph ph-paper-plane-right"></i></button>
        </div>
    </div>
`;

// body 태그 맨 끝에 채팅창 HTML 추가
document.body.insertAdjacentHTML('beforeend', chatHTML);


// --- 2. 파이어베이스 설정 ---
const firebaseConfig = {
    apiKey: "AIzaSyClOSD1-ww8RzYTl9889V5TUALeYA0Msso",
    authDomain: "chat1team.firebaseapp.com",
    projectId: "chat1team",
    storageBucket: "chat1team.firebasestorage.app",
    messagingSenderId: "954158078055",
    appId: "1:954158078055:web:f935ef829ef7e24aa95cc2",
    measurementId: "G-5KQRHKPC89"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// --- 3. 로직 및 변수 ---
let nickname = "익명의 사용자";
let isChatOpen = false;
let unreadCount = 0;
let initialLoad = true;

// 요소 선택
const chatContainer = document.getElementById('chatContainer');
const chatBody = document.getElementById('chatBody');
const loginScreen = document.getElementById('loginScreen');
const nicknameInput = document.getElementById('nicknameInput');
const messageInput = document.getElementById('messageInput');
const chatTooltip = document.getElementById('chatTooltip');
const notificationBadge = document.getElementById('notificationBadge');

// 욕설 필터
function filterBadWords(text) {
    const badWords = window.badWordsList || ["바보", "멍청이", "나쁜말"];
    let cleanText = text;
    badWords.forEach(word => {
        if (cleanText.includes(word)) {
            const stars = "*".repeat(word.length);
            cleanText = cleanText.split(word).join(stars);
        }
    });
    return cleanText;
}

// 전역 함수 연결
window.toggleChat = function() {
    chatContainer.classList.toggle('active');
    isChatOpen = chatContainer.classList.contains('active');

    if (isChatOpen) {
        chatTooltip.classList.add('hidden');
        unreadCount = 0;
        updateBadge();
        setTimeout(() => chatBody.scrollTop = chatBody.scrollHeight, 100);
        if (!loginScreen.classList.contains('hidden')) {
            nicknameInput.focus();
        } else {
            messageInput.focus();
        }
    } else {
        chatTooltip.classList.remove('hidden');
    }
}

window.joinChat = function() {
    const val = nicknameInput.value.trim();
    if(val) nickname = val;
    loginScreen.classList.add('hidden');
}

window.sendMessage = async function() {
    const text = messageInput.value.trim();
    if (!text) return;

    const filteredText = filterBadWords(text);

    try {
        await addDoc(collection(db, "chats"), {
            text: filteredText,
            sender: nickname,
            timestamp: serverTimestamp()
        });
        messageInput.value = '';
        messageInput.focus();
    } catch (e) {
        console.error("Error adding document: ", e);
        alert("메시지 전송 실패!");
    }
}

window.handleKeyPress = function(e) {
    if (e.key === 'Enter') sendMessage();
}

function updateBadge() {
    if (unreadCount > 0) {
        notificationBadge.innerText = unreadCount > 9 ? '9+' : unreadCount;
        notificationBadge.classList.add('show');
    } else {
        notificationBadge.classList.remove('show');
    }
}

// 실시간 리스너
const q = query(collection(db, "chats"), orderBy("timestamp", "asc"));
onSnapshot(q, (snapshot) => {
    snapshot.docChanges().forEach((change) => {
        if (change.type === "added") {
            const data = change.doc.data();
            const msgDiv = document.createElement('div');
            
            const isMyMsg = data.sender === nickname;
            msgDiv.className = `message ${isMyMsg ? 'my-msg' : 'other-msg'}`;
            
            if (!isMyMsg) {
                msgDiv.innerHTML = `<span class="message-info">${data.sender}</span>${data.text}`;
                if (!isChatOpen && !initialLoad) {
                    unreadCount++;
                    updateBadge();
                }
            } else {
                msgDiv.innerText = data.text;
            }

            chatBody.appendChild(msgDiv);
            chatBody.scrollTop = chatBody.scrollHeight;
        }
    });
    initialLoad = false;
});