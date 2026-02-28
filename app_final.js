import { auth, db } from "./firebase.js";
import { signInWithEmailAndPassword, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/12.9.0/firebase-auth.js";
import { collection, getDocs, query, where } from "https://www.gstatic.com/firebasejs/12.9.0/firebase-firestore.js";

const loginSection = document.getElementById("loginSection");
const appInterface = document.getElementById("appInterface");
const mainDisplay = document.getElementById("mainDisplay");

// Monitor de Login
onAuthStateChanged(auth, (user) => {
    if (user) {
        loginSection.style.display = "none";
        appInterface.style.display = "flex";
        carregarGuiasAtivas();
    } else {
        loginSection.style.display = "flex";
        appInterface.style.display = "none";
    }
});

// Função Login
document.getElementById("btnLogin").onclick = async () => {
    const email = document.getElementById("email").value;
    const senha = document.getElementById("senha").value;
    try {
        await signInWithEmailAndPassword(auth, email, senha);
    } catch (error) {
        alert("Erro: " + error.message);
    }
};

// Logout
document.getElementById("btnLogout").onclick = () => signOut(auth);

// Carregar Histórico na Home
async function carregarGuiasAtivas() {
    mainDisplay.innerHTML = "Carregando...";
    const q = query(collection(db, "guias"), where("status", "!=", "Arquivada"));
    const snap = await getDocs(q);
    
    let html = `<table class="sei-table"><thead><tr><th>Guia</th><th>Unidade</th><th>Data</th><th>Status</th></tr></thead><tbody>`;
    snap.forEach(doc => {
        const g = doc.data();
        html += `<tr><td>${g.numero || g.numeroGuia}</td><td>${g.unidade}</td><td>${g.dataRecebimento}</td><td>${g.status}</td></tr>`;
    });
    mainDisplay.innerHTML = html + "</tbody></table>";
}
