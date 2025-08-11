// Korean translations
export const ko = {
  // Common
  common: {
    ok: '확인',
    cancel: '취소',
    close: '닫기',
    save: '저장',
    delete: '삭제',
    edit: '편집',
    back: '돌아가기',
    next: '다음',
    previous: '이전',
    loading: '로딩 중...',
    error: '오류',
    success: '성공',
  },

  // App
  app: {
    title: 'QuickReflex',
    subtitle: '순발력 측정 게임',
  },

  // Navigation
  navigation: {
    home: '홈',
    settings: '설정',
    results: '결과',
    gameList: '게임 목록',
  },

  // Game
  game: {
    tapToStart: '탭해서 시작',
    getReady: '준비...',
    waitForGreen: '초록색이 될 때까지 기다리세요',
    tapNow: '지금 탭하세요!',
    tooEarly: '너무 빨라요!',
    tooSlow: '너무 느려요!',
    gameComplete: '게임 완료!',
    round: '라운드',
    pause: '일시정지',
    resume: '계속',
    stop: '중단',
    exit: '나가기',
    currentProgress: '현재 진행상황',
    successful: '성공',
    failed: '실패',
    average: '평균',
    roundReady: (round: number) => `라운드 ${round} 준비...`,
    pausedMessage: '일시정지됨\n위에서 계속 버튼을 눌러주세요',
    excellentReaction: (time: string) => `훌륭해요! ${time}`,
    excellent: '뛰어난 반응속도!',
    good: '좋은 반응속도!',
    normal: '평균적인 반응속도',
    needPractice: '연습이 필요합니다',
    noValidRecords: '유효한 기록이 없습니다',
  },

  // Game Modes
  gameModes: {
    tapTest: {
      title: '순발력 테스트',
      description: '빨간 화면이 초록색으로 바뀌는 순간 탭하세요!',
      stats: '5라운드 • 평균 1분',
    },
    audioTest: {
      title: '청각 반응 테스트',
      description: '소리가 나는 순간 탭하세요!',
      stats: '곧 출시 예정',
    },
    goNoGoTest: {
      title: 'Go/No-Go 테스트',
      description: '특정 신호에만 반응하세요!',
      stats: '곧 출시 예정',
    },
  },

  // Results
  results: {
    gameComplete: '게임 완료!',
    newRecord: '🏆 신기록!',
    averageTime: '평균 반응시간',
    bestTime: '최고 기록',
    worstTime: '최저 기록',
    accuracy: '정확도',
    attemptResults: '시도별 결과',
    failed: '실패',
    earlyReaction: '조기 반응',
    timeout: '시간 초과',
    insights: '분석 및 인사이트',
    playAgain: '다시 플레이',
    shareResult: '결과 공유',
    goHome: '홈으로',
    comparison: '이전 기록과 비교',
    insights: '분석 및 인사이트',
    improvement: (time: string) => `최고 기록이 ${time} 향상됐어요!`,
    averageImprovement: (time: string) => `평균 반응시간이 ${time} 빨라졌어요!`,
    averageDecline: (time: string) => `평균 반응시간이 ${time} 느려졌어요.`,
  },

  // Statistics
  statistics: {
    myRecords: '나의 기록',
    totalGames: '총 게임 수',
    bestRecord: '최고 기록',
    averageRecord: '평균 기록',
    insights: {
      playMore: '더 많은 게임을 플레이해보세요!',
      improved: (percentage: number) => `최근 ${percentage}% 향상되었습니다! 🎉`,
      declined: (percentage: number) => `최근 성과가 ${percentage}% 하락했습니다. 더 집중해보세요! 💪`,
      stable: '안정적인 성과를 유지하고 있습니다 👍',
      consistent: '매우 일관된 반응속도를 보입니다! 🎯',
      inconsistent: '반응속도의 일관성을 향상시켜보세요 📈',
      excellent: '뛰어난 반응속도를 가지고 있습니다! ⚡',
      needsPractice: '더 빠른 반응을 위해 연습해보세요! 🏃‍♂️',
    },
  },

  // Settings
  settings: {
    title: '설정',
    theme: '테마 설정',
    themeDescription: '앱의 외관을 변경할 수 있습니다.',
    language: '언어 설정',
    languageDescription: '앱에서 사용할 언어를 선택하세요.',
    quickActions: '빠른 작업',
    themeToggle: '테마 전환',
    dataReset: '데이터 초기화',
    themeOptions: {
      system: '시스템 설정 따라가기',
      light: '라이트 모드',
      dark: '다크 모드',
    },
    languageOptions: {
      korean: '한국어',
      english: 'English',
    },
  },

  // Modals
  modals: {
    exitGame: {
      title: '게임 중단',
      message: '현재 게임을 중단하시겠습니까?\n진행 상황이 기록되고 결과 화면으로 이동합니다.',
      confirm: '중단하기',
      cancel: '계속하기',
    },
    resetData: {
      title: '데이터 초기화',
      message: '모든 게임 기록과 설정이 삭제됩니다.\n정말로 초기화하시겠습니까?',
      confirm: '초기화',
      cancel: '취소',
    },
  },

  // Tutorial
  tutorial: {
    skip: '건너뛰기',
    start: '시작하기',
    steps: {
      1: {
        title: '🎯 게임 방법',
        description: '화면이 빨간색에서 초록색으로\n바뀌는 순간을 기다리세요',
      },
      2: {
        title: '⚡ 빠른 반응',
        description: '초록색으로 바뀌면\n즉시 화면을 탭하세요!',
      },
      3: {
        title: '📊 결과 측정',
        description: '5번의 시도 후\n평균 반응시간을 확인하세요',
      },
    },
    demo: {
      waiting: '대기 중...',
      tapNow: '지금 탭!',
      resultExample: '결과 예시',
      averageTime: '평균: 245ms',
      excellentResponse: '훌륭한 반응속도!',
    },
  },

  // Onboarding
  onboarding: {
    firstGame: {
      title: '첫 번째 게임',
      complete: '완료',
      congratulations: '온보딩 완료! 🎉',
      message: '첫 번째 게임을 완료했습니다!\n이제 본격적인 게임을 즐겨보세요.',
      gameStart: '게임 시작',
      error: '온보딩 완료 중 오류가 발생했습니다.',
      encouragement: {
        first: '첫 게임을 완료했습니다!',
        normal: '잘하셨습니다!',
      },
    },
  },

  // Share
  share: {
    title: 'QuickReflex 결과 공유',
    resultTitle: 'QuickReflex 순발력 테스트 결과!',
    averageTime: '평균 반응시간',
    bestTime: '최고 반응시간',
    accuracy: '정확도',
    challenge: '당신도 도전해보세요! #QuickReflex #순발력테스트',
  },

  // Validation
  validation: {
    nicknameRequired: '닉네임을 입력해주세요',
    nicknameTooShort: '닉네임은 2자 이상이어야 합니다',
    nicknameTooLong: '닉네임은 20자 이하여야 합니다',
    nicknameInvalidChars: '특수문자는 사용할 수 없습니다',
    userIdRequired: '사용자 ID가 필요합니다',
  },

  // Messages
  messages: {
    dataResetComplete: '모든 데이터가 초기화되었습니다.',
    dataResetError: '데이터 초기화 중 오류가 발생했습니다.',
    shareError: '결과 공유 중 오류가 발생했습니다.',
  },
};

