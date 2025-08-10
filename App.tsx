// SprintTap — 1‑Day MVP (Expo, iOS & Android)
// App.tsx — single‑file MVP implementing 3 quick "순발력" tests
// Stack: Expo + React Native + TypeScript + AsyncStorage (no native mods needed)
// -----------------------------------------------------------------------------
// Quick start
//   npm create expo@latest sprinttap -- --template expo-template-blank-typescript
//   cd sprinttap
//   npm i @react-native-async-storage/async-storage
//   npm run start   (scan with Expo Go on iPhone & Android)
// -----------------------------------------------------------------------------

import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  SafeAreaView,
  View,
  Text,
  Pressable,
  StyleSheet,
  FlatList,
  Alert,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Speech from "expo-speech";

// ------------------------------
// Types & Utils
// ------------------------------

type Trial = { ms: number; ok: boolean; at: number };

type TestKey = "visual" | "goNoGo" | "direction" | "audio";

type TestResult = {
  key: TestKey;
  trials: Trial[];
};

const pad = (n: number) => (n < 10 ? `0${n}` : `${n}`);
const fmt = (ms: number) => `${Math.round(ms)} ms`;

async function saveResult(res: TestResult) {
  const key = `sprinttap:${res.key}`;
  const prevRaw = await AsyncStorage.getItem(key);
  const prev = prevRaw ? (JSON.parse(prevRaw) as TestResult[]) : [];
  prev.unshift(res);
  // keep only last 20 sessions per test
  await AsyncStorage.setItem(key, JSON.stringify(prev.slice(0, 20)));
}

async function loadResults(key: TestKey): Promise<TestResult[]> {
  const raw = await AsyncStorage.getItem(`sprinttap:${key}`);
  return raw ? (JSON.parse(raw) as TestResult[]) : [];
}

function summarize(trials: Trial[]) {
  const oks = trials.filter((t) => t.ok).map((t) => t.ms);
  const errors = trials.filter((t) => !t.ok).length;
  const avg = oks.length ? oks.reduce((a, b) => a + b, 0) / oks.length : 0;
  const best = oks.length ? Math.min(...oks) : 0;
  return { avg, best, errors };
}

// ------------------------------
// Root App
// ------------------------------

export default function App() {
  const [screen, setScreen] = useState<"home" | TestKey | "results">("home");
  const [lastSaved, setLastSaved] = useState<string>("");

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.container}>
        {screen === "home" && <Home onOpen={setScreen} lastSaved={lastSaved} />}
        {screen === "visual" && (
          <VisualReaction
            onDone={async (r) => {
              await saveResult(r);
              setLastSaved(nowStr());
              setScreen("home");
            }}
          />
        )}

        {screen === "goNoGo" && (
          <GoNoGo
            onDone={async (r) => {
              await saveResult(r);
              setLastSaved(nowStr());
              setScreen("home");
            }}
          />
        )}
        {screen === "direction" && (
          <DirectionChange
            onDone={async (r) => {
              await saveResult(r);
              setLastSaved(nowStr());
              setScreen("home");
            }}
          />
        )}
        {screen === "results" && <Results onBack={() => setScreen("home")} />}
      </View>
    </SafeAreaView>
  );
}

