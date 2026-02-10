import { db } from './data.js';

// ============================================================
// 1. 설정 및 상태 관리
// ============================================================
const OPENAI_API_KEY = ''; // 테스트용 키 입력 (배포 시 삭제)

// AI 페르소나
const SYSTEM_PROMPT = `
당신은 'AI Design Library'의 전문 사서입니다.
사용자의 질문에 대해 아래 제공된 [보유 자료 데이터]를 기반으로 친절하게 답변하세요.

[지침]
1. 사용자가 자료를 찾으면 ID와 제목을 명확히 언급하세요.
2. 없는 자료를 요청하면 정중하게 없다고 하고, 비슷한 다른 카테고리를 추천하세요.
3. 답변은 한국어로 하고, 핵심 내용은 **굵게** 표시하여 가독성을 높이세요.
4. 인사말은 짧고 전문적으로 하세요.

[보유 자료 데이터]:
${JSON.stringify(db, null, 2)}
`;


// ============================================================
// 2. 스타일 & HTML 렌더링
// ============================================================
const style = `
<style>
    @import url('https://fonts.googleapis.com/css2?family=Pretendard:wght@400;500;700&display=swap');

    .chat-btn { position: fixed; bottom: 30px; right: 30px; width: 60px; height: 60px; border-radius: 50%; background: linear-gradient(135deg, #2563eb, #1d4ed8); box-shadow: 0 8px 20px rgba(37, 99, 235, 0.4); display: flex; align-items: center; justify-content: center; cursor: pointer; z-index: 9999; transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275); }
    .chat-btn:hover { transform: scale(1.1) rotate(-5deg); box-shadow: 0 15px 30px rgba(37, 99, 235, 0.5); }
    .chat-btn i { font-size: 32px; color: white; }

    .chat-window { position: fixed; bottom: 100px; right: 30px; width: 380px; height: 600px; background: #ffffff; border-radius: 24px; border: 1px solid rgba(255, 255, 255, 0.8); box-shadow: 0 10px 40px rgba(0, 0, 0, 0.15); display: none; flex-direction: column; overflow: hidden; z-index: 9999; font-family: 'Pretendard', sans-serif; animation: slideUp 0.3s ease-out; }
    @keyframes slideUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }

    .chat-header { background: rgba(255, 255, 255, 0.95); backdrop-filter: blur(10px); padding: 20px; border-bottom: 1px solid #f1f5f9; display: flex; justify-content: space-between; align-items: center; position: sticky; top: 0; z-index: 10; }
    .header-title { font-weight: 800; font-size: 1.1rem; color: #1e293b; display: flex; align-items: center; gap: 8px; }
    .status-dot { width: 8px; height: 8px; background: #22c55e; border-radius: 50%; display: inline-block; box-shadow: 0 0 0 2px rgba(34, 197, 94, 0.2); }
    .close-btn { cursor: pointer; color: #94a3b8; transition: 0.2s; font-size: 1.2rem; display: flex; align-items: center; }
    .close-btn:hover { color: #ef4444; transform: rotate(90deg); }

    .chat-body { flex: 1; padding: 20px; overflow-y: auto; background: #f8fafc; display: flex; flex-direction: column; gap: 16px; scroll-behavior: smooth; }
    .chat-body::-webkit-scrollbar { width: 6px; }
    .chat-body::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 3px; }

    .msg { max-width: 85%; padding: 12px 16px; border-radius: 18px; font-size: 0.95rem; line-height: 1.6; word-break: break-word; box-shadow: 0 2px 5px rgba(0,0,0,0.03); position: relative; }
    .msg strong { color: #2563eb; font-weight: 700; }
    .bot { background: white; color: #334155; align-self: flex-start; border-bottom-left-radius: 4px; border: 1px solid #e2e8f0; }
    .user { background: #2563eb; color: white; align-self: flex-end; border-bottom-right-radius: 4px; }

    .typing-indicator { align-self: flex-start; background: white; border: 1px solid #e2e8f0; padding: 12px 16px; border-radius: 18px; border-bottom-left-radius: 4px; display: none; align-items: center; gap: 5px; width: fit-content; box-shadow: 0 2px 5px rgba(0,0,0,0.03); }
    .dot { width: 6px; height: 6px; background: #94a3b8; border-radius: 50%; animation: bounce 1.4s infinite ease-in-out both; }
    .dot:nth-child(1) { animation-delay: -0.32s; } .dot:nth-child(2) { animation-delay: -0.16s; }
    @keyframes bounce { 0%, 80%, 100% { transform: scale(0); } 40% { transform: scale(1); } }

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

// 초기 HTML 구조
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
                찾으시는 자료나 디자인 관련 질문이 있으신가요?
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
// 3. 로직 (Logic) - ⭐ 상태 유지 기능 추가됨
// ============================================================

// 페이지 로드 시 상태 복원 (Local Storage 확인)
document.addEventListener('DOMContentLoaded', () => {
    const isChatOpen = localStorage.getItem('isChatOpen') === 'true';
    const savedHistory = localStorage.getItem('chatHistory');
    const chatWindow = document.getElementById('chatWindow');
    const chatBody = document.getElementById('chatBody');
    const typingIndicator = document.getElementById('typingIndicator');

    // 1. 창 열림 상태 복원
    if (isChatOpen) {
        chatWindow.style.display = 'flex';
        // 애니메이션 없이 즉시 표시 (깜빡임 방지)
        chatWindow.style.animation = 'none'; 
    }

    // 2. 대화 내용 복원
    if (savedHistory) {
        // 기존 봇 인사말 삭제 후 저장된 대화로 교체
        // 단, 타이핑 인디케이터는 유지해야 하므로 insertBefore 사용
        chatBody.innerHTML = savedHistory;
        chatBody.appendChild(typingIndicator); // 인디케이터를 맨 아래로 다시 이동
        scrollToBottom();
    }
});

// 채팅창 열기/닫기 토글
window.toggleChat = function() {
    const chat = document.getElementById('chatWindow');
    const isHidden = chat.style.display === 'none' || chat.style.display === '';
    
    chat.style.display = isHidden ? 'flex' : 'none';
    chat.style.animation = isHidden ? 'slideUp 0.3s ease-out' : 'none';

    // ⭐ 상태 저장
    localStorage.setItem('isChatOpen', isHidden);
    
    if(isHidden) document.getElementById('chatInput').focus();
}

window.handleEnter = function(e) {
    if (e.key === 'Enter') sendMessage();
}

window.sendMessage = async function() {
    const input = document.getElementById('chatInput');
    const sendBtn = document.getElementById('sendBtn');
    const text = input.value.trim();

    if (!text) return;

    addMsg(text, 'user');
    input.value = '';
    
    input.disabled = true;
    sendBtn.disabled = true;
    showTyping(true);

    try {
        const aiReply = await fetchAIResponse(text);
        addMsg(aiReply, 'bot');
    } catch (error) {
        console.error(error);
        addMsg("죄송합니다. 오류가 발생했습니다.", 'bot');
    } finally {
        input.disabled = false;
        sendBtn.disabled = false;
        showTyping(false);
        input.focus();
    }
}

// 실제 AI 호출 함수
async function fetchAIResponse(userMessage) {
    if (!OPENAI_API_KEY) {
        return new Promise(resolve => {
            setTimeout(() => {
                resolve(`🔑 <strong>API 키 확인 필요</strong><br><br>테스트용 키를 입력하지 않으셨군요!<br>질문 내용: "${userMessage}"`);
            }, 800);
        });
    }

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${OPENAI_API_KEY}`
        },
        body: JSON.stringify({
            model: "gpt-4o-mini",
            messages: [
                { role: "system", content: SYSTEM_PROMPT },
                { role: "user", content: userMessage }
            ],
            temperature: 0.7
        })
    });

    const data = await response.json();
    if (data.error) throw new Error(data.error.message);
    return data.choices[0].message.content;
}

// 메시지 추가 및 저장
function addMsg(text, type) {
    const chatBody = document.getElementById('chatBody');
    const typingIndicator = document.getElementById('typingIndicator');
    
    const div = document.createElement('div');
    div.className = `msg ${type}`;
    
    let formattedText = text.replace(/\n/g, '<br>');
    formattedText = formattedText.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    div.innerHTML = formattedText;
    
    chatBody.insertBefore(div, typingIndicator);
    scrollToBottom();

    // ⭐ 대화 내용 저장 (HTML 통째로 저장)
    // 주의: typingIndicator는 저장하지 않기 위해 cloneNode 사용 등의 복잡함 대신,
    // 간단하게 innerHTML에서 typingIndicator 부분만 뺀 내용을 저장할 수도 있지만,
    // 여기서는 렌더링 된 메시지들만 저장하는 방식으로 구현.
    
    // 현재 메시지 목록만 추출해서 저장
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