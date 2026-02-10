import { db } from './data.js';

// ============================================================
// 1. 설정 (Configuration)
// ============================================================
// ⚠️ 테스트할 때만 여기에 키를 넣으세요. (배포할 땐 지워야 함!)
const OPENAI_API_KEY = ''; // 예: 'sk-proj-...'

// AI에게 부여할 역할 (페르소나 + 데이터 주입)
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
// 2. UI 스타일 (ChatGPT 스타일 디자인)
// ============================================================
const style = `
<style>
    @import url('https://fonts.googleapis.com/css2?family=Pretendard:wght@400;500;700&display=swap');

    /* 챗봇 버튼 (플로팅) */
    .chat-btn {
        position: fixed; bottom: 30px; right: 30px;
        width: 60px; height: 60px; border-radius: 50%;
        background: linear-gradient(135deg, #2563eb, #1d4ed8);
        box-shadow: 0 8px 20px rgba(37, 99, 235, 0.4);
        display: flex; align-items: center; justify-content: center;
        cursor: pointer; z-index: 9999; transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
    }
    .chat-btn:hover { transform: scale(1.1) rotate(-5deg); }
    .chat-btn i { font-size: 32px; color: white; }

    /* 메인 채팅창 */
    .chat-window {
        position: fixed; bottom: 100px; right: 30px;
        width: 380px; height: 600px; 
        background: #ffffff;
        border-radius: 24px;
        box-shadow: 0 10px 40px rgba(0,0,0,0.15);
        display: none; flex-direction: column; overflow: hidden; z-index: 9999;
        font-family: 'Pretendard', sans-serif;
        border: 1px solid #f1f5f9;
        animation: slideUp 0.3s ease-out;
    }

    @keyframes slideUp {
        from { opacity: 0; transform: translateY(20px); }
        to { opacity: 1; transform: translateY(0); }
    }

    /* 헤더 */
    .chat-header {
        background: rgba(255, 255, 255, 0.9);
        backdrop-filter: blur(10px);
        padding: 20px; border-bottom: 1px solid #e2e8f0;
        display: flex; justify-content: space-between; align-items: center;
        position: sticky; top: 0; z-index: 10;
    }
    .header-title { font-weight: 800; font-size: 1.1rem; color: #1e293b; display: flex; align-items: center; gap: 8px; }
    .status-dot { width: 8px; height: 8px; background: #22c55e; border-radius: 50%; display: inline-block; }
    .close-btn { cursor: pointer; color: #94a3b8; transition: 0.2s; font-size: 1.2rem; }
    .close-btn:hover { color: #ef4444; }

    /* 채팅 내용 영역 */
    .chat-body {
        flex: 1; padding: 20px; overflow-y: auto; background: #f8fafc;
        display: flex; flex-direction: column; gap: 16px; scroll-behavior: smooth;
    }
    .chat-body::-webkit-scrollbar { width: 6px; }
    .chat-body::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 3px; }

    /* 메시지 말풍선 */
    .msg {
        max-width: 85%; padding: 12px 16px; border-radius: 16px; 
        font-size: 0.95rem; line-height: 1.6; word-break: break-word;
        box-shadow: 0 2px 5px rgba(0,0,0,0.03);
        position: relative;
    }
    .msg p { margin: 0 0 8px 0; }
    .msg p:last-child { margin: 0; }
    .msg strong { color: #2563eb; font-weight: 700; }
    
    .bot { 
        background: white; color: #334155; align-self: flex-start; 
        border-bottom-left-radius: 4px; border: 1px solid #e2e8f0;
    }
    .user { 
        background: #2563eb; color: white; align-self: flex-end; 
        border-bottom-right-radius: 4px; 
    }

    /* 타이핑 인디케이터 (생각중 애니메이션) */
    .typing-indicator {
        align-self: flex-start; background: white; border: 1px solid #e2e8f0;
        padding: 12px 16px; border-radius: 16px; border-bottom-left-radius: 4px;
        display: none; align-items: center; gap: 5px; width: fit-content;
    }
    .dot { width: 6px; height: 6px; background: #94a3b8; border-radius: 50%; animation: bounce 1.4s infinite ease-in-out both; }
    .dot:nth-child(1) { animation-delay: -0.32s; }
    .dot:nth-child(2) { animation-delay: -0.16s; }
    @keyframes bounce { 0%, 80%, 100% { transform: scale(0); } 40% { transform: scale(1); } }

    /* 입력 영역 */
    .chat-footer {
        padding: 15px; background: white; border-top: 1px solid #e2e8f0;
        display: flex; align-items: center; gap: 10px;
    }
    .chat-input {
        flex: 1; padding: 12px 15px; border: 1px solid #e2e8f0; border-radius: 12px;
        outline: none; font-size: 0.95rem; transition: 0.2s; background: #f8fafc;
    }
    .chat-input:focus { background: white; border-color: #2563eb; box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1); }
    .send-btn {
        background: #2563eb; color: white; border: none; width: 42px; height: 42px;
        border-radius: 10px; cursor: pointer; display: flex; align-items: center; justify-content: center;
        transition: 0.2s;
    }
    .send-btn:hover { background: #1d4ed8; }
    .send-btn:disabled { background: #cbd5e1; cursor: not-allowed; }

    /* 모바일 반응형 */
    @media (max-width: 480px) {
        .chat-window { width: 90%; height: 80%; bottom: 20px; right: 5%; }
    }
</style>
`;
document.head.insertAdjacentHTML('beforeend', style);


