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

// 🌟 그리드 카드를 여러 개로 확장 (깨짐 방지 구조)
const REAL_DESIGN_HTML = `
    <section class="text-hero">
        <h1 class="hero-title">AI 업무 효율을 위한,<br>디자인 라이브러리</h1>
        <p class="hero-subtitle">최적화된 디자인 자산을 한곳에서 관리하세요.</p>
    </section>
    <div class="main-visual-full"></div>
    <div class="container">
        <div class="grid-wrapper">
            <div onclick="location.href='sublist.html?cat=report'" class="card">
                <div class="icon-box"><i class="ph-fill ph-file-text"></i></div>
                <h3>보고서 에셋</h3>
                <p>표준 보고서 레이아웃과 제안서 템플릿 모음입니다.</p>
            </div>
            <div onclick="location.href='sublist.html?cat=graphic'" class="card">
                <div class="icon-box"><i class="ph-fill ph-palette"></i></div>
                <h3>그래픽 디자인</h3>
                <p>고해상도 이미지 및 일러스트 자산 라이브러리입니다.</p>
            </div>
            <div onclick="location.href='sublist.html?cat=docs'" class="card">
                <div class="icon-box"><i class="ph-fill ph-files"></i></div>
                <h3>문서 템플릿</h3>
                <p>실무 협업을 위한 다양한 문서 양식입니다.</p>
            </div>
            <div onclick="location.href='sublist.html?cat=icons'" class="card">
                <div class="icon-box"><i class="ph-fill ph-shapes"></i></div>
                <h3>아이콘 리소스</h3>
                <p>브랜드 가이드라인에 맞춘 아이콘 셋입니다.</p>
            </div>
        </div>
    </div>
`;

// 애플 스타일 로그인 창 (디자인 유지)
const loginHtml = `
    <div class="apple-overlay" id="loginOverlay" style="display:none; position:fixed; top:0; left:0; width:100%; height:100%; background:rgba(245,245,247,0.75); backdrop-filter:blur(20px); -webkit-backdrop-filter:blur(20px); z-index:99999; align-items:center; justify-content:center;">
        <div class="apple-modal" style="background:#fff; padding:50px; border-radius:32px; text-align:center; box-shadow:0 20px 60px rgba(0,0,0,0.1); width:380px;">
            <div style="font-size:3rem; margin-bottom:20px;">🛡️</div>
            <h2 style="margin-bottom:10px;">Security Check</h2>
            <p style="color:#86868b; margin-bottom:32px; font-size:0.95rem;">한컴 임직원 인증이 필요합니다.</p>
            <button id="googleLoginBtn" style="width:100%; padding:16px; border-radius:16px; border:none; background:#1d1d1f; color:#fff; font-weight:600; cursor:pointer; display:flex; align-items:center; justify-content:center; gap:12px;">
                <img src="https://upload.wikimedia.org/wikipedia/commons/c/c1/Google_%22G%22_logo.svg" width="20"> Google 로그인
            </button>
        </div>
    </div>
`;
document.body.insertAdjacentHTML('beforeend', loginHtml);

onAuthStateChanged(auth, (user) => {
    const main = document.getElementById('mainContent');
    const overlay = document.getElementById('loginOverlay');

    if (user && user.email.endsWith("@" + TARGET_DOMAIN)) {
        if (main) { main.innerHTML = REAL_DESIGN_HTML; main.style.display = 'block'; }
        overlay.style.display = 'none';
        document.getElementById('userEmailDisplay').innerText = user.email.split('@')[0];
        document.getElementById('userGreeting').style.display = 'block';
        document.getElementById('logoutBtn').style.display = 'block';
        document.body.style.overflow = 'auto';
    } else {
        if (main) main.innerHTML = '';
        overlay.style.display = 'flex';
        document.body.style.overflow = 'hidden';
    }
});

document.getElementById('googleLoginBtn').onclick = () => signInWithPopup(auth, provider);
window.handleLogout = () => signOut(auth).then(() => location.href = 'home.html');