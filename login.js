// ============================================================
// 🔥 1. Firebase 설정
// ============================================================
const firebaseConfig = {
    apiKey: "AIzaSyC6InSfqD5e5CrM1KCQuHFL3OSgetiT3kw",
    authDomain: "omockyc.firebaseapp.com",
    databaseURL: "https://omockyc-default-rtdb.firebaseio.com",
    projectId: "omockyc",
    storageBucket: "omockyc.firebasestorage.app",
    messagingSenderId: "336747857928",
    appId: "1:336747857928:web:b4073ad87b47aafea2e9bd",
    measurementId: "G-86DVKJTXV2"
};

const TARGET_DOMAIN = "hancom.com";

// ============================================================
// 🎨 2. 로그인 UI (Apple 감성 글래스모피즘)
// ============================================================
const loginStyle = `
<style>
    /* 1. 배경: 강력한 블러 효과로 뒤를 완전히 흐리게 (iOS 스타일) */
    .apple-overlay { 
        position: fixed; top: 0; left: 0; width: 100%; height: 100%; 
        background: rgba(245, 245, 247, 0.6); /* 아주 연한 회색 반투명 */
        backdrop-filter: blur(25px) saturate(180%); 
        -webkit-backdrop-filter: blur(25px) saturate(180%);
        z-index: 99999; display: flex; align-items: center; justify-content: center; 
        transition: opacity 0.6s cubic-bezier(0.16, 1, 0.3, 1); 
    }
    
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
    
    .apple-modal.show { 
        opacity: 1; transform: translateY(0) scale(1); pointer-events: auto; 
    }
    
    /* 4. 내부 요소 디자인 */
    .apple-icon-wrapper {
        width: 64px; height: 64px; margin: 0 auto 20px;
        background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
        border-radius: 20px; display: flex; align-items: center; justify-content: center;
        box-shadow: inset 0 2px 4px rgba(255,255,255,0.8), 0 4px 10px rgba(0,0,0,0.05);
    }
    .apple-icon-wrapper i { font-size: 2rem; color: #334155; }
    
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
    <div class="apple-overlay" id="loginOverlay">
        <div class="apple-modal" id="loginBox">
            <div class="apple-icon-wrapper">
                <i class="ph-fill ph-fingerprint"></i>
            </div>
            <h2 class="apple-title">Design Library</h2>
            <p class="apple-desc">보안을 위해 사내 워크스페이스 계정<br>(<strong>@hancom.com</strong>)으로 인증해 주세요.</p>
            
            <button class="apple-btn" id="googleLoginBtn">
                <img src="https://upload.wikimedia.org/wikipedia/commons/c/c1/Google_%22G%22_logo.svg" class="google-icon">
                <span>Google로 계속하기</span>
            </button>
        </div>
    </div>
`;

// ============================================================
// ⚙️ 3. Firebase 로그인 로직 (이전과 100% 동일)
// ============================================================
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getAuth, signInWithPopup, GoogleAuthProvider, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const provider = new GoogleAuthProvider();

provider.setCustomParameters({ hd: TARGET_DOMAIN });

document.head.insertAdjacentHTML('beforeend', loginStyle);
document.body.insertAdjacentHTML('beforeend', loginHtml);

const overlay = document.getElementById('loginOverlay');
const loginBox = document.getElementById('loginBox');
document.body.style.overflow = 'hidden';

function updateHeaderWithUser(email) {
    const emailDisplay = document.getElementById('userEmailDisplay');
    const greeting = document.getElementById('userGreeting');
    const logoutBtn = document.getElementById('logoutBtn');

    if (emailDisplay && greeting && logoutBtn) {
        emailDisplay.innerText = email;
        greeting.style.display = 'block';
        logoutBtn.style.display = 'block';
    }
}

// 1. 접속 시 로그인 상태 확인
onAuthStateChanged(auth, (user) => {
    if (user) {
        if (user.email.endsWith("@" + TARGET_DOMAIN)) {
            console.log("✅ 인증 완료:", user.email);
            overlay.classList.add('hidden');
            document.body.style.overflow = 'auto';
            updateHeaderWithUser(user.email);
        } else {
            signOut(auth);
            alert("허용되지 않은 도메인입니다.");
            loginBox.classList.add('show');
        }
    } else {
        overlay.classList.remove('hidden');
        // 아주 살짝 지연을 줘서 애니메이션이 렌더링될 틈을 줍니다.
        setTimeout(() => { loginBox.classList.add('show'); }, 50); 
    }
});

// 2. 로그인 버튼 클릭
document.getElementById('googleLoginBtn').addEventListener('click', async () => {
    try {
        const result = await signInWithPopup(auth, provider);
        const user = result.user;
        
        if (user.email.endsWith("@" + TARGET_DOMAIN)) {
            overlay.classList.add('hidden');
            document.body.style.overflow = 'auto';
            updateHeaderWithUser(user.email);
            
            const name = user.displayName || user.email.split('@')[0];
            alert(`환영합니다! ${name}님`);
        } else {
            await signOut(auth);
            alert(`⛔ 오직 @${TARGET_DOMAIN} 계정만 접속할 수 있습니다.`);
        }
    } catch (error) {
        console.error("로그인 에러:", error);
        if (error.code !== 'auth/popup-closed-by-user') {
            alert("로그인 중 문제가 발생했습니다.");
        }
    }
});

// ============================================================
// 🚪 4. 글로벌 함수 (HTML에서 직접 호출)
// ============================================================
window.handleLogout = function() {
    signOut(auth).then(() => {
        location.reload(); 
    });
};

const APPROVAL_LIMIT = 100;
window.tryDownload = function(itemTitle, itemPrice, downloadUrl) {
    if (itemPrice < APPROVAL_LIMIT) {
        alert(`[자동 승인] '${itemTitle}' ($${itemPrice})\n보안 검사 없이 다운로드됩니다.`);
        window.open(downloadUrl, '_blank');
        return;
    }

    const user = auth.currentUser;
    if (user && user.email.endsWith("@" + TARGET_DOMAIN)) {
        alert(`[보안 확인 완료] '${itemTitle}' ($${itemPrice})\n관리자(${user.email}) 승인 하에 다운로드합니다.`);
        window.open(downloadUrl, '_blank');
    } else {
        alert(`⚠️ 고액 자료($${itemPrice})는 권한이 필요합니다.\n로그인해 주세요.`);
        overlay.classList.remove('hidden');
        loginBox.classList.add('show');
        document.body.style.overflow = 'hidden';
    }
};