// ============================================================
// 3. HTML 렌더링
// ============================================================
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
// 4. 로직 (Logic)
// ============================================================

window.toggleChat = function() {
    const chat = document.getElementById('chatWindow');
    const display = chat.style.display === 'flex' ? 'none' : 'flex';
    chat.style.display = display;
    
    // 열릴 때 입력창에 포커스
    if(display === 'flex') document.getElementById('chatInput').focus();
}

window.handleEnter = function(e) {
    if (e.key === 'Enter') sendMessage();
}

window.sendMessage = async function() {
    const input = document.getElementById('chatInput');
    const sendBtn = document.getElementById('sendBtn');
    const text = input.value.trim();

    if (!text) return;

    // 1. 내 메시지 표시
    addMsg(text, 'user');
    input.value = '';
    
    // 2. 로딩 상태 시작 (입력 잠금, 애니메이션 켜기)
    input.disabled = true;
    sendBtn.disabled = true;
    showTyping(true);

    try {
        // 3. AI 답변 받아오기 (RAG)
        const aiReply = await fetchAIResponse(text);
        
        // 4. 답변 표시
        addMsg(aiReply, 'bot');

    } catch (error) {
        console.error(error);
        addMsg("죄송합니다. AI 연결 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.", 'bot');
    } finally {
        // 5. 로딩 상태 종료
        input.disabled = false;
        sendBtn.disabled = false;
        showTyping(false);
        input.focus();
    }
}

// ------------------------------------------------------------
// [핵심] 실제 AI 호출 함수 (OpenAI / Vercel)
// ------------------------------------------------------------
async function fetchAIResponse(userMessage) {
    
    // 1. API 키가 없으면 -> '가짜 AI 모드' (테스트용)
    if (!OPENAI_API_KEY) {
        return new Promise(resolve => {
            setTimeout(() => {
                resolve(`🔑 <strong>API 키가 설정되지 않았습니다!</strong><br><br>코드 상단의 <code>OPENAI_API_KEY</code> 변수에 키를 입력하거나, 서버(Vercel)에 배포 후 연결해야 실제 답변을 받을 수 있습니다.<br><br>입력하신 내용: "${userMessage}"`);
            }, 1000); // 1초 생각하는 척
        });
    }

    // 2. API 키가 있으면 -> '진짜 AI 모드' (OpenAI 호출)
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${OPENAI_API_KEY}`
        },
        body: JSON.stringify({
            model: "gpt-4o-mini", // 가성비 모델
            messages: [
                { role: "system", content: SYSTEM_PROMPT }, // 여기에 데이터(data.js)가 들어감!
                { role: "user", content: userMessage }
            ],
            temperature: 0.7
        })
    });

    const data = await response.json();
    
    if (data.error) throw new Error(data.error.message);
    return data.choices[0].message.content;
}

// ------------------------------------------------------------
// 유틸리티 함수
// ------------------------------------------------------------
function addMsg(text, type) {
    const chatBody = document.getElementById('chatBody');
    const typingIndicator = document.getElementById('typingIndicator');
    
    const div = document.createElement('div');
    div.className = `msg ${type}`;
    
    // 간단한 마크다운 처리 (줄바꿈, 볼드)
    let formattedText = text.replace(/\n/g, '<br>');
    formattedText = formattedText.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>'); // **굵게** 처리
    
    div.innerHTML = formattedText;
    
    // 생각중 표시(typingIndicator) 바로 앞에 메시지 삽입
    chatBody.insertBefore(div, typingIndicator);
    
    scrollToBottom();
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