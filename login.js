import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getAuth, signInWithPopup, GoogleAuthProvider, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

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
const provider = new GoogleAuthProvider();
provider.setCustomParameters({ hd: TARGET_DOMAIN });

// 🌟 Genspark 스타일의 메인 콘텐츠
const REAL_DESIGN_HTML = `
    <section class="text-hero">
        <h1 class="hero-title">어떤 디자인을 찾으세요?</h1>
        <p class="hero-subtitle">한컴의 모든 디자인 에셋을 AI로 검색해 보세요.</p>
        
        <div class="search-container">
            <div class="search-wrapper">
                <i class="ph ph-sparkle" style="font-size:28px; color:#ff0080"></i>
                <input type="text" class="search-input" placeholder="필요한 문구나 이미지를 설명해 주세요...">
                <button class="search-btn">Ask AI</button>
            </div>
            
            <div class="icon-nav-wrapper">
                <div class="icon-nav-item" data-tooltip="보고서 에셋" onclick="location.href='sublist.html?cat=report'">
                    <i class="ph-fill ph-file-text"></i>
                </div>
                <div class="icon-nav-item" data-tooltip="그래픽 소스" onclick="location.href='sublist.html?cat=graphic'">
                    <i class="ph-fill ph-palette"></i>
                </div>
                <div class="icon-nav-item" data-tooltip="표준 템플릿" onclick="location.href='sublist.html?cat=docs'">
                    <i class="ph-fill ph-files"></i>
                </div>
                <div class="icon-nav-item" data-tooltip="아이콘 라이브러리" onclick="location.href='sublist.html?cat=icons'">
                    <i class="ph-fill ph-shapes"></i>
                </div>
                <div class="icon-nav-item" data-tooltip="시각화 자료" onclick="location.href='sublist.html?cat=data'">
                    <i class="ph-fill ph-chart-bar"></i>
                </div>
            </div>
        </div>
    </section>

    <div class="main-visual-full">
        <div class="visual-overlay"></div>
    </div>
    
    <div class="container" style="margin-top: -80px; text-align:center;">
        <span style="background:rgba(255,255,255,0.8); padding:8px 20px; border-radius:50px; font-size:0.85rem; color:var(--text-sub); border:1px solid #e2e8f0; backdrop-filter:blur(10px);">
            🔥 Trending: 2026 한컴 브랜드 킷 신규 배포
        </span>
    </div>
`;

const loginStyle = `
<style>
    .apple-overlay { position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(245, 245, 247, 0.6); backdrop-filter: blur(25px) saturate(180%); z-index: 99999; display: flex; align-items: center; justify-content: center; }
    .apple-modal { background: rgba(255, 255, 255, 0.85); padding: 50px; border-radius: 32px; box-shadow: 0 20px 60px rgba(0,0,0,0.1); width: 400px; text-align: center; border: 1px solid #fff; opacity: 0; transform: translateY(20px); transition: 0.5s; font-family: 'Pretendard', sans-serif; }
    .apple-modal.show { opacity: 1; transform: translateY(0); }
    .apple-icon { width: 64px; height: 64px; background: #fff; border-radius: 20px; margin: 0 auto 24px; display: flex; align-items: center; justify-content: center; box-shadow: 0 5px 15px rgba(0,0,0,0.05); }
    .apple-btn { width: 100%; padding: 16px; border-radius: 16px; border: none; background: #fff; color: #1d1d1f; font-weight: 600; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 12px; box-shadow: 0 2px 10px rgba(0,0,0,0.05); transition: 0.2s; }
    .apple-btn:active { transform: scale(0.98); }
</style>
`;

document.head.insertAdjacentHTML('beforeend', loginStyle);
document.body.insertAdjacentHTML('beforeend', `
    <div class="apple-overlay" id="loginOverlay" style="display:none;">
        <div class="apple-modal" id="loginBox">
            <div class="apple-icon"><i class="ph-fill ph-fingerprint" style="font-size: 32px;"></i></div>
            <h2 style="margin-bottom:12px;">Design Library</h2>
            <p style="color:#86868b; margin-bottom:32px; line-height:1.5;">한컴 계정으로 인증 후<br>이용 가능합니다.</p>
            <button class="apple-btn" id="googleLoginBtn">
                <img src="https://upload.wikimedia.org/wikipedia/commons/c/c1/Google_%22G%22_logo.svg" width="20">
                Google로 로그인
            </button>
        </div>
    </div>
`);

onAuthStateChanged(auth, (user) => {
    const main = document.getElementById('mainContent');
    const overlay = document.getElementById('loginOverlay');
    const loginBox = document.getElementById('loginBox');
    const userPhoto = document.getElementById('userPhoto');

    if (user && user.email.endsWith("@" + TARGET_DOMAIN)) {
        main.innerHTML = REAL_DESIGN_HTML;
        main.style.display = 'block';
        overlay.style.display = 'none';
        
        document.getElementById('userEmailDisplay').innerText = user.email.split('@')[0];
        
        if (user.photoURL && userPhoto) {
            userPhoto.src = user.photoURL;
        }

        document.getElementById('userGreeting').style.display = 'flex';
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

document.getElementById('googleLoginBtn').onclick = () => signInWithPopup(auth, provider);
window.handleLogout = () => signOut(auth).then(() => location.reload());