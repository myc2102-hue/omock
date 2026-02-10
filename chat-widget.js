import { db } from './data.js';

// ============================================================
// 1. [설정] 가짜 데이터 (나중에 API 연결 시 삭제)
// ============================================================
const MOCK_ANSWERS = [
    "네, <strong>101번 '2026 전략 보고서'</strong>가 가장 적합해 보입니다. <br>상세 페이지에서 바로 다운로드 가능합니다.",
    "해당 자료는 <strong>[Graphic] 카테고리</strong>에 있습니다. <br>썸네일을 클릭하면 원본(PSD)을 확인하실 수 있어요.",
    "<strong>다운로드 버튼</strong>을 누르시면 구글 드라이브 뷰어가 새 창으로 열립니다.",
    "죄송해요, 그 자료는 아직 업데이트되지 않았습니다. 😅 <br>대신 비슷한 <strong>201번 템플릿</strong>은 어떠신가요?"
];


// ============================================================
// 2. [스타일] 프롬프트 창 디자인 (Notion AI / Spotlight 스타일)
// ============================================================
const style = `
<style>
    @import url('https://fonts.googleapis.com/css2?family=Pretendard:wght@400;500;700&display=swap');

    /* 1. 런처 버튼 (우측 하단 플로팅) */
    .ai-fab {
        position: fixed; bottom: 30px; right: 30px;
        background: black; color: white;
        padding: 12px 24px; border-radius: 30px;
        display: flex; align-items: center; gap: 8px;
        font-family: 'Pretendard', sans-serif; font-weight: 700;
        box-shadow: 0 10px 30px rgba(0,0,0,0.2);
        cursor: pointer; z-index: 9000;
        transition: transform 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.275);
    }
    .ai-fab:hover { transform: scale(1.05); }
    .ai-fab span { font-size: 0.95rem; }
    .ai-icon { width: 20px; height: 20px; }

    /* 2. 배경 깔기 (Dimmed) */
    .prompt-overlay {
        position: fixed; top: 0; left: 0; width: 100%; height: 100%;
        background: rgba(0, 0, 0, 0.4);
        backdrop-filter: blur(5px); /* 뒤에 흐리게 */
        z-index: 9998;
        display: none; opacity: 0;
        transition: opacity 0.3s ease;
    }

    /* 3. 프롬프트 창 (중앙 정렬) */
    .prompt-modal {
        position: fixed; top: 20%; left: 50%;
        transform: translateX(-50%) translateY(20px);
        width: 600px; max-width: 90%;
        background: white;
        border-radius: 16px;
        box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
        z-index: 9999;
        display: none; flex-direction: column;
        overflow: hidden;
        font-family: 'Pretendard', sans-serif;
        transition: all 0.3s ease;
    }

    /* 입력 영역 */
    .input-area {
        display: flex; align-items: center; padding: 20px 24px;
        border-bottom: 1px solid transparent;
    }
    .input-area.has-result { border-bottom: 1px solid #f1f5f9; } /* 결과 있으면 구분선 */
    
    .magic-icon { font-size: 1.5rem; margin-right: 15px; color: #64748b; animation: spin-slow 10s infinite linear; }
    
    .prompt-input {
        flex: 1; border: none; outline: none;
        font-size: 1.2rem; font-weight: 500; color: #1e293b;
        background: transparent;
    }
    .prompt-input::placeholder { color: #cbd5e1; }

    /* 결과 영역 */
    .result-area {
        background: #f8fafc;
        padding: 0; max-height: 0; /* 처음엔 숨김 */
        overflow-y: auto;
        transition: max-height 0.4s ease, padding 0.4s ease;
    }
    .result-content {
        font-size: 1rem; line-height: 1.7; color: #334155;
        white-space: pre-wrap;
    }
    .result-area.show {
        padding: 24px;
        max-height: 300px; /* 결과 나오면 펼쳐짐 */
    }

    /* 추천 칩 (Chips) */
    .chips-area {
        padding: 12px 24px 20px 24px; display: flex; gap: 8px; flex-wrap: wrap;
    }
    .chip {
        background: white; border: 1px solid #e2e8f0; border-radius: 20px;
        padding: 6px 14px; font-size: 0.85rem; color: #64748b; cursor: pointer;
        transition: 0.2s; display: flex; align-items: center; gap: 6px;
    }
    .chip:hover { border-color: #2563eb; color: #2563eb; background: #eff6ff; }
    .chip i { font-size: 1rem; }

    /* 로딩 애니메이션 */
    @keyframes spin-slow { 100% { transform: rotate(360deg); } }
    .blinking-cursor { display: inline-block; width: 6px; height: 18px; background: #2563eb; animation: blink 1s infinite; vertical-align: middle; margin-left: 4px; }
    @keyframes blink { 50% { opacity: 0; } }

</style>
`;
document.head.insertAdjacentHTML('beforeend', style);


