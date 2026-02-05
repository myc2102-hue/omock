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
        
        // 로그인 상태면 메시지 입력창으로, 아니면 닉네임 입력창으로
        if (loginScreen.classList.contains('hidden')) messageInput.focus();
        else nicknameInput.focus();

    } else {
        chatTooltip.classList.remove('hidden');
    }
}

// 🌟 입장 함수 (자동 로그인 지원)
// isAutoLogin: 페이지 이동으로 인한 자동 접속인지 여부
window.joinChat = async function(isAutoLogin = false) {
    
    // 1. 닉네임 처리
    if (!isAutoLogin) {
        // 직접 입력해서 들어온 경우
        const val = nicknameInput.value.trim();
        if(val) nickname = val;
        // 🌟 브라우저 저장소에 닉네임 저장 (페이지 이동해도 기억함!)
        sessionStorage.setItem('chat_nickname', nickname);
    } else {
        // 자동 로그인인 경우 저장소에서 가져옴
        nickname = sessionStorage.getItem('chat_nickname');
    }

    loginScreen.classList.add('hidden');

    try {
        // 2. 명단 등록
        const docRef = await addDoc(collection(db, "online_users"), {
            nickname: nickname,
            joinedAt: serverTimestamp(),
            lastActive: serverTimestamp()
        });
        currentUserDocId = docRef.id;

        // 3. 입장 메시지 전송
        // 🌟 페이지 이동할 때마다 "입장했습니다" 뜨면 시끄러우니까, 처음 로그인할 때만 뜨게 함
        if (!isAutoLogin) {
            await addDoc(collection(db, "chats"), {
                text: `${nickname}님이 입장하셨습니다.`,
                sender: "System",
                type: "system",
                timestamp: serverTimestamp()
            });
        }

        // 4. 심박수(Heartbeat) 시작
        if (heartbeatInterval) clearInterval(heartbeatInterval);
        heartbeatInterval = setInterval(async () => {
            if (currentUserDocId) {
                const userDocRef = doc(db, "online_users", currentUserDocId);
                await updateDoc(userDocRef, { lastActive: serverTimestamp() }).catch(() => {});
            }
        }, 1500);

    } catch (e) {
        console.error("입장 처리 실패:", e);
    }
}

// 🌟 퇴장 처리
window.addEventListener("beforeunload", () => {
    if (currentUserDocId) {
        const userDocRef = doc(db, "online_users", currentUserDocId);
        deleteDoc(userDocRef);
    }
    // 주의: 페이지 이동 시에는 sessionStorage를 지우지 않습니다.
    // 그래야 다음 페이지에서 기억하니까요!
    // 만약 '로그아웃' 버튼을 만든다면 그때 sessionStorage.removeItem('chat_nickname')을 해야 합니다.
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

// 접속자 카운팅 (스마트 로직)
onSnapshot(collection(db, "online_users"), (snapshot) => {
    const now = new Date().getTime();
    let activeCount = 0;

    snapshot.forEach((userDoc) => {
        const data = userDoc.data();
        if (data.lastActive) {
            const timeDiff = now - data.lastActive.toDate().getTime();
            if (timeDiff < 5000) activeCount++;
            else deleteDoc(userDoc.ref).catch(() => {});
        } else {
            activeCount++;
        }
    });

    userCountSpan.innerText = activeCount;

    // 퇴장 메시지 처리
    snapshot.docChanges().forEach((change) => {
        if (change.type === "removed") {
            const leftUser = change.doc.data().nickname;
            
            // 🌟 페이지 이동 중에는 '퇴장' 메시지가 뜰 수 있지만, 
            // 닉네임이 같으면 무시하거나 그냥 두는 게 자연스럽습니다.
            // 여기서는 심플하게 그냥 띄웁니다.
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


// 🌟 [핵심] 페이지 로드 시 자동 로그인 체크
// 스크립트가 실행되자마자 저장된 닉네임이 있는지 확인합니다.
(function checkAutoLogin() {
    const savedNickname = sessionStorage.getItem('chat_nickname');
    if (savedNickname) {
        console.log("자동 로그인 시도:", savedNickname);
        nickname = savedNickname;
        joinChat(true); // true = "이건 자동 로그인이야" 라고 알려줌
    }
})();