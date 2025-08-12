# 🧪 SprintTap 테스트 가이드

## 📋 테스트 개요

SprintTap 프로젝트의 테스트 시스템은 **Jest**와 **React Native Testing Library**를 기반으로 구축되어 있으며, 안정적이고 신뢰할 수 있는 반응시간 측정 앱을 보장합니다.

### 🎯 테스트 목표
- **코드 품질**: 버그 사전 방지 및 안정성 확보
- **리팩토링 안전성**: 기존 기능 보장하며 코드 개선
- **성능 검증**: 게임 로직의 정확한 반응시간 측정
- **사용자 경험**: UI 컴포넌트의 올바른 동작 확인

---

## 🛠 테스트 환경 설정

### 설치된 패키지
```json
{
  "jest": "^30.0.5",
  "jest-expo": "^53.0.9",
  "@testing-library/react-native": "^13.2.2",
  "@testing-library/jest-native": "^5.4.3",
  "react-test-renderer": "^19.0.0",
  "@types/jest": "^30.0.0"
}
```

### Jest 설정 (jest.config.js)
```javascript
module.exports = {
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx'],
  transform: {
    '^.+\\.(js|jsx|ts|tsx)$': 'babel-jest',
  },
  testMatch: [
    '**/__tests__/**/*.(ts|tsx|js)',
    '**/*.(test|spec).(ts|tsx|js)',
  ],
  collectCoverageFrom: [
    'src/**/*.{ts,tsx}',
    '!src/**/*.d.ts',
    '!src/**/index.ts',
  ],
  testEnvironment: 'node',
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },
};
```

### 테스트 실행 명령어
```bash
# 모든 테스트 실행
npm test

# 감시 모드로 테스트 실행
npm run test:watch

# 코드 커버리지 확인
npm run test:coverage
```

---

## 📊 테스트 현황

### ✅ 테스트 통계
- **총 테스트 수**: 215개
- **통과 테스트**: 215개 ✓
- **실패 테스트**: 0개
- **테스트 커버리지**: src/ 폴더 전체

### 📁 테스트 구조
```
src/
├── __tests__/
│   ├── components/           # 컴포넌트 테스트
│   │   ├── common/
│   │   │   ├── Button.test.tsx
│   │   │   └── Card.test.tsx
│   │   └── leaderboard/
│   │       └── LeaderboardEntry.test.tsx
│   ├── hooks/               # 커스텀 훅 테스트
│   ├── screens/             # 화면 컴포넌트 테스트
│   │   └── leaderboard/
│   │       └── LeaderboardScreen.test.tsx
│   ├── services/            # 서비스 계층 테스트
│   │   └── LeaderboardService.test.ts
│   └── utils/               # 유틸리티 테스트
│       ├── gameLogic.test.ts
│       ├── validators.test.ts
│       └── statistics.test.ts
```

---

## 🧩 테스트 카테고리별 상세

### 1. 🎮 게임 로직 테스트 (`gameLogic.test.ts`)

**테스트 범위**: 19개 테스트
- 반응시간 유효성 검증
- 랜덤 지연 시간 생성
- 게임 통계 계산
- 시간 포맷팅
- 성능 등급 평가
- 게임 세션 관리

#### 핵심 테스트 케이스
```typescript
// 반응시간 검증
describe('validateReactionTime', () => {
  it('should return true for valid reaction times', () => {
    expect(GameLogic.validateReactionTime(150)).toBe(true);
    expect(GameLogic.validateReactionTime(300)).toBe(true);
  });

  it('should return false for invalid reaction times', () => {
    expect(GameLogic.validateReactionTime(50)).toBe(false);  // 너무 빠름
    expect(GameLogic.validateReactionTime(2500)).toBe(false); // 너무 느림
  });
});
```

### 2. ✅ 검증 유틸리티 테스트 (`validators.test.ts`)

**테스트 범위**: 22개 테스트
- 반응시간 유효성 검사
- 닉네임 검증 및 정제
- 사용자 프로필 검증
- 게임 시도 데이터 검증
- 세션 ID 형식 검증
- 타임스탬프 유효성 검사

#### 핵심 테스트 케이스
```typescript
// 닉네임 검증
describe('isValidNickname', () => {
  it('should validate correct nicknames', () => {
    const result = Validators.isValidNickname('Player123');
    expect(result.isValid).toBe(true);
  });

  it('should reject invalid characters', () => {
    const result = Validators.isValidNickname('Player<script>');
    expect(result.isValid).toBe(false);
    expect(result.error).toBe('validation.nicknameInvalidChars');
  });
});
```

### 3. 📈 통계 유틸리티 테스트 (`statistics.test.ts`)

