// badwords.js (브라우저 전용 - 최종 수정)

(function() {
    // 1. 기본 욕설 목록 (방어용)
    const baseBadWords = [
        "바보", "멍청이", "등신", "미친", "지랄", "씨발", "개새끼", 
        "닥쳐", "꺼져", "쓰레기", "놈", "년", "호구",
        "운영자", "관리자", "어드민", 
        "토토", "카지노", "성인", "조건만남",
        "badword", "idiot", "stupid", "hell", "shit", "fuck", "bitch"
    ];

    // 2. 전역 변수 초기화
    window.badWordsList = baseBadWords;

    // 3. 외부 데이터 로드
    console.log("🔄 욕설 데이터 다운로드 시작...");
    
    // hlog2e 님의 리스트 사용
    fetch('https://raw.githubusercontent.com/hlog2e/bad_word_list/master/word_list.json')
        .then(response => {
            if (!response.ok) throw new Error('Network response was not ok');
            return response.json();
        })
        .then(data => {
            console.log("📥 데이터 도착:", data);
            
            let externalList = [];

            // [상황 1] 데이터가 바로 배열인 경우 (우리가 처음에 기대했던 것)
            if (Array.isArray(data)) {
                externalList = data;
            } 
            // [상황 2] 데이터가 객체이고, 그 안에 'words'라는 배열이 있는 경우 (지금 상황!)
            else if (data.words && Array.isArray(data.words)) {
                console.log("💡 'words' 속성 안에서 리스트를 발견했습니다.");
                externalList = data.words;
            } 
            else {
                console.error("❌ 데이터를 해석할 수 없습니다. 구조를 확인하세요.");
                return; // 중단
            }

            // 합치기 (중복 제거)
            const combinedSet = new Set([...window.badWordsList, ...externalList]);
            window.badWordsList = Array.from(combinedSet);
            
            console.log(`✅ 욕설 필터 업데이트 완료: 총 ${window.badWordsList.length}개 단어 장전됨.`);
        })
        .catch(error => {
            console.warn("⚠️ 욕설 데이터 로드 실패 (기본 리스트만 사용됨):", error);
        });
})();