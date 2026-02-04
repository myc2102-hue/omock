import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getFirestore, collection, addDoc, deleteDoc, updateDoc, doc, onSnapshot, query, orderBy, serverTimestamp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

// --- 1. HTML 주입 ---
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
                    <span class="online-dot"></span> <span id="userCount">0</span>명 접속 중
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


// --- 3. 변수 및 DOM ---
let nickname = "익명의 사용자";
let isChatOpen = false;
let unreadCount = 0;
let initialLoad = true;
let currentUserDocId = null;
let heartbeatInterval = null;

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

window.toggleChat = function() {
    chatContainer.classList.toggle('active');
    isChatOpen = chatContainer.classList.contains('active');

    if (isChatOpen) {
        chatTooltip.classList.add('hidden');
        unreadCount = 0;
        updateBadge();
        setTimeout(() => chatBody.scrollTop = chatBody.scrollHeight, 100);
        if (!loginScreen.classList.contains('hidden')) nicknameInput.focus();
        else messageInput.focus();
    } else {
        chatTooltip.classList.remove('hidden');
    }
}

// 🌟 입장
window.joinChat = async function() {
    const val = nicknameInput.value.trim();
    if(val) nickname = val;
    loginScreen.classList.add('hidden');

    try {
        // 1. 명단 등록
        const docRef = await addDoc(collection(db, "online_users"), {
            nickname: nickname,
            joinedAt: serverTimestamp(),
            lastActive: serverTimestamp()
        });
        currentUserDocId = docRef.id;

        // 2. 입장 메시지
        await addDoc(collection(db, "chats"), {
            text: `${nickname}님이 입장하셨습니다.`,
            sender: "System",
            type: "system",
            timestamp: serverTimestamp()
        });

        // 3. 심박수(Heartbeat) 전송: 1.5초마다 갱신
        heartbeatInterval = setInterval(async () => {
            if (currentUserDocId) {
                const userDocRef = doc(db, "online_users", currentUserDocId);
                await updateDoc(userDocRef, { lastActive: serverTimestamp() }).catch(e => console.warn("갱신 실패:", e));
            }
        }, 1500);

    } catch (e) {
        console.error("입장 처리 실패:", e);
        alert("접속 오류! 파이어베이스 규칙을 확인해주세요.");
    }
}

// 🌟 퇴장 (브라우저 닫을 때)
window.addEventListener("beforeunload", () => {
    if (currentUserDocId) {
        const userDocRef = doc(db, "online_users", currentUserDocId);
        deleteDoc(userDocRef);
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
            type: "user",
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

// 🌟 [핵심 수정] 스마트 카운팅 및 청소
onSnapshot(collection(db, "online_users"), (snapshot) => {
    
    // 1. 단순 개수가 아니라, '진짜 살아있는 사람'만 셉니다.
    const now = new Date().getTime();
    let activeCount = 0;

    snapshot.forEach((userDoc) => {
        const data = userDoc.data();
        if (data.lastActive) {
            const lastActiveTime = data.lastActive.toDate().getTime();
            const timeDiff = now - lastActiveTime;

            // [중요] 5초 이내에 신호가 있었던 사람만 숫자에 포함!
            if (timeDiff < 5000) {
                activeCount++;
            }
            
            // 2. 청소는 5초 넘으면 진행 (DB 삭제)
            if (timeDiff > 5000) {
                deleteDoc(userDoc.ref).catch(() => {});
            }
        } else {
            // 시간 기록 없으면 그냥 숫자에 포함 (방금 들어온 사람일 수 있음)
            activeCount++;
        }
    });

    // 화면 숫자 갱신
    userCountSpan.innerText = activeCount;

    // 3. 퇴장 메시지 (DB에서 실제로 삭제되었을 때)
    snapshot.docChanges().forEach((change) => {
        if (change.type === "removed") {
            const leftUser = change.doc.data().nickname;
            const msgDiv = document.createElement('div');
            msgDiv.className = "system-msg";
            msgDiv.innerText = `${leftUser}님이 퇴장하셨습니다.`;
            chatBody.appendChild(msgDiv);
            chatBody.scrollTop = chatBody.scrollHeight;
        }
    });
});

// 채팅 메시지 감지
const q = query(collection(db, "chats"), orderBy("timestamp", "asc"));
onSnapshot(q, (snapshot) => {
    snapshot.docChanges().forEach((change) => {
        if (change.type === "added") {
            const data = change.doc.data();
            const msgDiv = document.createElement('div');
            
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