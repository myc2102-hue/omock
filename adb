<!DOCTYPE html>
<html lang="ko">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>다큐멘터리: 어도비의 제국과 균열</title>
    <style>
        :root {
            --adobe-red: #FA0F00;
            --dark-bg: #121212;
            --text-gray: #E0E0E0;
            --accent-gold: #FFD700;
        }

        body, html {
            margin: 0;
            padding: 0;
            width: 100%;
            height: 100%;
            overflow: hidden;
            background-color: var(--dark-bg);
            font-family: 'Pretendard', sans-serif;
            color: var(--text-gray);
        }

        .slide-container {
            width: 100vw;
            height: 100vh;
            display: flex;
            transition: transform 0.6s cubic-bezier(0.4, 0, 0.2, 1);
        }

        section {
            min-width: 100vw;
            height: 100vh;
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: center;
            padding: 40px;
            box-sizing: border-box;
            position: relative;
            background-size: cover;
            background-position: center;
            border: 1px solid #333;
        }

        /* 다큐멘터리 자막 효과 */
        .subtitle {
            position: absolute;
            bottom: 10%;
            width: 80%;
            text-align: center;
            font-size: 1.5rem;
            line-height: 1.6;
            color: #fff;
            background: rgba(0,0,0,0.7);
            padding: 15px;
            border-left: 5px solid var(--adobe-red);
        }

        h1 {
            font-size: 4rem;
            margin-bottom: 20px;
            color: var(--adobe-red);
            text-transform: uppercase;
            letter-spacing: -2px;
        }

        h2 {
            font-size: 2.5rem;
            margin-bottom: 30px;
            border-bottom: 2px solid var(--adobe-red);
            padding-bottom: 10px;
        }

        .content-box {
            background: rgba(255, 255, 255, 0.05);
            padding: 40px;
            border-radius: 10px;
            max-width: 900px;
            width: 80%;
            backdrop-filter: blur(5px);
        }

        ul {
            list-style: none;
            padding: 0;
            font-size: 1.3rem;
        }

        li {
            margin-bottom: 20px;
            display: flex;
            align-items: center;
        }

        li::before {
            content: "▶";
            color: var(--adobe-red);
            margin-right: 15px;
            font-size: 0.8rem;
        }

        .nav-info {
            position: fixed;
            bottom: 20px;
            right: 20px;
            font-size: 0.9rem;
            color: #666;
        }

        table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 20px;
        }

        th, td {
            padding: 15px;
            text-align: left;
            border-bottom: 1px solid #444;
        }

        th { color: var(--accent-gold); }

    </style>
</head>
<body>

<div class="slide-container" id="container">
    <section>
        <h1>ADOBE:<br>THE CRACKED EMPIRE</h1>
        <p style="font-size: 1.5rem; color: #888;">2026 경제 다큐멘터리: 창의성의 독점, 그 이후</p>
        <div class="subtitle">"수십 년간 이어진 디자인의 제국. 그러나 지금, 그 견고했던 성벽에 균열이 가기 시작했다."</div>
    </section>

    <section>
        <h2>SECTION 01. 포식자의 생태계</h2>
        <div class="content-box">
            <ul>
                <li><strong>Creative Cloud:</strong> 도구를 넘어선 하나의 거대한 유니버스</li>
                <li><strong>Cloud & Fonts:</strong> 폰트부터 저장소까지, 빠져나갈 수 없는 락인(Lock-in)</li>
                <li><strong>Adobe Stock:</strong> 전 세계 창작자들의 데이터를 자산화한 거대 아카이브</li>
            </ul>
        </div>
        <div class="subtitle">"그들은 도구를 파는 것이 아니라, 창작자들의 시간과 환경을 점유하는 방식을 택했다."</div>
    </section>

    <section>
        <h2>SECTION 02. 영리한 과금, 늘어나는 피로도</h2>
        <div class="content-box">
            <table>
                <tr>
                    <th>플랜 명칭</th>
                    <th>핵심 특징</th>
                    <th>AI 생성 크레딧</th>
                </tr>
                <tr>
                    <td>단일 앱</td>
                    <td>전용 툴 1개 집중 사용</td>
                    <td>월 약 500 ~ 1,000</td>
                </tr>
                <tr>
                    <td>Creative Cloud All</td>
                    <td>20개 이상의 모든 앱</td>
                    <td>월 약 4,000 (Pro 기준)</td>
                </tr>
                <tr>
                    <td>Firefly 전용</td>
                    <td>AI 생성 기능 특화</td>
                    <td>구매량에 따른 차등</td>
                </tr>
            </table>
        </div>
        <div class="subtitle">"사용자의 창의력은 이제 '크레딧'이라는 가상 화폐로 환산되어 결제된다."</div>
    </section>

    <section>
        <h2>SECTION 03. 위기의 서막: AI의 역습</h2>
        <div class="content-box">
            <ul>
                <li><strong>장벽의 붕괴:</strong> Canva가 허문 '전문가'와 '비전문가'의 경계</li>
                <li><strong>속도의 전쟁:</strong> Midjourney와 Sora가 보여준 압도적인 생성 속도</li>
                <li><strong>SaaS포칼립스:</strong> 매달 나가는 구독료에 비해 체감되는 혁신은 더뎌졌다</li>
            </ul>
        </div>
        <div class="subtitle">"창조의 고통을 덜어주겠다던 AI는, 역설적으로 어도비의 존재 이유를 위협하고 있다."</div>
    </section>

    <section>
        <h2>SECTION 04. 무너진 신뢰와 법적 딜레마</h2>
        <div class="content-box">
            <ul>
                <li><strong>데이터 오염:</strong> 깨끗하다던 Firefly, 저작권 데이터 학습 논란</li>
                <li><strong>약관의 횡포:</strong> 사용자 작업물을 학습에 강제 활용하려던 시도와 반발</li>
                <li><strong>M&A 실패:</strong> 피그마(Figma) 인수 무산이 남긴 뼈아픈 미래 동력 상실</li>
            </ul>
        </div>
        <div class="subtitle">"데이터의 투명성은 흐려졌고, 독과점에 대한 경계는 그들의 팔다리를 묶어버렸다."</div>
    </section>

    <section>
        <h1>WHERE TO NEXT?</h1>
        <div class="content-box" style="text-align: center;">
            <p style="font-size: 1.8rem;">제국은 진화할 것인가, 침몰할 것인가.</p>
            <p style="color: var(--adobe-red); font-weight: bold;">ADOBE VS THE NEW ERA</p>
        </div>
        <div class="subtitle">"이제 시장은 묻고 있다. 당신들이 제공하는 것이 도구인가, 아니면 족쇄인가."</div>
    </section>
</div>

<div class="nav-info">방향키(←, →) 또는 화면 클릭으로 이동</div>

<script>
    const container = document.getElementById('container');
    let currentSlide = 0;
    const totalSlides = document.querySelectorAll('section').length;

    function moveSlide(direction) {
        if (direction === 'next' && currentSlide < totalSlides - 1) {
            currentSlide++;
        } else if (direction === 'prev' && currentSlide > 0) {
            currentSlide--;
        }
        container.style.transform = `translateX(-${currentSlide * 100}vw)`;
    }

    window.addEventListener('keydown', (e) => {
        if (e.key === 'ArrowRight') moveSlide('next');
        if (e.key === 'ArrowLeft') moveSlide('prev');
    });

    window.addEventListener('click', (e) => {
        if (e.clientX > window.innerWidth / 2) moveSlide('next');
        else moveSlide('prev');
    });
</script>

</body>
</html>