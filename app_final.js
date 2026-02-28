import { auth, db } from "./firebase.js";
import { signInWithEmailAndPassword, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/12.9.0/firebase-auth.js";
import { collection, getDocs, query, where, doc, getDoc } from "https://www.gstatic.com/firebasejs/12.9.0/firebase-firestore.js";

const loadingScreen = document.getElementById("loading");
const loginSection = document.getElementById("loginSection");
const appInterface = document.getElementById("appInterface");

// --- MONITOR DE SESSÃO (CORRIGIDO) ---
onAuthStateChanged(auth, (user) => {
    // Esconde a tela de "Verificando acesso..."
    if (loadingScreen) loadingScreen.style.display = "none";

    if (user) {
        // USUÁRIO LOGADO: Mostra o sistema, esconde o login
        if(loginSection) loginSection.style.display = "none";
        if(appInterface) appInterface.style.display = "flex";
        
        // Se estiver no index, carrega as guias
        if (document.getElementById("mainDisplay")) carregarGuiasAtivas();
    } else {
        // USUÁRIO DESLOGADO: Mostra o login, esconde o sistema
        if(loginSection) loginSection.style.display = "flex";
        if(appInterface) appInterface.style.display = "none";
    }
});

// --- LOGIN ---
const btnLogin = document.getElementById("btnLogin");
if (btnLogin) {
    btnLogin.onclick = async () => {
        const email = document.getElementById("email").value.trim();
        const senha = document.getElementById("senha").value.trim();
        
        try {
            await signInWithEmailAndPassword(auth, email, senha);
        } catch (error) {
            alert("E-mail ou senha inválidos.");
        }
    };
}

// --- LOGOUT ---
const btnLogout = document.getElementById("btnLogout");
if (btnLogout) {
    btnLogout.onclick = async () => {
        await signOut(auth);
        window.location.href = "index.html";
    };
}

// --- CARREGAR HISTÓRICO ---
async function carregarGuiasAtivas() {
    const mainDisplay = document.getElementById("mainDisplay");
    if (!mainDisplay) return;
    
    try {
        const q = query(collection(db, "guias"), where("status", "!=", "Arquivada"));
        const snap = await getDocs(q);
        
        if (snap.empty) {
            mainDisplay.innerHTML = "<p>Não há guias ativas.</p>";
            return;
        }

        let html = `<table class="sei-table">
            <thead><tr><th>Nº Guia</th><th>Unidade</th><th>Status</th><th>Ação</th></tr></thead>
            <tbody>`;

        snap.forEach(d => {
            const g = d.data();
            const num = g.numero || g.numeroGuia || "S/N";
            html += `<tr>
                <td>${num}</td>
                <td>${g.unidade}</td>
                <td><span class="status-badge">${g.status}</span></td>
                <td><button class="btn-ver" onclick="verDetalhes('${d.id}', '${num}')">👁 Ver</button></td>
            </tr>`;
        });
        mainDisplay.innerHTML = html + "</tbody></table>";
    } catch (error) {
        mainDisplay.innerHTML = "<p>Erro ao carregar dados.</p>";
    }
}
