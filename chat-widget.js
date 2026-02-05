import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
// 🌟 getDoc이 추가되었습니다.
import { getFirestore, collection, addDoc, deleteDoc, updateDoc, getDoc, doc, onSnapshot, query, orderBy, serverTimestamp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

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
        if (loginScreen.classList.contains('hidden')) messageInput.focus();
        else nicknameInput.focus();
    } else {
        chatTooltip.classList.remove('hidden');
    }
}

// 🌟 입장 함수 (ID 재사용 로직 추가)
window.joinChat = async function(isAutoLogin = false) {
    
    // 1. 닉네임 처리
    if (!isAutoLogin) {
        const val = nicknameInput.value.trim();
        if(val) nickname = val;
        sessionStorage.setItem('chat_nickname', nickname);
    } else {
        nickname = sessionStorage.getItem('chat_nickname');
    }

    loginScreen.classList.add('hidden');

    try {
        // 🌟 [핵심] 기존에 쓰던 ID가 있는지 확인
        const savedDocId = sessionStorage.getItem('chat_doc_id');
        let shouldCreateNew = true;

        if (savedDocId) {
            // 기존 ID가 있다면 DB에 살아있는지 확인
            const docRef = doc(db, "online_users", savedDocId);
            const docSnap = await getDoc(docRef);

            if (docSnap.exists()) {
                // 살아있다면? -> 재사용! (입장 메시지 안 보냄)
                currentUserDocId = savedDocId;
                await updateDoc(docRef, { lastActive: serverTimestamp() });
                shouldCreateNew = false;
                console.log("기존 접속 유지:", nickname);
            }
        }

        // 기존 ID가 없거나 죽었으면 -> 새로 생성
        if (shouldCreateNew) {
            const docRef = await addDoc(collection(db, "online_users"), {
                nickname: nickname,
                joinedAt: serverTimestamp(),
                lastActive: serverTimestamp()
            });
            currentUserDocId = docRef.id;
            // 🌟 새 ID를 세션에 저장
            sessionStorage.setItem('chat_doc_id', currentUserDocId);

            // 입장 메시지 전송 (새로 왔을 때만)
            await addDoc(collection(db, "chats"), {
                text: `${nickname}님이 입장하셨습니다.`,
                sender: "System",
                type: "system",
                timestamp: serverTimestamp()
            });
        }

        // 4. 심박수(Heartbeat) 시작 (1초 간격)
        if (heartbeatInterval) clearInterval(heartbeatInterval);
        heartbeatInterval = setInterval(async () => {
            if (currentUserDocId) {
                const userDocRef = doc(db, "online_users", currentUserDocId);
                await updateDoc(userDocRef, { lastActive: serverTimestamp() }).catch(() => {});
            }
        }, 1000);

    } catch (e) {
        console.error("입장 처리 실패:", e);
    }
}

// 🌟 [중요] 페이지 이동 시 '삭제' 로직을 제거했습니다!
// 브라우저를 닫으면 Heartbeat가 멈추고, 3초 뒤에 '좀비 청소'에 의해 퇴장 처리됩니다.
window.addEventListener("beforeunload", () => {
    // 아무것도 하지 않음 (유지)
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

// 스마트 카운팅 및 좀비 청소
onSnapshot(collection(db, "online_users"), (snapshot) => {
    const now = new Date().getTime();
    let activeCount = 0;

    snapshot.forEach((userDoc) => {
        const data = userDoc.data();
        if (data.lastActive) {
            const timeDiff = now - data.lastActive.toDate().getTime();
            // 3초 이내 신호만 인정
            if (timeDiff < 3000) {
                activeCount++;
            } else {
                // 3초 지나면 삭제 (좀비 청소)
                deleteDoc(userDoc.ref).catch(() => {});
            }
        } else {
            activeCount++;
        }
    });

    userCountSpan.innerText = activeCount;

    // 퇴장 메시지 처리
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


// 자동 로그인 체크
(function checkAutoLogin() {
    const savedNickname = sessionStorage.getItem('chat_nickname');
    if (savedNickname) {
        nickname = savedNickname;
        joinChat(true); 
    }
})();