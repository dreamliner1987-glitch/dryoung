import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import firebaseConfig from "./firebaseConfig.js";

// Firebase 초기화
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

/**
 * 로그인 상태 확인 및 보호 로직
 * @param {Function} onUserCallback - 사용자가 로그인되어 있을 때 실행할 콜백
 * @param {boolean} redirectIfUnauth - 로그인 안 되어 있을 시 login.html로 이동할지 여부
 */
export function checkAuthState(onUserCallback, redirectIfUnauth = true) {
    onAuthStateChanged(auth, (user) => {
        if (user) {
            if (onUserCallback) onUserCallback(user);
        } else {
            if (redirectIfUnauth) {
                window.location.href = "login.html";
            }
        }
    });
}

/**
 * 회원가입
 */
export async function register(email, password) {
    try {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        return { user: userCredential.user, error: null };
    } catch (error) {
        return { user: null, error: error.message };
    }
}

/**
 * 로그인
 */
export async function login(email, password) {
    try {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        return { user: userCredential.user, error: null };
    } catch (error) {
        return { user: null, error: error.message };
    }
}

/**
 * 로그아웃
 */
export async function logout() {
    try {
        await signOut(auth);
        window.location.href = "login.html";
    } catch (error) {
        console.error("로그아웃 중 오류 발생:", error);
    }
}

export { auth };
