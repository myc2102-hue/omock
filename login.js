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

// 🌟 지문 로그인 UI 주입
const loginHtml = `
    <div id="loginOverlay" style="position:fixed; top:0; left:0; width:100%; height:100%; background:rgba(245,245,247,0.7); backdrop-filter:blur(25px); -webkit-backdrop-filter:blur(25px); z-index:99999; display:flex; align-items:center; justify-content:center;">
        <div id="loginBox" style="background:rgba(255,255,255,0.8); padding:50px; border-radius:32px; box-shadow:0 20px 60px rgba(0,0,0,0.1); width:380px; text-align:center; border:1px solid rgba(255,255,255,0.8); opacity:0; transform:translateY(20px); transition:0.5s;">
            <div style="font-size:3rem; margin-bottom:20px;"><i class="ph-fill ph-fingerprint"></i></div>
            <h2 style="margin-bottom:10px;">Design Library</h2>
            <p style="color:#86868b; margin-bottom:32px;">한컴 계정으로 인증해 주세요.</p>
            <button id="googleLoginBtn" style="width:100%; padding:16px; border-radius:16px; border:none; background:#fff; color:#1d1d1f; font-weight:600; cursor:pointer; display:flex; align-items:center; justify-content:center; gap:10px; box-shadow:0 4px 15px rgba(0,0,0,0.05);">
                <img src="https://upload.wikimedia.org/wikipedia/commons/c/c1/Google_%22G%22_logo.svg" width="20"> Google 로그인
            </button>
        </div>
    </div>
`;
document.body.insertAdjacentHTML('beforeend', loginHtml);

onAuthStateChanged(auth, (user) => {
    const overlay = document.getElementById('loginOverlay');
    const loginBox = document.getElementById('loginBox');
    
    if (user && user.email.endsWith("@" + TARGET_DOMAIN)) {
        // ✅ 성공: 화면 공개
        overlay.style.display = 'none';
        document.getElementById('userEmailDisplay').innerText = user.email.split('@')[0];
        document.getElementById('userGreeting').style.display = 'block';
        document.getElementById('logoutBtn').style.display = 'block';
        document.body.style.overflow = 'auto';
    } else {
        // ❌ 실패: 화면 가림
        overlay.style.display = 'flex';
        setTimeout(() => { loginBox.style.opacity = '1'; loginBox.style.transform = 'translateY(0)'; }, 50);
        document.body.style.overflow = 'hidden';
    }
});

document.getElementById('googleLoginBtn').onclick = () => signInWithPopup(auth, provider);
window.handleLogout = () => signOut(auth).then(() => location.reload());