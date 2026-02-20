import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getAuth, signInWithPopup, GoogleAuthProvider, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { getStorage, ref, getDownloadURL } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-storage.js";

// 1. Firebase 설정
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

// 🌟 2. [디자인 금고] 로그인 성공 전에는 어디에도 존재하지 않는 데이터
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
            <div onclick="tryDownload('그래픽 디자인', 0, 'files/graphic.zip')" class="card">
                <div class="icon-box"><i class="ph ph-palette"></i></div>
                <h3>그래픽 디자인</h3>
                <p>즉시 활용 가능한 고퀄리티 그래픽 소스 모음입니다.</p>
            </div>
            <div onclick="tryDownload('문서 템플릿', 0, 'files/docs.zip')" class="card">
                <div class="icon-box"><i class="ph ph-files"></i></div>
                <h3>문서 템플릿</h3>
                <p>실무 표준에 맞춘 다양한 포맷의 문서 템플릿입니다.</p>
            </div>
            <div onclick="tryDownload('아이콘 에셋', 0, 'files/icons.zip')" class="card">
                <div class="icon-box"><i class="ph ph-shapes"></i></div>
                <h3>아이콘 에셋</h3>
                <p>다양한 스타일의 벡터 아이콘 라이브러리입니다.</p>
            </div>
            <div onclick="tryDownload('데이터 시각화', 150, 'files/data.zip')" class="card">
                <div class="icon-box"><i class="ph ph-chart-bar"></i></div>
                <h3>데이터 시각화 자료</h3>
                <p>차트, 도표 및 인포그래픽 디자인 킷입니다.</p>
            </div>
            <div onclick="tryDownload('기타 자료', 0, 'files/etc.zip')" class="card">
                <div class="icon-box"><i class="ph ph-folder-open"></i></div>
                <h3>기타 자료</h3>
                <p>폰트 가이드, 로고 등 업무에 필요한 모든 추가 리소스입니다.</p>
            </div>
        </div>
    </div>
`;

// 3. UI 스타일 및 HTML (Apple 컨셉)
const loginStyle = `
<style>
    .apple-overlay { position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(245, 245, 247, 0.6); backdrop-filter: blur(25px) saturate(180%); z-index: 99999; display: flex; align-items: center; justify-content: center; transition: opacity 0.5s; }
    .apple-modal { background: rgba(255, 255, 255, 0.75); padding: 48px; border-radius: 32px; box-shadow: 0 20px 60px rgba(0,0,0,0.1); width: 380px; text-align: center; border: 1px solid rgba(255,255,255,0.8); opacity: 0; transform: translateY(20px); transition: 0.5s; }
    .apple-modal.show { opacity: 1; transform: translateY(0); }
    .apple-btn { width: 100%; padding: 16px; border-radius: 16px; border: none; background: #fff; color: #1d1d1f; font-weight: 600; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 12px; box-shadow: 0 4px 15px rgba(0,0,0,0.05); transition: 0.2s; }
    .apple-btn:active { transform: scale(0.97); }
</style>
`;

document.head.insertAdjacentHTML('beforeend', loginStyle);
document.body.insertAdjacentHTML('beforeend', `
    <div class="apple-overlay" id="loginOverlay">
        <div class="apple-modal" id="loginBox">
            <div style="font-size:3rem; margin-bottom:20px;">🏢</div>
            <h2 style="margin-bottom:10px;">Design Library</h2>
            <p style="color:#86868b; margin-bottom:30px;"><strong>@hancom.com</strong> 계정으로 인증하세요.</p>
            <button class="apple-btn" id="googleLoginBtn">
                <img src="https://upload.wikimedia.org/wikipedia/commons/c/c1/Google_%22G%22_logo.svg" width="20">
                Google 로그인
            </button>
        </div>
    </div>
`);

const main = document.getElementById('mainContent');
const overlay = document.getElementById('loginOverlay');
const loginBox = document.getElementById('loginBox');

// 4. 인증 상태 감시 및 주입
onAuthStateChanged(auth, (user) => {
    if (user && user.email.endsWith("@" + TARGET_DOMAIN)) {
        main.innerHTML = REAL_DESIGN_HTML;
        main.style.display = 'block';
        overlay.style.display = 'none';
        document.getElementById('userEmailDisplay').innerText = user.email.split('@')[0];
        document.getElementById('userGreeting').style.display = 'block';
        document.getElementById('logoutBtn').style.display = 'block';
        document.body.style.overflow = 'auto';
    } else {
        main.innerHTML = '';
        main.style.display = 'none';
        overlay.style.display = 'flex';
        setTimeout(() => loginBox.classList.add('show'), 50);
        document.body.style.overflow = 'hidden';
    }
});

// 로그인 실행
document.getElementById('googleLoginBtn').onclick = () => signInWithPopup(auth, provider);

// 로그아웃
window.handleLogout = () => signOut(auth).then(() => location.reload());

// 99점짜리 보안 다운로드
window.tryDownload = function(title, price, path) {
    const user = auth.currentUser;
    if (price >= 100 && (!user || !user.email.endsWith("@" + TARGET_DOMAIN))) {
        alert("⚠️ 고액 자료 권한이 필요합니다.");
        return;
    }
    const fileRef = ref(storage, path);
    getDownloadURL(fileRef).then(url => window.open(url, '_blank')).catch(() => alert("⛔ 접근 권한이 없습니다."));
};