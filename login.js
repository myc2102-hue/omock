// login.js의 4번 인증 감시 로직을 이 버전으로 업데이트하세요.
onAuthStateChanged(auth, async (user) => {
    const main = document.getElementById('mainContent');
    const overlay = document.getElementById('loginOverlay');
    const loginBox = document.getElementById('loginBox');

    if (user) {
        // 🛡️ [도메인 엄격 검사] hancom.com이 아니면 강제 로그아웃
        if (!user.email.endsWith("@" + TARGET_DOMAIN)) {
            alert("한컴 계정(@hancom.com)만 접근할 수 있습니다.");
            await signOut(auth);
            location.reload();
            return;
        }

        // ✅ 인증 성공: 금고 개방 및 데이터 주입
        if (main) {
            main.innerHTML = REAL_DESIGN_HTML; // 숨겨둔 디자인 주입
            main.style.display = 'block';
        }
        overlay.style.display = 'none';
        
        // 헤더 업데이트
        const emailDisp = document.getElementById('userEmailDisplay');
        if (emailDisp) emailDisp.innerText = user.email.split('@')[0];
        document.getElementById('userGreeting').style.display = 'block';
        document.getElementById('logoutBtn').style.display = 'block';
        document.body.style.overflow = 'auto';
    } else {
        // ❌ 로그아웃 상태: 데이터 삭제 및 잠금
        if (main) main.innerHTML = '';
        if (main) main.style.display = 'none';
        overlay.style.display = 'flex';
        setTimeout(() => loginBox.classList.add('show'), 50);
        document.body.style.overflow = 'hidden';
    }
});