// ============================================================
// 3. HTML 렌더링
// ============================================================
const html = `
    <div class="ai-fab" onclick="openPrompt()">
        <i class="ph-fill ph-sparkle ai-icon"></i>
        <span>Ask AI</span>
    </div>

    <div class="prompt-overlay" id="promptOverlay" onclick="closePrompt()"></div>

    <div class="prompt-modal" id="promptModal">
        
        <div class="input-area" id="inputArea">
            <i class="ph-fill ph-sparkle magic-icon"></i>
            <input type="text" class="prompt-input" id="promptInput" 
                   placeholder="AI에게 필요한 자료를 물어보세요..." 
                   autocomplete="off" onkeypress="handleEnter(event)">
        </div>

        <div class="chips-area" id="chipsArea">
            <div class="chip" onclick="askChip('전략 보고서 찾아줘')"><i class="ph ph-magnifying-glass"></i> 전략 보고서</div>
            <div class="chip" onclick="askChip('PPT 템플릿 있어?')"><i class="ph ph-presentation"></i> PPT 템플릿</div>
            <div class="chip" onclick="askChip('다운로드 오류 해결법')"><i class="ph ph-warning-circle"></i> 다운로드 오류</div>
        </div>

        <div class="result-area" id="resultArea">
            <div class="result-content" id="resultContent"></div>
        </div>
    </div>
`;
document.body.insertAdjacentHTML('beforeend', html);


// ============================================================
// 4. 로직 (Logic)
// ============================================================

const overlay = document.getElementById('promptOverlay');
const modal = document.getElementById('promptModal');
const input = document.getElementById('promptInput');
const resultArea = document.getElementById('resultArea');
const resultContent = document.getElementById('resultContent');
const chipsArea = document.getElementById('chipsArea');

// 1. 창 열기
window.openPrompt = function() {
    overlay.style.display = 'block';
    modal.style.display = 'flex';
    
    // 애니메이션 딜레이
    setTimeout(() => {
        overlay.style.opacity = '1';
        modal.style.transform = 'translateX(-50%) translateY(0)';
        modal.style.opacity = '1';
        input.focus();
    }, 10);
}

// 2. 창 닫기
window.closePrompt = function() {
    overlay.style.opacity = '0';
    modal.style.opacity = '0';
    modal.style.transform = 'translateX(-50%) translateY(20px)';

    setTimeout(() => {
        overlay.style.display = 'none';
        modal.style.display = 'none';
        resetPrompt(); // 닫으면 초기화
    }, 300);
}

// 3. 엔터키 처리
window.handleEnter = function(e) {
    if (e.key === 'Enter') runAI();
}

// 4. 칩 클릭 처리
window.askChip = function(question) {
    input.value = question;
    runAI();
}

// 5. AI 실행 (데모)
function runAI() {
    const text = input.value.trim();
    if (!text) return;

    // UI 변경
    chipsArea.style.display = 'none'; // 칩 숨김
    document.getElementById('inputArea').classList.add('has-result'); // 구분선 추가
    resultArea.classList.add('show'); // 결과창 펼치기
    resultContent.innerHTML = '<span style="color:#64748b">AI가 데이터를 분석 중입니다... <span class="blinking-cursor"></span></span>';

    // 1.5초 딜레이 후 답변 출력 (스트리밍 효과 흉내)
    setTimeout(() => {
        let answer = MOCK_ANSWERS[Math.floor(Math.random() * MOCK_ANSWERS.length)];
        
        // 간단한 키워드 매칭
        if (text.includes("보고서") || text.includes("전략")) answer = MOCK_ANSWERS[0];
        else if (text.includes("그래픽") || text.includes("디자인")) answer = MOCK_ANSWERS[1];
        else if (text.includes("다운")) answer = MOCK_ANSWERS[2];

        // 타이핑 효과 함수 호출
        typeWriter(answer);
    }, 1200);
}

// 6. 타이핑 효과 (한 글자씩 출력)
function typeWriter(htmlText) {
    resultContent.innerHTML = ""; // 초기화
    let i = 0;
    
    // HTML 태그가 있어서 그냥 innerText로 하면 안됨.
    // 여기서는 간단하게 통째로 넣고 Fade In 효과를 줍시다.
    resultContent.style.opacity = 0;
    resultContent.innerHTML = htmlText;
    
    // 페이드 인
    let op = 0.1;
    let timer = setInterval(function () {
        if (op >= 1){
            clearInterval(timer);
        }
        resultContent.style.opacity = op;
        resultContent.style.filter = `blur(${(1-op)*5}px)`; // 블러 효과도 살짝
        op += op * 0.1;
    }, 30);
}

// 7. 초기화
function resetPrompt() {
    input.value = '';
    resultArea.classList.remove('show');
    document.getElementById('inputArea').classList.remove('has-result');
    chipsArea.style.display = 'flex';
    resultContent.innerHTML = '';
}

// 단축키 (Cmd/Ctrl + K) 지원
document.addEventListener('keydown', (e) => {
    if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        if (modal.style.display === 'flex') closePrompt();
        else openPrompt();
    }
    if (e.key === 'Escape') closePrompt();
});