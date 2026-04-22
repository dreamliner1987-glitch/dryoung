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
const GEMINI_API_KEY = localStorage.getItem('geminiApiKey') || "";
// (키 입력 로직은 이전과 동일하므로 생략하거나 기존 로직 유지)

const diagnoseBtn = document.getElementById('diagnoseBtn');
const symptomInput = document.getElementById('symptomInput');
const resultSection = document.getElementById('resultSection');
const aiResult = document.getElementById('aiResult');

diagnoseBtn.addEventListener('click', async () => {
    const symptom = symptomInput.value.trim();
    if (!symptom || !currentUser) return;

    diagnoseBtn.disabled = true;
    diagnoseBtn.innerText = "분석 중...";
    resultSection.classList.remove('hidden');

    try {
        const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-3-flash-preview:generateContent?key=${GEMINI_API_KEY}`;
        const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{ parts: [{ text: `증상 분석 및 진단: ${symptom}` }] }]
            })
        });
        const data = await response.json();
        const result = data.candidates[0].content.parts[0].text;
        aiResult.innerText = result;

        // DB에 내 아이디와 함께 저장
        await addDoc(collection(db, "diagnoses"), {
            userId: currentUser.uid,
            symptom: symptom,
            diagnosis: result,
            timestamp: serverTimestamp()
        });
    } catch (e) {
        aiResult.innerText = "오류 발생: " + e.message;
    } finally {
        diagnoseBtn.disabled = false;
        diagnoseBtn.innerText = "AI 분석 시작";
    }
});
