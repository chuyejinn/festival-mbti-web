# Festival MBTI Web

강남대학교 축제 부스에서 실제 운영된  
MBTI 기반 체험형 웹 서비스입니다.

## Features
- MBTI 질문 기반 성향 테스트
- 모바일 환경 최적화
- 결과 페이지 제공
- QR코드 접속 기반 체험 서비스

## Tech Stack
- Backend: Java 17, Spring Boot 3.2.0, Spring MVC
- Frontend: Thymeleaf, HTML, CSS, JavaScript
- Build: Gradle 8.13 (Gradle Wrapper)
- Test: JUnit 5, Spring MockMvc, Node.js 내장 테스트 러너

## 실행 방법

Java 17(JDK)이 필요합니다. Gradle은 저장소의 Wrapper를 사용하므로 별도 설치가 필요하지 않습니다.

```bash
git clone https://github.com/chuyejinn/festival-mbti-web.git
cd festival-mbti-web
./gradlew bootRun
```

Windows에서는 `gradlew.bat bootRun`을 실행합니다.
브라우저에서 <http://localhost:8080>에 접속하면 테스트를 시작할 수 있습니다.

## 서비스 흐름

1. `/` — 테스트 소개 및 시작
2. `/question` — 8개 문항 응답 및 MBTI 점수 집계
3. `/result` — 16가지 유형 중 하나의 결과와 추천 궁합 표시

결과 유형은 브라우저의 `localStorage`에 저장됩니다. 별도의 데이터베이스나 API 키는 필요하지 않습니다.

## 테스트 및 빌드

```bash
./gradlew test
./gradlew build
node --test src/test/js/*.test.cjs
```

- Java 테스트: Spring 컨텍스트, 화면 경로, 정적 리소스 응답 검증 (`build/reports/tests/test/index.html`에서 결과 확인)
- JavaScript 테스트: MBTI 점수 집계, 동점 처리, 8문항 응답 흐름, 16가지 결과 데이터 및 결과 화면 표시 검증 (Node.js 20 이상, 별도 패키지 설치 불필요)

Windows에서는 `./gradlew` 대신 `gradlew.bat`을 사용합니다.

## 프로젝트 구조

```text
src/
├── main/
│   ├── java/com/example/mbtitest/   # Spring Boot 및 컨트롤러
│   └── resources/
│       ├── templates/            # 소개, 질문, 결과 화면
│       └── static/               # CSS, 유형 이미지
│           └── js/               # 질문/결과 데이터, 계산 로직, 화면 처리
└── test/
    ├── java/                     # Spring Boot 테스트
    └── js/                       # MBTI 로직 테스트
```

JavaScript 코드는 역할별로 분리되어 있습니다.

| 파일 | 역할 |
| --- | --- |
| `question-data.js` | 8개 문항 및 선택지 데이터 |
| `mbti-scoring.js` | 답변 점수 집계와 MBTI 유형 계산 (DOM 의존성 없음) |
| `question.js` | 질문 렌더링, 응답 진행, 결과 저장 |
| `result-data.js` | 16가지 유형 및 추천 궁합 데이터 |
| `result.js` | 결과 화면과 궁합 카드 표시 |

동점인 경우 기존 서비스와 동일하게 각 지표의 첫 번째 유형(E/S/T/J)을 선택합니다.

## Project Background
강남대학교 축제 부스 운영을 위해 제작된 웹 서비스로  
부스 방문자가 QR코드를 통해 접속하여 MBTI 테스트를  
체험할 수 있도록 구현했습니다.
