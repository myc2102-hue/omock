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
// 🎨 2. 로그인 UI (스타일 및 HTML)
// ============================================================
const loginStyle = `
<style>
    /* 처음에 하얀 배경으로 화면을 덮음 */
    .login-overlay { position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: #f8fafc; z-index: 99999; display: flex; align-items: center; justify-content: center; transition: opacity 0.5s ease; }
    
    /* ⭐ 핵심: 로그인 박스를 처음엔 투명하게(opacity: 0) 숨겨둠 */
    .login-box { background: white; padding: 40px; border-radius: 24px; box-shadow: 0 20px 60px rgba(0,0,0,0.1); width: 380px; text-align: center; font-family: 'Pretendard', sans-serif; border: 1px solid #e2e8f0; opacity: 0; transform: translateY(20px); transition: all 0.4s ease; pointer-events: none; }
    
    /* 파이어베이스 확인이 끝나면 클래스를 추가해서 부드럽게 보여줌 */
    .login-box.show { opacity: 1; transform: translateY(0); pointer-events: auto; }
    
    .login-icon { font-size: 3rem; margin-bottom: 15px; }
    .login-title { font-size: 1.4rem; font-weight: 700; color: #1e293b; margin-bottom: 10px; }
    .login-desc { color: #64748b; font-size: 0.95rem; margin-bottom: 30px; line-height: 1.5; }
    .google-btn { display: flex; align-items: center; justify-content: center; gap: 10px; width: 100%; padding: 12px; border: 1px solid #cbd5e1; border-radius: 8px; background: white; color: #334155; font-weight: 600; font-size: 1rem; cursor: pointer; transition: 0.2s; }
    .google-btn:hover { background-color: #f8fafc; border-color: #94a3b8; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1); }
    .google-icon { width: 20px; height: 20px; }
    
    .hidden { opacity: 0; pointer-events: none; display: none !important; }
</style>
`;

const loginHtml = `
    <div class="login-overlay" id="loginOverlay">
        <div class="login-box" id="loginBox">
            <div class="login-icon">🏢</div>
            <h2 class="login-title">디자인 라이브러리</h2>
            <p class="login-desc">사내 보안 규정에 따라<br><strong>@hancom.com</strong> 계정으로만 접근 가능합니다.</p>
            
            <button class="google-btn" id="googleLoginBtn">
                <img src="https://upload.wikimedia.org/wikipedia/commons/c/c1/Google_%22G%22_logo.svg" class="google-icon">
                사내 계정으로 로그인
            </button>
        </div>
    </div>
`;

// ============================================================
// ⚙️ 3. Firebase 로그인 로직
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
            overlay.classList.add('hidden'); // 로그인 성공! 하얀 도화지 치우기
            document.body.style.overflow = 'auto';
            updateHeaderWithUser(user.email);
        } else {
            signOut(auth);
            alert("허용되지 않은 도메인입니다.");
            loginBox.classList.add('show'); // 쫓겨나면 로그인 창 다시 보여줌
        }
    } else {
        // ⭐ 로그아웃 상태인 게 '확실'해지면 그때 숨겨뒀던 박스를 스르륵 보여줌
        overlay.classList.remove('hidden');
        loginBox.classList.add('show'); 
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