// data.js
export const db = {
    // 1. 보고서 에셋 (Report)
    "report": [
        { 
            id: 101, 
            title: "2026 전략기획팀 표준 보고서", 
            team: "전략팀", 
            date: "01.24", 
            badge: "PPTX", 
            colorClass: "bg-blue", 
            icon: "ph-file-ppt",
            desc: "AI 분석 데이터를 가장 효과적으로 보여주는 레이아웃입니다. 임원 보고용으로 최적화된 폰트 크기와 컬러셋이 적용되어 있습니다.",
            features: ["16:9 와이드 포맷", "전용 픽토그램 아이콘", "엑셀 연동 차트"],
            slideCount: 3, // 슬라이더 갯수
            // 👇 여기에 구글 드라이브 링크를 넣으세요!
            fileUrl: "https://drive.google.com/file/d/1234abcd/view?usp=sharing"
        },
        { 
            id: 102, 
            title: "3월 마케팅 성과 보고서", 
            team: "마케팅팀", 
            date: "02.01", 
            badge: "PPTX", 
            colorClass: "bg-orange", 
            icon: "ph-presentation-chart",
            desc: "월간 KPI 달성률과 채널별 성과를 시각적으로 요약한 보고서입니다.",
            features: ["성과 지표 대시보드", "마케팅 퍼널 다이어그램", "경쟁사 비교 차트"],
            slideCount: 4, // 슬라이더 갯수
        },
        { 
            id: 103, 
            title: "신규 입사자 OJT 가이드", 
            team: "인사팀", 
            date: "02.15", 
            badge: "PDF", 
            colorClass: "bg-green", 
            icon: "ph-book-open-text",
            desc: "신규 입사자를 위한 회사 생활 가이드북입니다. 사내 시스템 접속 방법 및 복리후생 안내가 포함되어 있습니다.",
            features: ["회사 생활 A to Z", "조직도 및 비상연락망", "사내 메신저 사용법"],
            slideCount: 8, // 슬라이더 갯수 맥시멈수량 8
        },
        { 
            id: 104, 
            title: "2026년도 연간 예산(안)", 
            team: "재무팀", 
            date: "03.01", 
            badge: "XLSX", 
            colorClass: "bg-purple", 
            icon: "ph-table",
            desc: "전사 부서별 예산 편성을 위한 표준 엑셀 양식입니다. 수식이 포함되어 있어 자동 계산됩니다.",
            features: ["자동 합계 수식", "부서별 시트 구분", "예산 대비 실적 그래프"],
            slides: ["#a855f7", "#9333ea", "#7e22ce"]
        }
    ],

    // 2. 그래픽 디자인 (Graphic)
    "graphic": [
        { 
            id: 201, 
            title: "SNS 홍보 배너 템플릿", 
            team: "디자인팀", 
            date: "02.20", 
            badge: "PSD", 
            colorClass: "bg-green", 
            icon: "ph-image",
            desc: "인스타그램 및 페이스북 광고에 최적화된 카드뉴스 템플릿입니다.",
            features: ["1080x1080px 사이즈", "텍스트만 수정 가능", "무료 폰트 사용"],
            slides: ["#4ade80", "#22c55e", "#16a34a"]
        },
        { 
            id: 202, 
            title: "3D 아이콘 라이브러리", 
            team: "BX팀", 
            date: "03.05", 
            badge: "PNG", 
            colorClass: "bg-purple", 
            icon: "ph-cube",
            desc: "트렌디한 3D 스타일의 업무용 아이콘 모음입니다. 배경이 투명하여 바로 사용할 수 있습니다.",
            features: ["고해상도 PNG", "다양한 각도 제공", "상업적 이용 가능"],
            slides: ["#c084fc", "#a855f7", "#9333ea"]
        },
       { 
            id: 203, 
            title: "3D 아이콘 라이브러리", 
            team: "BX팀", 
            date: "03.05", 
            badge: "PNG", 
            colorClass: "bg-purple", 
            icon: "ph-cube",
            desc: "트렌디한 3D 스타일의 업무용 아이콘 모음입니다. 배경이 투명하여 바로 사용할 수 있습니다.",
            features: ["고해상도 PNG", "다양한 각도 제공", "상업적 이용 가능"],
            slides: ["#c084fc", "#a855f7", "#9333ea"]
        },
    ],

    //id값 차례로 300번, 400번, 500번, 600번, 엄수
    "docs": [],
    "icons": [],
    "data": [],
    "etc": []
};