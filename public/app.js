// app.js - Firebase Auth & Firestore & Gemini
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getFirestore, collection, addDoc, query, orderBy, limit, onSnapshot, serverTimestamp, where } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

// 1. Firebase 설정 (본인의 값으로 교체 필수!)
const firebaseConfig = {
  apiKey: "AIzaSyCN-rB2ARHcaTnoKt4I2EWrMJwB_yq69no",
  authDomain: "aicodings.firebaseapp.com",
  projectId: "aicodings",
  storageBucket: "aicodings.firebasestorage.app",
  messagingSenderId: "452628302290",
  appId: "1:452628302290:web:d261a19b8fe1406b7da00b",
  measurementId: "G-K548B64B01"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

// 2. UI 요소
const authSection = document.getElementById('authSection');
const mainApp = document.getElementById('mainApp');
const authForm = document.getElementById('authForm');
const emailInput = document.getElementById('emailInput');
const passwordInput = document.getElementById('passwordInput');
const authSubmitBtn = document.getElementById('authSubmitBtn');
const logoutBtn = document.getElementById('logoutBtn');
const userStatus = document.getElementById('userStatus');
const authError = document.getElementById('authError');
const loginTab = document.getElementById('loginTab');
const signupTab = document.getElementById('signupTab');

let isSignupMode = false;
let currentUser = null;

// --- 인증 모드 전환 (로그인 <-> 회원가입) ---
loginTab.addEventListener('click', () => {
    isSignupMode = false;
    loginTab.classList.add('active');
    signupTab.classList.remove('active');
    authSubmitBtn.innerText = "로그인";
    authError.classList.add('hidden');
});

signupTab.addEventListener('click', () => {
    isSignupMode = true;
    signupTab.classList.add('active');
    loginTab.classList.remove('active');
    authSubmitBtn.innerText = "회원가입";
    authError.classList.add('hidden');
});

// --- 회원가입/로그인 처리 ---
authForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = emailInput.value;
    const password = passwordInput.value;
    authError.classList.add('hidden');

    try {
        if (isSignupMode) {
            await createUserWithEmailAndPassword(auth, email, password);
            alert("회원가입 성공!");
        } else {
            await signInWithEmailAndPassword(auth, email, password);
        }
    } catch (error) {
        authError.innerText = error.message;
        authError.classList.remove('hidden');
    }
});

// --- 로그아웃 ---
logoutBtn.addEventListener('click', () => signOut(auth));

// --- 인증 상태 감시 (로그인 여부 확인) ---
onAuthStateChanged(auth, (user) => {
    if (user) {
        currentUser = user;
        authSection.classList.add('hidden');
        mainApp.classList.remove('hidden');
        logoutBtn.classList.remove('hidden');
        userStatus.innerText = `${user.email}님 환영합니다!`;
        loadHistory(user.uid);
    } else {
        currentUser = null;
        authSection.classList.remove('hidden');
        mainApp.classList.add('hidden');
        logoutBtn.classList.add('hidden');
        userStatus.innerText = "지능형 진단 보조 도구";
    }
});

// --- 기록 불러오기 (로그인한 사용자의 것만) ---
function loadHistory(uid) {
    const historyList = document.getElementById('historyList');
    const q = query(
        collection(db, "diagnoses"), 
        where("userId", "==", uid), // 내 아이디인 것만 필터링
        orderBy("timestamp", "desc"), 
        limit(5)
    );

    onSnapshot(q, (snapshot) => {
        historyList.innerHTML = "";
        if (snapshot.empty) {
            historyList.innerHTML = "<li>기록이 없습니다.</li>";
            return;
        }
        snapshot.forEach((doc) => {
            const data = doc.data();
            const date = data.timestamp ? new Date(data.timestamp.seconds * 1000).toLocaleString() : "저장 중...";
            const li = document.createElement('li');
            li.className = "history-item";
            li.innerHTML = `
                <span class="date">${date}</span>
                <strong>증상:</strong> ${data.symptom.substring(0, 30)}...<br>
                <strong>결과:</strong> ${data.diagnosis.substring(0, 50)}...
            `;
            historyList.appendChild(li);
        });
    });
}

// --- 진단 기능 (Gemini API) ---
let geminiKey = localStorage.getItem('geminiApiKey') || "";
let availableModels = [];

async function loadModels() {
    if (!geminiKey) return;
    try {
        const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${geminiKey}`);
        const data = await res.json();
        if (data.models) {
            availableModels = data.models
                .filter(m => m.supportedGenerationMethods.includes("generateContent"))
                .map(m => m.name.replace("models/", ""));
        }
    } catch (e) {}
}
loadModels();

const diagnoseBtn = document.getElementById('diagnoseBtn');
const symptomInput = document.getElementById('symptomInput');
const resultSection = document.getElementById('resultSection');
const aiResult = document.getElementById('aiResult');

diagnoseBtn.addEventListener('click', async () => {
    const symptom = symptomInput.value.trim();
    if (!symptom || !currentUser) return;

    if (!geminiKey) {
        const inputKey = prompt("Gemini API 키가 필요합니다. 본인의 API 키를 입력해주세요:");
        if (inputKey) {
            geminiKey = inputKey.trim();
            localStorage.setItem('geminiApiKey', geminiKey);
            await loadModels();
        } else {
            return;
        }
    }

    diagnoseBtn.disabled = true;
    diagnoseBtn.innerText = "분석 중...";
    resultSection.classList.remove('hidden');

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 30000);

    try {
        const modelsToTry = availableModels.length > 0 ? availableModels : ["gemini-1.5-flash", "gemini-pro"];
        let lastError = "응답이 없습니다.";

        for (const modelName of modelsToTry) {
            try {
                const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${geminiKey}`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ contents: [{ parts: [{ text: `다음 증상을 분석하여 한글로 진단과 조언을 해줘: ${symptom}` }] }] }),
                    signal: controller.signal
                });
                
                const data = await response.json();
                if (data.error) {
                    lastError = data.error.message;
                    continue;
                }

                if (data.candidates && data.candidates.length > 0) {
                    const candidate = data.candidates[0];
                    if (candidate.content && candidate.content.parts && candidate.content.parts.length > 0) {
                        const result = candidate.content.parts[0].text;
                        aiResult.innerText = result;

                        // 비동기 저장
                        addDoc(collection(db, "diagnoses"), {
                            userId: currentUser.uid,
                            symptom: symptom,
                            diagnosis: result,
                            timestamp: serverTimestamp()
                        }).catch(e => console.error("저장 실패:", e));

                        clearTimeout(timeout);
                        return;
                    }
                }
            } catch (err) {
                lastError = err.name === "AbortError" ? "시간 초과" : err.message;
                if (err.name === "AbortError") break;
            }
        }
        aiResult.innerText = "분석 실패: " + lastError;
    } finally {
        clearTimeout(timeout);
        diagnoseBtn.disabled = false;
        diagnoseBtn.innerText = "AI 분석 시작";
    }
});