**테스트 범위**: 23개 테스트
- 성과 개선 트렌드 분석
- 일관성 점수 계산
- 세션 요약 통계
- 진행 상황 인사이트

#### 핵심 테스트 케이스
```typescript
// 개선 트렌드 분석
describe('calculateImprovementTrend', () => {
  it('should calculate IMPROVING trend correctly', () => {
    const sessions = [
      createMockSession(200), // 최근 (더 나음)
      createMockSession(300), // 이전 (더 나쁨)
    ];
    
    const result = StatisticsUtils.calculateImprovementTrend(sessions);
    expect(result.trend).toBe('IMPROVING');
  });
});
```

### 4. 🎨 UI 컴포넌트 테스트

#### Button 컴포넌트 테스트 (`Button.test.tsx`)
**테스트 범위**: 20개 테스트
- 기본 렌더링 및 상호작용
- 다양한 변형(primary, secondary, danger, ghost)
- 크기별 렌더링(small, medium, large)
- 상태별 동작(disabled, loading)
- 커스텀 스타일 적용

#### Card 컴포넌트 테스트 (`Card.test.tsx`)
**테스트 범위**: 21개 테스트
- 기본 렌더링 및 콘텐츠 표시
- 변형별 스타일(default, elevated, outlined)
- 터치 가능 여부 설정
- 패딩 크기 조정
- 복잡한 중첩 콘텐츠

