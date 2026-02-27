import { auth } from "./firebase.js";
import {
    GoogleAuthProvider,
    signInWithPopup,
    onAuthStateChanged,
    signOut
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";

const provider = new GoogleAuthProvider();

const btnGoogle = document.getElementById("btnGoogle");
const btnLogout = document.getElementById("btnLogout");
const loginArea = document.getElementById("loginArea");
const menuSistema = document.getElementById("menuSistema");
const erroMsg = document.getElementById("erroLogin");

// LOGIN GOOGLE
btnGoogle?.addEventListener("click", async () => {

    try {
        const result = await signInWithPopup(auth, provider);
        const user = result.user;

        // 🔒 Restringir domínio institucional
        if (!user.email.endsWith("@defensoria.rj.def.br")) {
            erroMsg.innerText = "Utilize apenas e-mail institucional.";
            await signOut(auth);
        }

    } catch (error) {
        erroMsg.innerText = "Erro ao autenticar.";
    }
});

// MONITORAR LOGIN
onAuthStateChanged(auth, (user) => {
    if (user) {
        loginArea.style.display = "none";
        menuSistema.style.display = "block";
    } else {
        loginArea.style.display = "block";
        menuSistema.style.display = "none";
    }
});

// LOGOUT
btnLogout?.addEventListener("click", async () => {
    await signOut(auth);
});
