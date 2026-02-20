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
provider.setCustomParameters({ hd: TARGET_DOMAIN, prompt: 'select_account' });

// 디자인 자산
const REAL_DESIGN_HTML = `
    <section class="text-hero">
        <h1 class="hero-title">AI Design Library</h1>
        <p class="hero-subtitle">기획총괄 전용 디자인 자산 시스템</p>
    </section>
    <div class="main-visual-full"></div>
    <div class="container">
        <div class="grid-wrapper">
            <div onclick="location.href='sublist.html'" class="card">
                <div class="icon-box"><i class="ph-fill ph-file-text"></i></div>
                <h3>보고서 에셋</h3>
                <p>표준 템플릿 리스트로 이동합니다.</p>
            </div>
            </div>
    </div>
`;

// 🌟 지문 로그인 팝업 (디자이너님 취향저격 버전)
const loginHtml = `
    <div class="apple-overlay" id="loginOverlay" style="display:none; position:fixed; top:0; left:0; width:100%; height:100%; background:rgba(245,245,247,0.8); backdrop-filter:blur(20px); -webkit-backdrop-filter:blur(20px); z-index:99999; align-items:center; justify-content:center;">
        <div class="apple-modal" style="background:#fff; padding:50px; border-radius:32px; text-align:center; box-shadow:0 20px 60px rgba(0,0,0,0.1); width:380px;">
            <div style="font-size:3rem; margin-bottom:20px;"><i class="ph-fill ph-fingerprint"></i></div>
            <h2 style="margin-bottom:10px;">인증 필요</h2>
            <p style="color:#86868b; margin-bottom:32px;">@hancom.com 계정으로 로그인하세요.</p>
            <button id="googleLoginBtn" style="width:100%; padding:16px; border-radius:16px; border:none; background:#1d1d1f; color:#fff; font-weight:600; cursor:pointer;">Google 로그인</button>
        </div>
    </div>
`;
document.body.insertAdjacentHTML('beforeend', loginHtml);

onAuthStateChanged(auth, async (user) => {
    const main = document.getElementById('mainContent');
    const subBody = document.getElementById('subPageContent'); // 서브페이지용 본문 ID
    const overlay = document.getElementById('loginOverlay');

    if (user) {
        // 🛡️ [강력 보안] 도메인이 hancom.com이 아니면 즉시 로그아웃
        if (!user.email.endsWith("@" + TARGET_DOMAIN)) {
            alert("한컴 계정만 접근 가능합니다.");
            await signOut(auth);
            location.reload();
            return;
        }

        // ✅ 인증 성공 시
        if (main) { main.innerHTML = REAL_DESIGN_HTML; main.style.display = 'block'; }
        if (subBody) { subBody.style.visibility = 'visible'; subBody.style.opacity = '1'; }
        overlay.style.display = 'none';
        document.getElementById('userEmailDisplay').innerText = user.email.split('@')[0];
        document.getElementById('userGreeting').style.display = 'block';
        document.getElementById('logoutBtn').style.display = 'block';
        document.body.style.overflow = 'auto';
    } else {
        // ❌ 미인증 시
        if (main) main.innerHTML = '';
        if (subBody) subBody.style.visibility = 'hidden';
        overlay.style.display = 'flex';
        document.body.style.overflow = 'hidden';
    }
});

document.getElementById('googleLoginBtn').onclick = () => signInWithPopup(auth, provider);
window.handleLogout = () => signOut(auth).then(() => location.href = 'home.html');