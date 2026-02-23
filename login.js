import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getAuth, signInWithPopup, GoogleAuthProvider, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

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
const provider = new GoogleAuthProvider();
provider.setCustomParameters({ hd: TARGET_DOMAIN });

// 🌟 2. [디자인 금고] 그라데이션 오버레이 태그 추가 복구
const REAL_DESIGN_HTML = `
    <section class="text-hero">
        <h1 class="hero-title">AI 업무 효율을 위한,<br>기획총괄 디자인 라이브러리</h1>
        <p class="hero-subtitle">최적화된 워크플로우와 디자인 자산을 한곳에서 관리하세요.</p>
    </section>
    
    <div class="main-visual-full">
        <div class="visual-overlay"></div>
    </div>
    
    <div class="container">
        <div class="grid-wrapper">
            <a href="sublist.html?category=report" class="card">
                <div class="icon-box"><i class="ph ph-file-text"></i></div>
                <h3>보고서 에셋</h3>
                <p>AI가 제안하는 레이아웃과 함께 전문적인 보고서를 빠르게 작성하세요.</p>
            </a>
            <a href="sublist.html?category=graphic" class="card">
                <div class="icon-box"><i class="ph ph-palette"></i></div>
                <h3>그래픽 디자인</h3>
                <p>즉시 활용 가능한 고퀄리티 그래픽 소스 모음입니다.</p>
            </a>
            <a href="sublist.html?category=docs" class="card">
                <div class="icon-box"><i class="ph ph-files"></i></div>
                <h3>문서 템플릿</h3>
                <p>실무 표준에 맞춘 다양한 포맷의 문서 템플릿입니다.</p>
            </a>
            <a href="sublist.html?category=icons" class="card">
                <div class="icon-box"><i class="ph ph-shapes"></i></div>
                <h3>아이콘 에셋</h3>
                <p>다양한 스타일의 벡터 아이콘 라이브러리입니다.</p>
            </a>
            <a href="sublist.html?category=data" class="card">
                <div class="icon-box"><i class="ph ph-chart-bar"></i></div>
                <h3>데이터 시각화 자료</h3>
                <p>차트, 도표 및 인포그래픽 디자인 킷입니다.</p>
            </a>
            <a href="sublist.html?category=etc" class="card">
                <div class="icon-box"><i class="ph ph-folder-open"></i></div>
                <h3>기타 자료</h3>
                <p>브랜드 가이드 등 업무에 필요한 모든 추가 리소스입니다.</p>
            </a>
        </div>
    </div>
`;

// 3. Apple 감성 UI 스타일
const loginStyle = `
<style>
    .apple-overlay { position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(245, 245, 247, 0.6); backdrop-filter: blur(25px) saturate(180%); z-index: 99999; display: flex; align-items: center; justify-content: center; transition: opacity 0.5s; }
    .apple-modal { background: rgba(255, 255, 255, 0.8); padding: 50px; border-radius: 30px; box-shadow: 0 20px 50px rgba(0,0,0,0.1); width: 400px; text-align: center; border: 1px solid #fff; opacity: 0; transform: translateY(20px); transition: 0.5s; font-family: 'Pretendard', sans-serif; }
    .apple-modal.show { opacity: 1; transform: translateY(0); }
    .apple-icon { width: 60px; height: 60px; background: #fff; border-radius: 18px; margin: 0 auto 20px; display: flex; align-items: center; justify-content: center; box-shadow: 0 5px 15px rgba(0,0,0,0.05); }
    .apple-btn { width: 100%; padding: 15px; border-radius: 15px; border: none; background: #fff; color: #1d1d1f; font-weight: 600; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.05); transition: 0.2s; }
    .apple-btn:active { transform: scale(0.98); }
</style>
`;

const loginHtml = `
    <div class="apple-overlay" id="loginOverlay">
        <div class="apple-modal" id="loginBox">
            <div class="apple-icon"><i class="ph-fill ph-fingerprint" style="font-size: 30px;"></i></div>
            <h2 style="margin-bottom:10px;">Design Library</h2>
            <p style="color:#86868b; margin-bottom:30px;">사내 계정으로 인증 후 이용 가능합니다.</p>
            <button class="apple-btn" id="googleLoginBtn">
                <img src="https://upload.wikimedia.org/wikipedia/commons/c/c1/Google_%22G%22_logo.svg" width="20">
                Google로 로그인
            </button>
        </div>
    </div>
`;

document.head.insertAdjacentHTML('beforeend', loginStyle);
document.body.insertAdjacentHTML('beforeend', loginHtml);

const main = document.getElementById('mainContent');
const overlay = document.getElementById('loginOverlay');
const loginBox = document.getElementById('loginBox');
const userPhoto = document.getElementById('userPhoto'); // 🌟 사진 태그 가져오기

// 4. 인증 상태 감시 (핵심 로직)
onAuthStateChanged(auth, (user) => {
    if (user && user.email.endsWith("@" + TARGET_DOMAIN)) {
        // ✅ [통과] 디자인 주입 및 화면 표시
        main.innerHTML = REAL_DESIGN_HTML;
        main.style.display = 'block';
        overlay.style.display = 'none';
        
        // 🌟 사용자 정보 업데이트
        document.getElementById('userEmailDisplay').innerText = user.email.split('@')[0];
        
        // 🌟 프로필 사진 주입
        if (user.photoURL && userPhoto) {
            userPhoto.src = user.photoURL;
            userPhoto.alt = user.displayName || 'Profile';
        }
        
        document.getElementById('userGreeting').style.display = 'flex'; // flex로 변경 (사진 정렬용)
        document.getElementById('logoutBtn').style.display = 'block';
        document.body.style.overflow = 'auto';
    } else {
        // ❌ [차단] 데이터 삭제 및 로그인 창 노출
        main.innerHTML = '';
        main.style.display = 'none';
        overlay.style.display = 'flex';
        setTimeout(() => loginBox.classList.add('show'), 50);
        document.body.style.overflow = 'hidden';
    }
});

// 로그인 버튼 이벤트
document.getElementById('googleLoginBtn').addEventListener('click', async () => {
    try {
        await signInWithPopup(auth, provider);
    } catch (e) {
        alert("로그인 중 오류가 발생했습니다.");
    }
});

// 로그아웃
window.handleLogout = function() {
    signOut(auth).then(() => location.reload());
};