// English translations
export const en = {
  // Common
  common: {
    ok: 'OK',
    cancel: 'Cancel',
    close: 'Close',
    save: 'Save',
    delete: 'Delete',
    edit: 'Edit',
    back: 'Back',
    next: 'Next',
    previous: 'Previous',
    loading: 'Loading...',
    error: 'Error',
    success: 'Success',
  },

  // App
  app: {
    title: 'QuickReflex',
    subtitle: 'Reaction Time Test Game',
  },

  // Navigation
  navigation: {
    home: 'Home',
    settings: 'Settings',
    results: 'Results',
    gameList: 'Game List',
  },

  // Game
  game: {
    tapToStart: 'Tap to start',
    getReady: 'Get ready...',
    waitForGreen: 'Wait for green',
    tapNow: 'Tap now!',
    tooEarly: 'Too early!',
    tooSlow: 'Too slow!',
    gameComplete: 'Game complete!',
    round: 'Round',
    pause: 'Pause',
    resume: 'Resume',
    stop: 'Stop',
    exit: 'Exit',
    currentProgress: 'Current Progress',
    successful: 'Success',
    failed: 'Failed',
    average: 'Average',
    roundReady: (round: number) => `Round ${round} ready...`,
    pausedMessage: 'Paused\nPress continue button above',
    excellentReaction: (time: string) => `Excellent! ${time}`,
    excellent: 'Excellent reaction time!',
    good: 'Good reaction time!',
    normal: 'Average reaction time',
    needPractice: 'Practice needed',
    noValidRecords: 'No valid records',
  },

  // Game Modes
  gameModes: {
    tapTest: {
      title: 'Reaction Test',
      description: 'Tap when the screen turns green!',
      stats: '5 rounds • ~1 minute',
    },
    audioTest: {
      title: 'Audio Reaction Test',
      description: 'Tap when you hear the sound!',
      stats: 'Coming soon',
    },
    goNoGoTest: {
      title: 'Go/No-Go Test',
      description: 'React only to specific signals!',
      stats: 'Coming soon',
    },
  },

  // Results
  results: {
    gameComplete: 'Game Complete!',
    newRecord: '🏆 New Record!',
    averageTime: 'Average reaction time',
    bestTime: 'Best Time',
    worstTime: 'Worst Time',
    accuracy: 'Accuracy',
    attemptResults: 'Attempt Results',
    failed: 'Failed',
    earlyReaction: 'Early reaction',
    timeout: 'Timeout',
    insights: 'Analysis & Insights',
    playAgain: 'Play Again',
    shareResult: 'Share Result',
    goHome: 'Go Home',
    comparison: 'Comparison with Previous Records',
    insights: 'Analysis & Insights',
    improvement: (time: string) => `Best record improved by ${time}!`,
    averageImprovement: (time: string) => `Average reaction time improved by ${time}!`,
    averageDecline: (time: string) => `Average reaction time slowed by ${time}.`,
  },

  // Statistics
  statistics: {
    myRecords: 'My Records',
    totalGames: 'Total Games',
    bestRecord: 'Best Record',
    averageRecord: 'Average Record',
    insights: {
      playMore: 'Play more games to see insights!',
      improved: (percentage: number) => `Improved by ${percentage}% recently! 🎉`,
      declined: (percentage: number) => `Performance declined by ${percentage}% recently. Stay focused! 💪`,
      stable: 'Maintaining stable performance 👍',
      consistent: 'Very consistent reaction times! 🎯',
      inconsistent: 'Try to improve reaction time consistency 📈',
      excellent: 'You have excellent reaction speed! ⚡',
      needsPractice: 'Practice for faster reactions! 🏃‍♂️',
    },
  },

  // Settings
  settings: {
    title: 'Settings',
    theme: 'Theme Settings',
    themeDescription: 'Customize the app appearance.',
    language: 'Language Settings',
    languageDescription: 'Choose your preferred language.',
    quickActions: 'Quick Actions',
    themeToggle: 'Toggle Theme',
    dataReset: 'Reset Data',
    themeOptions: {
      system: 'Follow System',
      light: 'Light Mode',
      dark: 'Dark Mode',
    },
    languageOptions: {
      korean: '한국어',
      english: 'English',
    },
  },

  // Modals
  modals: {
    exitGame: {
      title: 'Stop Game',
      message: 'Do you want to stop the current game?\nYour progress will be recorded and you will go to the results screen.',
      confirm: 'Stop',
      cancel: 'Continue',
    },
    resetData: {
      title: 'Reset Data',
      message: 'All game records and settings will be deleted.\nAre you sure you want to reset?',
      confirm: 'Reset',
      cancel: 'Cancel',
    },
  },

  // Tutorial
  tutorial: {
    skip: 'Skip',
    start: 'Start',
    steps: {
      1: {
        title: '🎯 How to Play',
        description: 'Wait for the screen to change\nfrom red to green',
      },
      2: {
        title: '⚡ Quick Reaction',
        description: 'Tap the screen immediately\nwhen it turns green!',
      },
      3: {
        title: '📊 Measure Results',
        description: 'Check your average reaction time\nafter 5 attempts',
      },
    },
    demo: {
      waiting: 'Waiting...',
      tapNow: 'Tap Now!',
      resultExample: 'Result Example',
      averageTime: 'Average: 245ms',
      excellentResponse: 'Excellent reaction speed!',
    },
  },

  // Onboarding
  onboarding: {
    firstGame: {
      title: 'First Game',
      complete: 'Complete',
      congratulations: 'Onboarding Complete! 🎉',
      message: 'You have completed your first game!\nNow enjoy the full gaming experience.',
      gameStart: 'Start Game',
      error: 'An error occurred while completing onboarding.',
      encouragement: {
        first: 'First game completed!',
        normal: 'Well done!',
      },
    },
  },

  // Share
  share: {
    title: 'QuickReflex Results Share',
    resultTitle: 'QuickReflex Reaction Time Test Results!',
    averageTime: 'Average reaction time',
    bestTime: 'Best reaction time',
    accuracy: 'Accuracy',
    challenge: 'Challenge yourself too! #QuickReflex #ReactionTime',
  },

  // Validation
  validation: {
    nicknameRequired: 'Please enter a nickname',
    nicknameTooShort: 'Nickname must be at least 2 characters',
    nicknameTooLong: 'Nickname must be 20 characters or less',
    nicknameInvalidChars: 'Special characters are not allowed',
    userIdRequired: 'User ID is required',
  },

  // Messages
  messages: {
    dataResetComplete: 'All data has been reset.',
    dataResetError: 'An error occurred while resetting data.',
    shareError: 'An error occurred while sharing results.',
  },
};

export type TranslationKeys = typeof ko;