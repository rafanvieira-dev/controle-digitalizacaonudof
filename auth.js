import { auth } from "./firebase.js";
import { signInWithEmailAndPassword, onAuthStateChanged, signOut } 
from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";

const form = document.getElementById("formLogin");
const loginArea = document.getElementById("loginArea");
const menuSistema = document.getElementById("menuSistema");
const erroMsg = document.getElementById("erroLogin");
const btnLogout = document.getElementById("btnLogout");

// LOGIN
form?.addEventListener("submit", async (e) => {
    e.preventDefault();

    const email = document.getElementById("email").value.trim();
    const senha = document.getElementById("senha").value;

    erroMsg.innerText = "";

    if (!email.endsWith("@defensoria.rj.def.br")) {
        erroMsg.innerText = "Utilize apenas e-mail institucional.";
        return;
    }

    try {
        await signInWithEmailAndPassword(auth, email, senha);
    } catch (error) {
        erroMsg.innerText = "E-mail ou senha inválidos.";
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
