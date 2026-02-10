import { db } from './data.js';

// ============================================================
// 1. [데모 모드] 설정
// ============================================================
// API 키 필요 없음! (나중에 찐 AI 연결할 때만 코드 바꾸면 됨)

// 봇이 할 수 있는 가짜 대답들 (랜덤으로 나옴)
const MOCK_ANSWERS = [
    "네, <strong>101번 '2026 전략 보고서'</strong>가 가장 적합해 보입니다!",
    "해당 자료는 <strong>그래픽 디자인(Graphic)</strong> 카테고리에 있습니다.",
    "죄송해요, 그 자료는 아직 업데이트되지 않았습니다. 😅",
    "<strong>다운로드 버튼</strong>을 누르시면 구글 드라이브로 연결됩니다.",
    "디자인 팀에 요청하시면 3일 내로 제작 가능합니다."
];


// ============================================================
// 2. 스타일 & HTML (아까 만든 예쁜 디자인 그대로!)
// ============================================================
const style = `
<style>
    @import url('https://fonts.googleapis.com/css2?family=Pretendard:wght@400;500;700&display=swap');

    /* 버튼 */
    .chat-btn { position: fixed; bottom: 30px; right: 30px; width: 60px; height: 60px; border-radius: 50%; background: linear-gradient(135deg, #2563eb, #1d4ed8); box-shadow: 0 8px 20px rgba(37, 99, 235, 0.4); display: flex; align-items: center; justify-content: center; cursor: pointer; z-index: 9999; transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275); }
    .chat-btn:hover { transform: scale(1.1) rotate(-5deg); box-shadow: 0 15px 30px rgba(37, 99, 235, 0.5); }
    .chat-btn i { font-size: 32px; color: white; }

    /* 창 */
    .chat-window { position: fixed; bottom: 100px; right: 30px; width: 380px; height: 600px; background: #ffffff; border-radius: 24px; border: 1px solid rgba(255, 255, 255, 0.8); box-shadow: 0 10px 40px rgba(0, 0, 0, 0.15); display: none; flex-direction: column; overflow: hidden; z-index: 9999; font-family: 'Pretendard', sans-serif; animation: slideUp 0.3s ease-out; }
    @keyframes slideUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }

    /* 헤더 */
    .chat-header { background: rgba(255, 255, 255, 0.95); backdrop-filter: blur(10px); padding: 20px; border-bottom: 1px solid #f1f5f9; display: flex; justify-content: space-between; align-items: center; position: sticky; top: 0; z-index: 10; }
    .header-title { font-weight: 800; font-size: 1.1rem; color: #1e293b; display: flex; align-items: center; gap: 8px; }
    .status-dot { width: 8px; height: 8px; background: #22c55e; border-radius: 50%; display: inline-block; box-shadow: 0 0 0 2px rgba(34, 197, 94, 0.2); }
    .close-btn { cursor: pointer; color: #94a3b8; transition: 0.2s; font-size: 1.2rem; display: flex; align-items: center; }
    .close-btn:hover { color: #ef4444; transform: rotate(90deg); }

    /* 바디 */
    .chat-body { flex: 1; padding: 20px; overflow-y: auto; background: #f8fafc; display: flex; flex-direction: column; gap: 16px; scroll-behavior: smooth; }
    .chat-body::-webkit-scrollbar { width: 6px; }
    .chat-body::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 3px; }

    /* 메시지 */
    .msg { max-width: 85%; padding: 12px 16px; border-radius: 18px; font-size: 0.95rem; line-height: 1.6; word-break: break-word; box-shadow: 0 2px 5px rgba(0,0,0,0.03); position: relative; }
    .msg strong { color: #2563eb; font-weight: 700; }
    .bot { background: white; color: #334155; align-self: flex-start; border-bottom-left-radius: 4px; border: 1px solid #e2e8f0; }
    .user { background: #2563eb; color: white; align-self: flex-end; border-bottom-right-radius: 4px; }

    /* 애니메이션 */
    .typing-indicator { align-self: flex-start; background: white; border: 1px solid #e2e8f0; padding: 12px 16px; border-radius: 18px; border-bottom-left-radius: 4px; display: none; align-items: center; gap: 5px; width: fit-content; box-shadow: 0 2px 5px rgba(0,0,0,0.03); }
    .dot { width: 6px; height: 6px; background: #94a3b8; border-radius: 50%; animation: bounce 1.4s infinite ease-in-out both; }
    .dot:nth-child(1) { animation-delay: -0.32s; } .dot:nth-child(2) { animation-delay: -0.16s; }
    @keyframes bounce { 0%, 80%, 100% { transform: scale(0); } 40% { transform: scale(1); } }

    /* 푸터 */
    .chat-footer { padding: 15px; background: white; border-top: 1px solid #e2e8f0; display: flex; align-items: center; gap: 10px; }
    .chat-input { flex: 1; padding: 12px 15px; border: 1px solid #e2e8f0; border-radius: 12px; outline: none; font-size: 0.95rem; transition: 0.2s; background: #f8fafc; font-family: 'Pretendard', sans-serif; }
    .chat-input:focus { background: white; border-color: #2563eb; box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1); }
    .send-btn { background: #2563eb; color: white; border: none; width: 42px; height: 42px; border-radius: 12px; cursor: pointer; display: flex; align-items: center; justify-content: center; transition: 0.2s; font-size: 1.2rem; }
    .send-btn:hover { background: #1d4ed8; transform: translateY(-2px); }
    .send-btn:disabled { background: #cbd5e1; cursor: not-allowed; transform: none; }

    @media (max-width: 480px) { .chat-window { width: 90%; height: 80vh; bottom: 20px; right: 5%; border-radius: 20px; } }
</style>
`;
document.head.insertAdjacentHTML('beforeend', style);

