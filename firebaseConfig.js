// Firebase 설정 객체 (사용자가 제공한 정보)
const firebaseConfig = {
  apiKey: "AIzaSyCN-rB2ARHcaTnoKt4I2EWrMJwB_yq69no",
  authDomain: "aicodings.firebaseapp.com",
  projectId: "aicodings",
  storageBucket: "aicodings.firebasestorage.app",
  messagingSenderId: "452628302290",
  appId: "1:452628302290:web:d261a19b8fe1406b7da00b",
  measurementId: "G-K548B64B01"
};

// Firebase 초기화 (CDN 방식 사용 시 모듈에서 export하여 재사용 가능하게 구성 가능)
// 현재는 diagnosis.html 등에서 직접 초기화하여 사용 중입니다.
export default firebaseConfig;
