const TARGET_DOMAIN = "hancom.com";

// ============================================================
// 🎨 2. 로그인 UI (스타일 및 HTML)
// 🎨 2. 로그인 UI (Apple 감성 글래스모피즘)
// ============================================================
const loginStyle = `
<style>
    /* 처음에 하얀 배경으로 화면을 덮음 */
    .login-overlay { position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: #f8fafc; z-index: 99999; display: flex; align-items: center; justify-content: center; transition: opacity 0.5s ease; }
    /* 1. 배경: 강력한 블러 효과로 뒤를 완전히 흐리게 (iOS 스타일) */
    .apple-overlay { 
        position: fixed; top: 0; left: 0; width: 100%; height: 100%; 
        background: rgba(245, 245, 247, 0.6); /* 아주 연한 회색 반투명 */
        backdrop-filter: blur(25px) saturate(180%); 
        -webkit-backdrop-filter: blur(25px) saturate(180%);
        z-index: 99999; display: flex; align-items: center; justify-content: center; 
        transition: opacity 0.6s cubic-bezier(0.16, 1, 0.3, 1); 
    }
   
    /* ⭐ 핵심: 로그인 박스를 처음엔 투명하게(opacity: 0) 숨겨둠 */
    .login-box { background: white; padding: 40px; border-radius: 24px; box-shadow: 0 20px 60px rgba(0,0,0,0.1); width: 380px; text-align: center; font-family: 'Pretendard', sans-serif; border: 1px solid #e2e8f0; opacity: 0; transform: translateY(20px); transition: all 0.4s ease; pointer-events: none; }
    /* 2. 모달 박스: 부드러운 곡선과 은은한 그림자 */
    .apple-modal { 
        background: rgba(255, 255, 255, 0.75); 
        padding: 48px 40px; 
        border-radius: 32px; /* 애플 특유의 둥근 모서리 */
        box-shadow: 0 20px 60px rgba(0, 0, 0, 0.08), 0 1px 3px rgba(0,0,0,0.02); 
        width: 380px; text-align: center; 
        font-family: 'Pretendard', -apple-system, BlinkMacSystemFont, sans-serif; 
        border: 1px solid rgba(255, 255, 255, 0.8); 
        
        /* 3. 등장 애니메이션 준비 (밑에서 위로 쓱-) */
        opacity: 0; 
        transform: translateY(30px) scale(0.95); 
        transition: all 0.7s cubic-bezier(0.16, 1, 0.3, 1); 
        pointer-events: none; 
    }
   
    /* 파이어베이스 확인이 끝나면 클래스를 추가해서 부드럽게 보여줌 */
    .login-box.show { opacity: 1; transform: translateY(0); pointer-events: auto; }
    .apple-modal.show { 
        opacity: 1; transform: translateY(0) scale(1); pointer-events: auto; 
    }
   
    .login-icon { font-size: 3rem; margin-bottom: 15px; }
    .login-title { font-size: 1.4rem; font-weight: 700; color: #1e293b; margin-bottom: 10px; }
    .login-desc { color: #64748b; font-size: 0.95rem; margin-bottom: 30px; line-height: 1.5; }
    .google-btn { display: flex; align-items: center; justify-content: center; gap: 10px; width: 100%; padding: 12px; border: 1px solid #cbd5e1; border-radius: 8px; background: white; color: #334155; font-weight: 600; font-size: 1rem; cursor: pointer; transition: 0.2s; }
    .google-btn:hover { background-color: #f8fafc; border-color: #94a3b8; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1); }
    .google-icon { width: 20px; height: 20px; }
    /* 4. 내부 요소 디자인 */
    .apple-icon-wrapper {
        width: 64px; height: 64px; margin: 0 auto 20px;
        background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
        border-radius: 20px; display: flex; align-items: center; justify-content: center;
        box-shadow: inset 0 2px 4px rgba(255,255,255,0.8), 0 4px 10px rgba(0,0,0,0.05);
    }
    .apple-icon-wrapper i { font-size: 2rem; color: #334155; }
   
    .hidden { opacity: 0; pointer-events: none; display: none !important; }
    .apple-title { font-size: 1.5rem; font-weight: 700; color: #1d1d1f; margin-bottom: 12px; letter-spacing: -0.5px; }
    .apple-desc { color: #86868b; font-size: 0.95rem; margin-bottom: 36px; line-height: 1.5; font-weight: 500; }
    .apple-desc strong { color: #1d1d1f; }
    
    /* 5. 버튼: 누를 때 살짝 들어가는 햅틱(Haptic) 느낌 */
    .apple-btn { 
        display: flex; align-items: center; justify-content: center; gap: 12px; 
        width: 100%; padding: 16px; border: none; border-radius: 16px; 
        background: #ffffff; color: #1d1d1f; font-weight: 600; font-size: 1.05rem; 
        cursor: pointer; 
        box-shadow: 0 4px 14px rgba(0, 0, 0, 0.05), 0 1px 2px rgba(0,0,0,0.02);
        transition: all 0.2s cubic-bezier(0.25, 0.1, 0.25, 1); 
    }
    .apple-btn:hover { box-shadow: 0 6px 20px rgba(0, 0, 0, 0.08); transform: translateY(-1px); }
    .apple-btn:active { transform: scale(0.97); box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04); } /* 딸깍! */
    .google-icon { width: 22px; height: 22px; }
    
    .hidden { opacity: 0 !important; pointer-events: none; display: none !important; }
</style>
`;

