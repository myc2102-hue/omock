// badwords.js (브라우저 전용)

(function() {
    // 1. 기본 욕설 목록 (데이터 로딩 전 즉시 방어용)
    const baseBadWords = [
        "바보", "멍청이", "등신", "미친", "지랄", "씨발", "개새끼", 
        "닥쳐", "꺼져", "쓰레기", "놈", "년", "호구",
        "운영자", "관리자", "어드민", 
        "토토", "카지노", "성인", "조건만남",
        "badword", "idiot", "stupid", "hell", "shit", "fuck", "bitch"
    ];

    // 2. 전역 변수에 초기 리스트 할당
    window.badWordsList = baseBadWords;

    // 3. 외부 욕설 데이터 비동기 로드
    console.log("🔄 욕설 데이터 다운로드 시작...");
    
    fetch('https://raw.githubusercontent.com/hlog2e/bad_word_list/master/word_list.json')
        .then(response => {
            if (!response.ok) throw new Error('Network response was not ok');
            return response.json();
        })
        .then(data => {
            // [디버깅용] 실제로 어떤 데이터가 왔는지 콘솔에 찍어봅니다.
            console.log("📥 다운로드된 데이터 타입:", typeof data);
            console.log("📥 데이터 미리보기:", data);

            // 데이터가 배열(리스트)인지 확인 후 처리
            if (Array.isArray(data)) {
                const combinedSet = new Set([...window.badWordsList, ...data]);
                window.badWordsList = Array.from(combinedSet);
                console.log(`✅ 욕설 필터 업데이트 완료: 총 ${window.badWordsList.length}개 단어 장전됨.`);
            } else {
                console.error("❌ 데이터 형식이 배열이 아닙니다. 다운로드된 데이터를 확인하세요.");
            }
        })
        .catch(error => {
            console.warn("⚠️ 욕설 데이터 로드 실패 (기본 리스트만 사용됨):", error);
        });
})();