#### LeaderboardEntry 컴포넌트 테스트 (`LeaderboardEntry.test.tsx`)
**테스트 범위**: 23개 테스트
- 기본 정보 렌더링 (닉네임, 순위, 최고기록)
- 순위별 메달/숫자 표시 (🥇🥈🥉 vs #4, #5...)
- 상세 정보 표시/숨김 (평균시간, 게임수, 정확도)
- 현재 사용자 강조 표시
- TOP 10 배지 표시
- 긴 닉네임 처리 및 접근성
- 테마 색상 적용 및 스타일링

### 5. 📱 화면 컴포넌트 테스트

#### LeaderboardScreen 테스트 (`LeaderboardScreen.test.tsx`)
**테스트 범위**: 31개 테스트
- 로딩 상태 및 데이터 페칭
- API 연결 실패 시 목 데이터 대체
- 에러 처리 및 사용자 알림
- 게임 타입별 제목 표시
- 사용자 통계 렌더링
- 리더보드 엔트리 목록 표시
- 필터링 기능 (최고속도, 평균속도, 게임수)
- 새로고침 기능 (Pull-to-Refresh)
- 네비게이션 동작 (뒤로가기)
- 현재 사용자 식별 및 강조

### 6. 🔧 서비스 계층 테스트

#### LeaderboardService 테스트 (`LeaderboardService.test.ts`)
**테스트 범위**: 30개 테스트
- 점수 제출 API 호출 및 응답 처리
- 사용자 옵트인 및 닉네임 검증
- 리더보드 데이터 페칭 (사용자 ID 포함/제외)
- 사용자 통계 조회 및 404 처리
- 점수 자격 확인 API
- 목 데이터 생성 (오프라인 모드)
- 헬스체크 및 서비스 상태 확인
- API URL 구성 및 설정
- 네트워크 에러 처리

---

## 🔧 테스트 작성 가이드라인

### 테스트 네이밍 규칙
```typescript
describe('ComponentName 또는 FunctionName', () => {
  describe('기능 그룹', () => {
    it('should 예상되는 동작을 기술', () => {
      // 테스트 구현
    });
  });
});
```

### 테스트 구조 (AAA 패턴)
```typescript
it('should calculate correct statistics', () => {
  // Arrange - 준비
  const attempts = [
    createMockAttempt(200),
    createMockAttempt(300),
  ];

  // Act - 실행
  const stats = GameLogic.calculateStatistics(attempts);

  // Assert - 검증
  expect(stats.averageTime).toBe(250);
  expect(stats.totalAttempts).toBe(2);
});
```

### Mock 사용법
```typescript
// React Native 컴포넌트 모킹
jest.mock('../../hooks', () => ({
  useThemedColors: () => ({
    PRIMARY: '#007AFF',
    SECONDARY: '#34C759',
    ERROR: '#FF3B30',
  }),
}));

// 함수 모킹
const mockOnPress = jest.fn();
beforeEach(() => {
  jest.clearAllMocks();
});
```

---

## 🚀 테스트 실행 및 디버깅

### 특정 테스트 실행
```bash
# 특정 파일의 테스트만 실행
npm test gameLogic.test.ts

# 패턴으로 테스트 실행
npm test -- --testNamePattern="Button"

# 감시 모드로 변경된 파일만 테스트
npm run test:watch
```

### 디버깅 팁
```typescript
// 콘솔 출력으로 디버깅
it('should debug test', () => {
  const result = someFunction();
  console.log('Debug result:', result);
  expect(result).toBe(expected);
});

// 스냅샷 업데이트
npm test -- --updateSnapshot
```

---

## 📝 테스트 모범 사례

### ✅ Do (권장사항)
- **단일 책임**: 각 테스트는 하나의 동작만 검증
- **독립성**: 테스트는 서로 독립적이어야 함
- **명확한 네이밍**: 테스트 이름만 보고도 기능을 알 수 있어야 함
- **Edge Case 테스트**: 경계값 및 예외 상황 테스트
- **Mock 정리**: `beforeEach`에서 mock 상태 초기화

### ❌ Don't (지양사항)
- **복잡한 로직**: 테스트 코드 자체가 복잡하면 안됨
- **외부 의존성**: 실제 네트워크나 파일 시스템에 의존하지 말것
- **테스트 순서 의존**: 테스트 실행 순서에 의존하지 말것
- **과도한 Mock**: 필요 이상으로 많은 것을 mock하지 말것

---

## 📈 향후 개선 계획

### 🎯 단기 계획
- [ ] E2E 테스트 추가 (Detox 도입)
- [ ] 성능 테스트 추가
- [ ] 커스텀 훅 테스트 완성
- [ ] 서비스 계층 테스트 확장

### 🚀 장기 계획
- [ ] 시각적 회귀 테스트 (스토리북 + 크로매틱)
- [ ] CI/CD 파이프라인 테스트 자동화
- [ ] 접근성 테스트 추가
- [ ] 크로스 플랫폼 테스트 환경 구축

## 🏆 리더보드 기능 테스트 특징

### 🎯 테스트 커버리지 하이라이트
리더보드 기능은 총 **84개 테스트**로 완전히 검증되었습니다:

#### 📊 API 통합 테스트
- **실제 API와 목 데이터 대체**: 네트워크 상태에 따른 자동 전환
- **에러 처리**: 네트워크 오류, 서버 오류, 인증 실패 상황
- **데이터 검증**: API 응답 형식 및 타입 안전성 확인

#### 🎮 게임 데이터 통합
- **게임 타입별 분류**: TAP_TEST, AUDIO_TEST, GO_NO_GO_TEST
- **점수 제출 검증**: 사용자 옵트인, 닉네임, 세션 데이터 유효성
- **순위 계산**: 다양한 기준(최고속도, 평균속도, 게임수)에 따른 정렬

#### 🎨 UI/UX 테스트
- **반응형 디자인**: 다양한 화면 크기 및 데이터 길이
- **사용자 상호작용**: 필터링, 새로고침, 네비게이션
- **접근성**: 긴 텍스트 처리, 시각적 피드백, 상태 표시

#### 🔒 보안 및 프라이버시
- **사용자 식별**: UUID 기반 익명 사용자 추적
- **데이터 검증**: 입력값 검증 및 XSS 방지
- **옵트인 시스템**: 사용자 동의 없이는 리더보드 미참여

---

## 🔗 참고 자료

- [Jest 공식 문서](https://jestjs.io/docs/getting-started)
- [React Native Testing Library](https://callstack.github.io/react-native-testing-library/)
- [Testing Best Practices](https://github.com/goldbergyoni/javascript-testing-best-practices)
- [React Native Testing 가이드](https://reactnative.dev/docs/testing-overview)

---

## 📝 문서 업데이트 지침

### 새로운 테스트 추가 시 필수 업데이트 사항
1. **테스트 통계 업데이트**: 총 테스트 수, 카테고리별 테스트 수 갱신
2. **테스트 구조 다이어그램**: `src/__tests__/` 구조에 새 파일 추가
3. **테스트 카테고리 설명**: 새로운 테스트 유형 추가 시 상세 설명 작성
4. **코드 예제**: 새로운 테스트 패턴 사용 시 예제 코드 추가
5. **문서 버전 정보**: 하단 업데이트 날짜 및 버전 갱신

### 업데이트 주기
- **기능 추가 시**: 즉시 업데이트 필요
- **테스트 패턴 변경**: 관련 섹션 즉시 업데이트
- **월별 정기 검토**: 매월 전체 문서 검토 및 정리

### 문서 일관성 유지
- 이모지 사용 패턴 일치
- 섹션 구조 및 네이밍 통일
- 코드 예제 스타일 일관성 유지
- 한글/영어 혼용 패턴 일치

---

**📅 문서 업데이트**: 2025년 8월 12일  
**✏️ 작성자**: Claude Code Assistant  
**🔄 버전**: 1.2.0 (리더보드 기능 테스트 추가)