// HTML
const html = `
    <div class="chat-btn" onclick="toggleChat()">
        <i class="ph-fill ph-chat-teardrop-dots"></i>
    </div>

    <div class="chat-window" id="chatWindow">
        <div class="chat-header">
            <div class="header-title">
                <span class="status-dot"></span> AI Design Helper
            </div>
            <div class="close-btn" onclick="toggleChat()">
                <i class="ph ph-x"></i>
            </div>
        </div>

        <div class="chat-body" id="chatBody">
            <div class="msg bot">
                안녕하세요! 👋<br>
                <strong>AI 디자인 라이브러리</strong>입니다.<br>
                무엇을 도와드릴까요? (데모 버전)
            </div>
            <div class="typing-indicator" id="typingIndicator">
                <div class="dot"></div><div class="dot"></div><div class="dot"></div>
            </div>
        </div>

        <div class="chat-footer">
            <input type="text" class="chat-input" id="chatInput" placeholder="메시지를 입력하세요..." onkeypress="handleEnter(event)">
            <button class="send-btn" id="sendBtn" onclick="sendMessage()">
                <i class="ph-fill ph-paper-plane-right"></i>
            </button>
        </div>
    </div>
`;
document.body.insertAdjacentHTML('beforeend', html);


// ============================================================
// 3. 로직 (안전한 데모 모드)
// ============================================================

// 페이지 로드 시 상태 복원
document.addEventListener('DOMContentLoaded', () => {
    const isChatOpen = localStorage.getItem('isChatOpen') === 'true';
    const savedHistory = localStorage.getItem('chatHistory');
    const chatWindow = document.getElementById('chatWindow');
    const chatBody = document.getElementById('chatBody');
    const typingIndicator = document.getElementById('typingIndicator');

    if (isChatOpen) {
        chatWindow.style.display = 'flex';
        chatWindow.style.animation = 'none'; 
    }
    if (savedHistory) {
        chatBody.innerHTML = savedHistory;
        chatBody.appendChild(typingIndicator);
        scrollToBottom();
    }
});

window.toggleChat = function() {
    const chat = document.getElementById('chatWindow');
    const isHidden = chat.style.display === 'none' || chat.style.display === '';
    chat.style.display = isHidden ? 'flex' : 'none';
    chat.style.animation = isHidden ? 'slideUp 0.3s ease-out' : 'none';
    localStorage.setItem('isChatOpen', isHidden);
    if(isHidden) document.getElementById('chatInput').focus();
}

window.handleEnter = function(e) { if (e.key === 'Enter') sendMessage(); }

window.sendMessage = async function() {
    const input = document.getElementById('chatInput');
    const sendBtn = document.getElementById('sendBtn');
    const text = input.value.trim();

    if (!text) return;

    // 내 메시지 표시
    addMsg(text, 'user');
    input.value = '';
    
    // 로딩 시작
    input.disabled = true;
    sendBtn.disabled = true;
    showTyping(true);

    // 🌟 [핵심] 가짜 딜레이 (1초 뒤에 답변)
    setTimeout(() => {
        // 간단한 키워드 매칭 (조금 똑똑한 척)
        let reply = MOCK_ANSWERS[Math.floor(Math.random() * MOCK_ANSWERS.length)]; // 기본 랜덤 답변

        if (text.includes("보고서") || text.includes("PPT")) {
            reply = "보고서 자료를 찾으시는군요! <strong>[Report]</strong> 메뉴에 4개의 자료가 있습니다.";
        } else if (text.includes("안녕")) {
            reply = "반갑습니다! 오늘도 좋은 하루 되세요. 🍀";
        } else if (text.includes("다운") || text.includes("파일")) {
            reply = "다운로드가 안 되시나요? <strong>새로고침(F5)</strong> 후 다시 시도해 주세요.";
        }

        addMsg(reply, 'bot');
        
        // 로딩 끝
        input.disabled = false;
        sendBtn.disabled = false;
        showTyping(false);
        input.focus();

    }, 1000); // 1초 생각하는 척 딜레이
}


// 유틸리티 함수
function addMsg(text, type) {
    const chatBody = document.getElementById('chatBody');
    const typingIndicator = document.getElementById('typingIndicator');
    
    const div = document.createElement('div');
    div.className = `msg ${type}`;
    div.innerHTML = text; // HTML 태그 허용
    
    chatBody.insertBefore(div, typingIndicator);
    scrollToBottom();

    // 대화 저장
    const msgs = chatBody.querySelectorAll('.msg');
    let historyHTML = "";
    msgs.forEach(msg => historyHTML += msg.outerHTML);
    localStorage.setItem('chatHistory', historyHTML);
}

function showTyping(show) {
    const indicator = document.getElementById('typingIndicator');
    indicator.style.display = show ? 'flex' : 'none';
    scrollToBottom();
}

function scrollToBottom() {
    const chatBody = document.getElementById('chatBody');
    chatBody.scrollTop = chatBody.scrollHeight;
}