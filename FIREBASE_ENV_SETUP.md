# Firebase 환경변수 설정 가이드

## 1. Firebase Console에서 설정값 찾기

1. [Firebase Console](https://console.firebase.google.com)에 로그인
2. 생성한 프로젝트 선택
3. 좌측 메뉴에서 **프로젝트 설정** (⚙️ 아이콘) 클릭
4. 하단의 **내 앱** 섹션으로 스크롤
5. 웹 앱이 없다면 **</> 웹** 아이콘 클릭하여 앱 추가
   - 앱 닉네임: "SprintTap Web" (또는 원하는 이름)
   - Firebase 호스팅 설정은 체크하지 않음
   - **앱 등록** 클릭

## 2. Firebase 구성 객체 복사

Firebase Console에서 다음과 같은 형태의 구성 객체를 확인할 수 있습니다:

```javascript
const firebaseConfig = {
  apiKey: "AIzaSyD-XXXXXXXXXXXXXXXXXX",
  authDomain: "your-project-id.firebaseapp.com",
  projectId: "your-project-id",
  storageBucket: "your-project-id.appspot.com",
  messagingSenderId: "123456789012",
  appId: "1:123456789012:web:abcdef123456"
};
```

## 3. .env.local 파일 수정

`.env.local` 파일을 열고 각 값을 복사하여 붙여넣기:

```bash
# Firebase 구성 객체의 각 값을 아래에 붙여넣으세요
EXPO_PUBLIC_FIREBASE_API_KEY=AIzaSyD-XXXXXXXXXXXXXXXXXX
EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project-id.firebaseapp.com
EXPO_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project-id.appspot.com
EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789012
EXPO_PUBLIC_FIREBASE_APP_ID=1:123456789012:web:abcdef123456
```

⚠️ **주의사항**:
- 따옴표("")는 제거하고 값만 입력
- 각 줄 끝에 공백이 없도록 주의
- `your_api_key_here` 같은 플레이스홀더를 실제 값으로 교체

## 4. Firestore Database 활성화

1. Firebase Console 좌측 메뉴에서 **Firestore Database** 클릭
2. **데이터베이스 만들기** 클릭
3. **프로덕션 모드에서 시작** 선택
4. 위치 선택 (예: asia-northeast3 - 서울)
5. **사용 설정** 클릭

## 5. Firestore 보안 규칙 설정

1. Firestore Database > **규칙** 탭 클릭
2. 기존 규칙을 모두 삭제하고 아래 내용으로 교체:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Leaderboard collection rules
    match /leaderboard/{documentId} {
      // Anyone can read the leaderboard
      allow read: if true;
      
      // Allow creates and updates with validation
      allow create, update: if 
        request.resource.data.keys().hasAll(['userId', 'nickname', 'gameType', 'bestTime', 'averageTime', 'gamesPlayed', 'accuracy', 'timestamp']) &&
        request.resource.data.userId is string &&
        request.resource.data.nickname is string &&
        request.resource.data.gameType in ['TAP_TEST', 'AUDIO_TEST', 'GO_NO_GO_TEST'] &&
        request.resource.data.bestTime is number &&
        request.resource.data.averageTime is number &&
        request.resource.data.gamesPlayed is int &&
        request.resource.data.accuracy is number &&
        request.resource.data.timestamp is number;
      
      // No deletes allowed
      allow delete: if false;
    }
    
    // User stats collection rules
    match /user_stats/{documentId} {
      // Anyone can read user stats
      allow read: if true;
      
      // Allow creates and updates with validation
      allow create, update: if 
        request.resource.data.keys().hasAll(['userId', 'nickname', 'gameType', 'bestTime', 'averageTime', 'gamesPlayed', 'accuracy']) &&
        request.resource.data.userId is string &&
        request.resource.data.nickname is string &&
        request.resource.data.gameType in ['TAP_TEST', 'AUDIO_TEST', 'GO_NO_GO_TEST'] &&
        request.resource.data.bestTime is number &&
        request.resource.data.averageTime is number &&
        request.resource.data.gamesPlayed is int &&
        request.resource.data.accuracy is number;
      
      // No deletes allowed
      allow delete: if false;
    }
  }
}
```

3. **게시** 버튼 클릭

## 6. 앱 재시작

환경변수를 적용하기 위해 앱을 재시작:

```bash
# Ctrl+C로 기존 서버 종료 후
npm run start
```

## 7. 테스트

1. 앱에서 게임 플레이
2. 게임 완료 후 닉네임 설정
3. Firebase Console > Firestore Database > 데이터 탭에서 데이터 확인

## 문제 해결

### "Firebase is not available" 오류
- `.env.local` 파일의 값들이 올바른지 확인
- 앱을 완전히 재시작 (`npm run start`)
- Firebase Console에서 프로젝트가 활성화되어 있는지 확인

### "Permission denied" 오류
- Firestore 보안 규칙이 올바르게 설정되었는지 확인
- 규칙 게시 후 1-2분 기다린 후 재시도

### 데이터가 저장되지 않음
- 브라우저 개발자 콘솔(F12)에서 에러 메시지 확인
- 닉네임이 설정되어 있는지 확인
- 네트워크 연결 상태 확인

## 보안 주의사항

⚠️ **절대 하지 말아야 할 것들**:
- `.env.local` 파일을 Git에 커밋하지 마세요
- API 키를 공개 저장소에 올리지 마세요
- 프로덕션 환경에서는 추가 보안 설정이 필요합니다