function nowStr() {
  const d = new Date();
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(
    d.getHours()
  )}:${pad(d.getMinutes())}`;
}

// ------------------------------
// Shared UI
// ------------------------------

const Card: React.FC<{
  title: string;
  subtitle?: string;
  onPress?: () => void;
  danger?: boolean;
}> = ({ title, subtitle, onPress, danger }) => (
  <Pressable
    onPress={onPress}
    style={({ pressed }) => [
      styles.card,
      pressed && styles.cardPressed,
      danger && styles.cardDanger,
    ]}
  >
    <Text style={[styles.cardTitle, danger && styles.cardTitleDanger]}>
      {title}
    </Text>
    {subtitle ? <Text style={styles.cardSub}>{subtitle}</Text> : null}
  </Pressable>
);

const Button: React.FC<{
  label: string;
  onPress?: () => void;
  ghost?: boolean;
  danger?: boolean;
}> = ({ label, onPress, ghost, danger }) => (
  <Pressable
    onPress={onPress}
    style={({ pressed }) => [
      styles.btn,
      ghost && styles.btnGhost,
      danger && styles.btnDanger,
      pressed && styles.btnPressed,
    ]}
  >
    <Text
      style={[
        styles.btnText,
        ghost && styles.btnGhostText,
        danger && styles.btnDangerText,
      ]}
    >
      {label}
    </Text>
  </Pressable>
);

// ------------------------------
// Home Screen
// ------------------------------

const Home: React.FC<{ onOpen: (s: any) => void; lastSaved: string }> = ({
  onOpen,
  lastSaved,
}) => (
  <View style={{ gap: 16, width: "100%" }}>
    <Text style={styles.h1}>SprintTap</Text>
    <Text style={styles.muted}>
      순발력 3가지 빠른 테스트 — 60초 안에 측정 시작
    </Text>
    <Card
      title="1) 시각 반응"
      subtitle="화면이 바뀌면 즉시 탭"
      onPress={() => onOpen("visual")}
    />
    <Card
      title="2) 청각 반응"
      subtitle="소리가 나면 즉시 탭"
      onPress={() => onOpen("audio")}
    />

    <Card
      title="3) Go/No‑Go (미끼 포함)"
      subtitle="🔔이 보일 때만 탭 (오탭 감점)"
      onPress={() => onOpen("goNoGo")}
    />

    <View style={{ flexDirection: "row", gap: 12 }}>
      <Button label="결과 보기" onPress={() => onOpen("results")} />
      <Text style={styles.muted}>
        {lastSaved ? `최근 저장: ${lastSaved}` : ""}
      </Text>
    </View>
  </View>
);

// ------------------------------
// Test 1: Visual Reaction (false start detection)
// ------------------------------

const VisualReaction: React.FC<{ onDone: (r: TestResult) => void }> = ({
  onDone,
}) => {
  const [state, setState] = useState<"ready" | "waiting" | "go" | "done">(
    "ready"
  );
  const [bg, setBg] = useState<string>("#111");
  const startRef = useRef<number>(0);
  const trials = useRef<Trial[]>([]);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const totalTrials = 5;

  function scheduleNext() {
    setState("waiting");
    setBg("#111");
    const delay = 700 + Math.random() * 1800;
    timeoutRef.current && clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => {
      startRef.current = Date.now();
      setBg("#16a34a"); // green means go
      setState("go");
    }, delay);
  }

  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  const onTap = () => {
    if (state === "ready") {
      trials.current = [];
      scheduleNext();
      return;
    }
    if (state === "waiting") {
      // false start
      trials.current.push({ ms: 0, ok: false, at: Date.now() });
      scheduleNext();
      return;
    }
    if (state === "go") {
      const ms = Date.now() - startRef.current;
      trials.current.push({ ms, ok: true, at: Date.now() });
      if (trials.current.length >= totalTrials) {
        setState("done");
      } else {
        scheduleNext();
      }
      return;
    }
    if (state === "done") {
      onDone({ key: "visual", trials: trials.current });
    }
  };

  const { avg, best, errors } = summarize(trials.current);

  return (
    <Pressable
      onPress={onTap}
      style={[
        styles.flex1,
        { backgroundColor: bg, justifyContent: "center", alignItems: "center" },
      ]}
    >
      {state === "ready" && <Text style={styles.big}>탭해서 시작</Text>}
      {state === "waiting" && <Text style={styles.big}>초록색이 되면 탭!</Text>}
      {state === "go" && <Text style={styles.big}>지금!</Text>}
      {state !== "ready" && (
        <View
          style={{ position: "absolute", bottom: 40, alignItems: "center" }}
        >
          <Text style={styles.stats}>
            진행: {trials.current.length}/{totalTrials} · 평균 {fmt(avg)} · 최고{" "}
            {fmt(best)} · 오탭 {errors}
          </Text>
          {state === "done" && (
            <Text style={styles.hint}>(탭하여 저장 후 종료)</Text>
          )}
        </View>
      )}
    </Pressable>
  );
};

// ------------------------------
// Test 2: Audio Reaction (auditory-only go; false start penalized)
// ------------------------------
const AudioReaction: React.FC<{ onDone: (r: TestResult) => void }> = ({
  onDone,
}) => {
  const [state, setState] = useState<"ready" | "waiting" | "go" | "done">(
    "ready"
  );
  const [hint, setHint] = useState("탭해서 시작");
  const startRef = useRef(0);
  const trials = useRef<Trial[]>([]);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const totalTrials = 5;

  function scheduleNext() {
    setState("waiting");
    setHint("소리가 나오면 즉시 탭! (지금은 대기)");
    const delay = 900 + Math.random() * 2200;
    timeoutRef.current && clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => {
      startRef.current = Date.now();
      setState("go");
      setHint("지금!");
      Speech.speak("딩", { language: "ko-KR", pitch: 1.1 });
    }, delay);
  }

  useEffect(
    () => () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    },
    []
  );

  const onTap = () => {
    if (state === "ready") {
      trials.current = [];
      scheduleNext();
      return;
    }
    if (state === "waiting") {
      trials.current.push({ ms: 0, ok: false, at: Date.now() });
      scheduleNext();
      return;
    }
    if (state === "go") {
      const ms = Date.now() - startRef.current;
      trials.current.push({ ms, ok: true, at: Date.now() });
      if (trials.current.length >= totalTrials) {
        setState("done");
        setHint("완료! 탭하여 저장");
      } else {
        scheduleNext();
      }
      return;
    }
    if (state === "done") onDone({ key: "audio", trials: trials.current });
  };

  const { avg, best, errors } = summarize(trials.current);

  return (
    <Pressable onPress={onTap} style={[styles.flex1, styles.center]}>
      <Text style={styles.big}>{hint}</Text>
      {state !== "ready" && (
        <View
          style={{ position: "absolute", bottom: 40, alignItems: "center" }}
        >
          <Text style={styles.stats}>
            진행: {trials.current.length}/{totalTrials} · 평균 {Math.round(avg)}{" "}
            ms · 최고 {Math.round(best)} ms · 오탭 {errors}
          </Text>
          {state === "done" && (
            <Text style={styles.hint}>(탭하여 저장 후 종료)</Text>
          )}
        </View>
      )}
    </Pressable>
  );
};

// ------------------------------
// Test 2: Go/No-Go (stimulus discrimination with decoys)
// ------------------------------

const STIMS = [
  "★",
  "◇",
  "●",
  "■",
  "▲",
  "▼",
  "❤",
  "☀",
  "☂",
  "☘",
  "✚",
  "☯",
  "♬",
  "☕️",
  "🔔",
];

const GoNoGo: React.FC<{ onDone: (r: TestResult) => void }> = ({ onDone }) => {
  const [idx, setIdx] = useState(0);
  const [running, setRunning] = useState(false);
  const [show, setShow] = useState<string>("");
  const [target, setTarget] = useState<string>("🔔");
  const trials = useRef<Trial[]>([]);
  const appearAt = useRef<number>(0);
  const totalTrials = 20;
  const timer = useRef<ReturnType<typeof setInterval> | null>(null);

  function start() {
    trials.current = [];
    setRunning(true);
    setIdx(0);
    tick();
    timer.current && clearInterval(timer.current);
    timer.current = setInterval(tick, 800);
  }

  function stop(save?: boolean) {
    timer.current && clearInterval(timer.current);
    setRunning(false);
    if (save) onDone({ key: "goNoGo", trials: trials.current });
  }

  function tick() {
    const isTarget = Math.random() < 0.35; // ~35% targets
    const sym = isTarget ? target : pick(STIMS.filter((s) => s !== target));
    setShow(sym);
    appearAt.current = Date.now();
    setIdx((prev) => prev + 1);
    if (idx + 1 >= totalTrials) {
      setTimeout(() => stop(true), 820);
    }
  }

  function onTap() {
    if (!running) {
      start();
      return;
    }
    if (show === target) {
      const ms = Date.now() - appearAt.current;
      trials.current.push({ ms, ok: true, at: Date.now() });
    } else {
      trials.current.push({ ms: 0, ok: false, at: Date.now() });
    }
  }

  useEffect(
    () => () => {
      timer.current && clearInterval(timer.current);
    },
    []
  );

  const { avg, best, errors } = summarize(trials.current);

  return (
    <Pressable onPress={onTap} style={[styles.flex1, styles.center]}>
      {!running && (
        <Text style={styles.hint}>목표 기호: {target} (탭해서 시작)</Text>
      )}
      <Text style={styles.giant}>{running ? show : "🔔"}</Text>
      <Text style={styles.stats}>
        진행: {Math.min(idx, totalTrials)}/{totalTrials} · 평균 {fmt(avg)} ·
        최고 {fmt(best)} · 오탭 {errors}
      </Text>
      {running && <Button label="중단" ghost onPress={() => stop(true)} />}
    </Pressable>
  );
};

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

// ------------------------------
// Test 3: Direction Change Detection
// ------------------------------

const ARROWS = ["↑", "→", "↓", "←"] as const;

type Arrow = (typeof ARROWS)[number];

const DirectionChange: React.FC<{ onDone: (r: TestResult) => void }> = ({
  onDone,
}) => {
  const [arrow, setArrow] = useState<Arrow>("↑");
  const [running, setRunning] = useState(false);
  const [count, setCount] = useState(0);
  const prev = useRef<Arrow>("↑");
  const changeAt = useRef<number>(0);
  const trials = useRef<Trial[]>([]);
  const total = 25;
  const intRef = useRef<ReturnType<typeof setInterval> | null>(null);

  function start() {
    trials.current = [];
    setRunning(true);
    setCount(0);
    changeAt.current = Date.now();
    intRef.current && clearInterval(intRef.current);
    intRef.current = setInterval(() => {
      const next = pick(Array.from(ARROWS));
      prev.current = arrow;
      const changed = next !== arrow;
      setArrow(next);
      setCount((c) => c + 1);
      if (changed) changeAt.current = Date.now();
      if (count + 1 >= total) {
        setTimeout(() => stop(true), 650);
      }
    }, 600);
  }

  function stop(save?: boolean) {
    intRef.current && clearInterval(intRef.current);
    setRunning(false);
    if (save) onDone({ key: "direction", trials: trials.current });
  }

  function onTap() {
    if (!running) {
      start();
      return;
    }
    const isChange = arrow !== prev.current;
    if (isChange) {
      const ms = Date.now() - changeAt.current;
      trials.current.push({ ms, ok: true, at: Date.now() });
    } else {
      trials.current.push({ ms: 0, ok: false, at: Date.now() });
    }
  }

  useEffect(
    () => () => {
      intRef.current && clearInterval(intRef.current);
    },
    []
  );

  const { avg, best, errors } = summarize(trials.current);

  return (
    <Pressable onPress={onTap} style={[styles.flex1, styles.center]}>
      {!running && (
        <Text style={styles.hint}>방향이 바뀔 때만 탭 (탭해서 시작)</Text>
      )}
      <Text style={styles.giant}>{arrow}</Text>
      <Text style={styles.stats}>
        진행: {Math.min(count, total)}/{total} · 평균 {fmt(avg)} · 최고{" "}
        {fmt(best)} · 오탭 {errors}
      </Text>
      {running && <Button label="중단" ghost onPress={() => stop(true)} />}
    </Pressable>
  );
};

// ------------------------------
// Results Screen
// ------------------------------

const Results: React.FC<{ onBack: () => void }> = ({ onBack }) => {
  const [tab, setTab] = useState<TestKey>("visual");
  const [items, setItems] = useState<TestResult[]>([]);

  useEffect(() => {
    (async () => {
      setItems(await loadResults(tab));
    })();
  }, [tab]);

  return (
    <View style={{ flex: 1, width: "100%" }}>
      <View style={{ flexDirection: "row", gap: 8, marginBottom: 12 }}>
        <Button
          label="시각"
          ghost={tab !== "visual"}
          onPress={() => setTab("visual")}
        />
        <Button
          label="청각"
          ghost={tab !== "audio"}
          onPress={() => setTab("audio")}
        />
        <Button
          label="Go/No‑Go"
          ghost={tab !== "goNoGo"}
          onPress={() => setTab("goNoGo")}
        />
        <Button
          label="방향"
          ghost={tab !== "direction"}
          onPress={() => setTab("direction")}
        />
        <View style={{ flex: 1 }} />
        <Button label="뒤로" onPress={onBack} />
      </View>
      <FlatList
        data={items}
        keyExtractor={(_, i) => `${i}`}
        contentContainerStyle={{ gap: 12 }}
        renderItem={({ item, index }) => {
          const { avg, best, errors } = summarize(item.trials);
          const when = new Date(item.trials[0]?.at ?? Date.now());
          const ts = `${when.getFullYear()}-${pad(when.getMonth() + 1)}-${pad(
            when.getDate()
          )} ${pad(when.getHours())}:${pad(when.getMinutes())}`;
          return (
            <View style={styles.resCard}>
              <Text style={styles.cardTitle}>
                세션 {index + 1} · {ts}
              </Text>
              <Text style={styles.cardSub}>
                평균 {fmt(avg)} · 최고 {fmt(best)} · 오탭 {errors} · 시도{" "}
                {item.trials.length}
              </Text>
            </View>
          );
        }}
        ListEmptyComponent={
          <Text style={styles.muted}>아직 저장된 결과가 없습니다.</Text>
        }
      />
      <Button
        label="모두 삭제"
        danger
        onPress={async () => {
          await AsyncStorage.multiRemove([
            "sprinttap:visual",
            "sprinttap:goNoGo",
            "sprinttap:direction",
            "sprinttap:audio",
          ]);
          setItems([]);
          Alert.alert("삭제 완료");
        }}
      />
    </View>
  );
};

// ------------------------------
// Styles
// ------------------------------

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#0b0b0b" },
  container: { flex: 1, padding: 20, gap: 16 },
  flex1: { flex: 1, width: "100%" },
  center: { justifyContent: "center", alignItems: "center" },
  h1: { fontSize: 28, fontWeight: "700", color: "#fff" },
  muted: { color: "#9aa0a6" },
  big: { fontSize: 32, fontWeight: "700", color: "#fff" },
  giant: { fontSize: 72, fontWeight: "800", color: "#fff", marginVertical: 8 },
  stats: { marginTop: 8, color: "#cbd5e1" },
  hint: { color: "#a1a1aa", marginBottom: 6 },
  card: { padding: 16, borderRadius: 16, backgroundColor: "#18181b" },
  cardPressed: { opacity: 0.7 },
  cardDanger: { backgroundColor: "#3b0b0b" },
  cardTitle: { color: "#fff", fontWeight: "700", fontSize: 16 },
  cardTitleDanger: { color: "#ffe5e5" },
  cardSub: { color: "#b3b3b3", marginTop: 4 },
  btn: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: "#2563eb",
    borderRadius: 12,
  },
  btnPressed: { opacity: 0.85 },
  btnText: { color: "#fff", fontWeight: "700" },
  btnGhost: {
    backgroundColor: "transparent",
    borderWidth: 1,
    borderColor: "#334155",
  },
  btnGhostText: { color: "#e2e8f0" },
  btnDanger: { backgroundColor: "#dc2626" },
  btnDangerText: { color: "#fff" },
  resCard: { padding: 14, borderRadius: 14, backgroundColor: "#111827" },
});