const loginHtml = `
    <div class="login-overlay" id="loginOverlay">
        <div class="login-box" id="loginBox">
            <div class="login-icon">🏢</div>
            <h2 class="login-title">디자인 라이브러리</h2>
            <p class="login-desc">사내 보안 규정에 따라<br><strong>@hancom.com</strong> 계정으로만 접근 가능합니다.</p>
    <div class="apple-overlay" id="loginOverlay">
        <div class="apple-modal" id="loginBox">
            <div class="apple-icon-wrapper">
                <i class="ph-fill ph-fingerprint"></i>
            </div>
            <h2 class="apple-title">Design Library</h2>
            <p class="apple-desc">보안을 위해 사내 워크스페이스 계정<br>(<strong>@hancom.com</strong>)으로 인증해 주세요.</p>
           
            <button class="google-btn" id="googleLoginBtn">
            <button class="apple-btn" id="googleLoginBtn">
               <img src="https://upload.wikimedia.org/wikipedia/commons/c/c1/Google_%22G%22_logo.svg" class="google-icon">
                사내 계정으로 로그인
                <span>Google로 계속하기</span>
           </button>
       </div>
   </div>
`;

// ============================================================
// ⚙️ 3. Firebase 로그인 로직
// ⚙️ 3. Firebase 로그인 로직 (이전과 100% 동일)
// ============================================================
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getAuth, signInWithPopup, GoogleAuthProvider, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
@@ -90,18 +133,18 @@ onAuthStateChanged(auth, (user) => {
if (user) {
if (user.email.endsWith("@" + TARGET_DOMAIN)) {
console.log("✅ 인증 완료:", user.email);
            overlay.classList.add('hidden'); // 로그인 성공! 하얀 도화지 치우기
            overlay.classList.add('hidden');
document.body.style.overflow = 'auto';
updateHeaderWithUser(user.email);
} else {
signOut(auth);
alert("허용되지 않은 도메인입니다.");
            loginBox.classList.add('show'); // 쫓겨나면 로그인 창 다시 보여줌
            loginBox.classList.add('show');
}
} else {
        // ⭐ 로그아웃 상태인 게 '확실'해지면 그때 숨겨뒀던 박스를 스르륵 보여줌
overlay.classList.remove('hidden');
        loginBox.classList.add('show'); 
        // 아주 살짝 지연을 줘서 애니메이션이 렌더링될 틈을 줍니다.
        setTimeout(() => { loginBox.classList.add('show'); }, 50); 
}
});
