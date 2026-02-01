import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getFirestore, collection, addDoc, deleteDoc, doc, onSnapshot, query, orderBy, serverTimestamp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

// --- 1. HTML 주입 (헤더 디자인 변경) ---
const chatHTML = `
    <div class="chat-tooltip" id="chatTooltip">채팅을 활성화 해보세요!</div>

    <div class="chat-launcher" onclick="toggleChat()">
        <i class="ph ph-chat-teardrop-text"></i>
        <span class="notification-badge" id="notificationBadge">0</span>
    </div>

    <div class="chat-container" id="chatContainer">
        <div class="chat-header">
            <div class="header-left">
                <span>Team Chat</span>
                <span class="online-count">
                    <span class="online-dot"></span> <span id="userCount">1</span>명 접속 중
                </span>
            </div>
            <i class="ph ph-x chat-close-btn" onclick="toggleChat()"></i>
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
let currentUserDocId = null; // 접속자 명단에서의 내 ID

// DOM 요소
const chatContainer = document.getElementById('chatContainer');
const chatBody = document.getElementById('chatBody');
const loginScreen = document.getElementById('loginScreen');
const nicknameInput = document.getElementById('nicknameInput');
const messageInput = document.getElementById('messageInput');
const chatTooltip = document.getElementById('chatTooltip');
const notificationBadge = document.getElementById('notificationBadge');
const userCountSpan = document.getElementById('userCount');

// 욕설 필터
function filterBadWords(text) {
    const badWords = window.badWordsList || ["바보", "멍청이"];
    let cleanText = text;
    badWords.forEach(word => {
        if (cleanText.includes(word)) {
            const stars = "*".repeat(word.length);
            cleanText = cleanText.split(word).join(stars);
        }
    });
    return cleanText;
}

// 창 열기/닫기
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

// 🌟 입장하기 (핵심 로직 추가됨)
window.joinChat = async function() {
    const val = nicknameInput.value.trim();
    if(val) nickname = val;
    loginScreen.classList.add('hidden');

    // 1. 접속자 명단(online_users)에 나를 등록
    try {
        const docRef = await addDoc(collection(db, "online_users"), {
            nickname: nickname,
            joinedAt: serverTimestamp()
        });
        currentUserDocId = docRef.id; // 나갈 때 지우기 위해 ID 저장

        // 2. 채팅방에 "입장했습니다" 시스템 메시지 전송
        await addDoc(collection(db, "chats"), {
            text: `${nickname}님이 입장하셨습니다.`,
            sender: "System",
            type: "system", // 시스템 메시지 표시
            timestamp: serverTimestamp()
        });
    } catch (e) {
        console.error("접속 등록 실패:", e);
    }
}

// 🌟 브라우저 닫거나 새로고침 할 때 (퇴장 처리)
window.addEventListener("beforeunload", async () => {
    if (currentUserDocId) {
        // 1. 명단에서 삭제
        // (참고: 브라우저가 닫힐 때는 비동기 처리가 보장되지 않을 수 있으나, 최선을 다해 요청함)
        const userDocRef = doc(db, "online_users", currentUserDocId);
        deleteDoc(userDocRef);

        // 2. 퇴장 메시지 전송 (옵션: 너무 자주 뜨면 시끄러우니 뺄 수도 있음)
        addDoc(collection(db, "chats"), {
            text: `${nickname}님이 퇴장하셨습니다.`,
            sender: "System",
            type: "system",
            timestamp: serverTimestamp()
        });
    }
});

// 메시지 전송
window.sendMessage = async function() {
    const text = messageInput.value.trim();
    if (!text) return;

    const filteredText = filterBadWords(text);

    try {
        await addDoc(collection(db, "chats"), {
            text: filteredText,
            sender: nickname,
            type: "user", // 일반 유저 메시지
            timestamp: serverTimestamp()
        });
        messageInput.value = '';
        messageInput.focus();
    } catch (e) {
        console.error("전송 실패:", e);
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

// 🌟 실시간 접속자 수 감지 (online_users 컬렉션 감시)
onSnapshot(collection(db, "online_users"), (snapshot) => {
    userCountSpan.innerText = snapshot.size; // 문서 개수 = 접속자 수
});

// 실시간 채팅 감지
const q = query(collection(db, "chats"), orderBy("timestamp", "asc"));
onSnapshot(q, (snapshot) => {
    snapshot.docChanges().forEach((change) => {
        if (change.type === "added") {
            const data = change.doc.data();
            const msgDiv = document.createElement('div');
            
            // 🌟 시스템 메시지 vs 일반 메시지 구분
            if (data.type === "system") {
                msgDiv.className = "system-msg";
                msgDiv.innerText = data.text;
            } else {
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
            }

            chatBody.appendChild(msgDiv);
            chatBody.scrollTop = chatBody.scrollHeight;
        }
    });
    initialLoad = false;
});