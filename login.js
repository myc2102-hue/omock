import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getAuth, signInWithPopup, GoogleAuthProvider, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { getStorage, ref, getDownloadURL } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-storage.js";

const firebaseConfig = {
    apiKey: "AIzaSyC6InSfqD5e5CrM1KCQuHFL3OSgetiT3kw",
    authDomain: "omockyc.firebaseapp.com",
    projectId: "omockyc",
    storageBucket: "omockyc.firebasestorage.app",
    appId: "1:336747857928:web:b4073ad87b47aafea2e9bd"
};

const TARGET_DOMAIN = "hancom.com";
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const storage = getStorage(app);
const provider = new GoogleAuthProvider();
provider.setCustomParameters({ hd: TARGET_DOMAIN });

// 🌟 홈화면용 디자인 금고 (서브페이지에서는 무시됨)
const REAL_DESIGN_HTML = `
    <section class="text-hero">
        <h1 class="hero-title">AI 업무 효율을 위한,<br>기획총괄 디자인 라이브러리</h1>
        <p class="hero-subtitle">최적화된 워크플로우와 디자인 자산을 한곳에서 관리하세요.</p>
    </section>
    <div class="main-visual-full"><div class="visual-overlay"></div></div>
    <div class="container">
        <div class="section-header-glass"><div class="section-title">Resources</div><span class="section-badge">6 Items</span></div>
        <div class="grid-wrapper">
            <div onclick="tryDownload('보고서 에셋', 0, 'files/report.pptx')" class="card">
                <div class="icon-box"><i class="ph ph-file-text"></i></div>
                <h3>보고서 에셋</h3>
                <p>AI가 제안하는 레이아웃과 함께 전문적인 보고서를 빠르게 작성하세요.</p>
            </div>
            </div>
    </div>
`;

// 🌟 애플 지문 로그인창 스타일
const loginStyle = `
<style>
    .apple-overlay { position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(245, 245, 247, 0.6); backdrop-filter: blur(25px) saturate(180%); -webkit-backdrop-filter: blur(25px) saturate(180%); z-index: 99999; display: flex; align-items: center; justify-content: center; transition: opacity 0.5s; }
    .apple-modal { background: rgba(255, 255, 255, 0.75); padding: 48px; border-radius: 32px; box-shadow: 0 20px 60px rgba(0,0,0,0.1); width: 380px; text-align: center; border: 1px solid rgba(255,255,255,0.8); opacity: 0; transform: translateY(20px); transition: 0.5s; font-family: 'Pretendard', sans-serif; }
    .apple-modal.show { opacity: 1; transform: translateY(0); }
    .apple-icon-wrapper { width: 64px; height: 64px; margin: 0 auto 24px; background: #fff; border-radius: 20px; display: flex; align-items: center; justify-content: center; box-shadow: 0 8px 16px rgba(0,0,0,0.05); }
    .apple-icon-wrapper i { font-size: 32px; color: #1d1d1f; }
    .apple-title { font-size: 1.5rem; font-weight: 700; color: #1d1d1f; margin-bottom: 12px; }
    .apple-desc { color: #86868b; font-size: 0.95rem; margin-bottom: 32px; line-height: 1.5; }
    .apple-btn { width: 100%; padding: 16px; border-radius: 16px; border: none; background: #fff; color: #1d1d1f; font-weight: 600; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 12px; box-shadow: 0 4px 15px rgba(0,0,0,0.05); transition: 0.2s; font-size: 1rem; }
    .apple-btn:hover { background: #f5f5f7; }
    .apple-btn:active { transform: scale(0.97); }
</style>
`;

const loginHtml = `
    <div class="apple-overlay" id="loginOverlay" style="display:none;">
        <div class="apple-modal" id="loginBox">
            <div class="apple-icon-wrapper"><i class="ph-fill ph-fingerprint"></i></div>
            <h2 class="apple-title">Design Library</h2>
            <p class="apple-desc">보안을 위해 <strong>@hancom.com</strong> 계정으로<br>본인 인증이 필요합니다.</p>
            <button class="apple-btn" id="googleLoginBtn">
                <img src="https://upload.wikimedia.org/wikipedia/commons/c/c1/Google_%22G%22_logo.svg" width="20">
                Google로 계속하기
            </button>
        </div>
    </div>
`;

document.head.insertAdjacentHTML('beforeend', loginStyle);
document.body.insertAdjacentHTML('beforeend', loginHtml);

onAuthStateChanged(auth, (user) => {
    const main = document.getElementById('mainContent');
    const subBody = document.getElementById('subPageContent'); // 서브페이지용 본문 ID
    const overlay = document.getElementById('loginOverlay');
    const loginBox = document.getElementById('loginBox');

    if (user && user.email.endsWith("@" + TARGET_DOMAIN)) {
        // ✅ [인증 성공]
        if (main) { main.innerHTML = REAL_DESIGN_HTML; main.style.display = 'block'; }
        if (subBody) { subBody.style.visibility = 'visible'; subBody.style.opacity = '1'; }
        
        overlay.style.display = 'none';
        const emailDisp = document.getElementById('userEmailDisplay');
        if (emailDisp) emailDisp.innerText = user.email.split('@')[0];
        
        const greeting = document.getElementById('userGreeting');
        if (greeting) greeting.style.display = 'block';
        
        const logoutBtn = document.getElementById('logoutBtn');
        if (logoutBtn) logoutBtn.style.display = 'block';
        
        document.body.style.overflow = 'auto';
    } else {
        // ❌ [미인증]
        if (main) { main.innerHTML = ''; main.style.display = 'none'; }
        if (subBody) { subBody.style.visibility = 'hidden'; }
        
        overlay.style.display = 'flex';
        setTimeout(() => loginBox.classList.add('show'), 50);
        document.body.style.overflow = 'hidden';
    }
});

document.getElementById('googleLoginBtn').onclick = () => signInWithPopup(auth, provider);
window.handleLogout = () => signOut(auth).then(() => location.reload());

window.tryDownload = function(title, price, path) {
    const user = auth.currentUser;
    if (price >= 100 && (!user || !user.email.endsWith("@" + TARGET_DOMAIN))) {
        alert("⚠️ 고액 자료 권한이 필요합니다.");
        return;
    }
    const fileRef = ref(storage, path);
    getDownloadURL(fileRef).then(url => window.open(url, '_blank')).catch(() => alert("⛔ 접근 권한이 없습니다."));
};