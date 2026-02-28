import { auth, db } from "./firebase.js";
import { signInWithEmailAndPassword, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/12.9.0/firebase-auth.js";
import { collection, getDocs, query, where } from "https://www.gstatic.com/firebasejs/12.9.0/firebase-firestore.js";

// --- ELEMENTOS ---
const loginSection = document.getElementById("loginSection");
const appInterface = document.getElementById("appInterface");
const mainDisplay = document.getElementById("mainDisplay");

// --- MONITOR DE SESSÃO ---
onAuthStateChanged(auth, (user) => {
    if (user) {
        if(loginSection) loginSection.style.display = "none";
        if(appInterface) appInterface.style.display = "flex";
        if (mainDisplay) carregarGuiasAtivas();
    } else {
        if(loginSection) loginSection.style.display = "flex";
        if(appInterface) appInterface.style.display = "none";
    }
});

// --- LOGIN COM DIAGNÓSTICO DE ERRO ---
const btnLogin = document.getElementById("btnLogin");
if (btnLogin) {
    btnLogin.onclick = async () => {
        const email = document.getElementById("email").value.trim();
        const senha = document.getElementById("senha").value.trim();
        
        try {
            await signInWithEmailAndPassword(auth, email, senha);
        } catch (error) {
            console.error("Erro Firebase:", error.code);
            if (error.code === "auth/invalid-credential") {
                alert("E-mail ou senha incorretos.");
            } else if (error.code === "auth/network-request-failed") {
                alert("Erro de rede: Verifique sua internet ou se o domínio está autorizado no Firebase.");
            } else {
                alert("Erro ao entrar: " + error.code);
            }
        }
    };
}

// --- LOGOUT ---
document.getElementById("btnLogout").onclick = () => signOut(auth);

// --- FUNÇÃO VER DETALHES (MODAL) ---
window.verDetalhes = async function(guiaId, numeroGuia) {
    const modal = document.getElementById("modalDetalhes");
    const corpo = document.getElementById("modalCorpo");
    const titulo = document.getElementById("modalTitulo");

    if (!modal || !corpo) return;

    titulo.innerText = "Itens da Guia: " + numeroGuia;
    corpo.innerHTML = "<p>Buscando documentos...</p>";
    modal.style.display = "block";

    try {
        const docsSnap = await getDocs(collection(db, "guias", guiaId, "documentos"));
        if (docsSnap.empty) {
            corpo.innerHTML = "<p>Nenhum documento encontrado nesta guia.</p>";
        } else {
            let html = `<table class="sei-table"><thead><tr><th>Documento</th><th>Processo SEI</th></tr></thead><tbody>`;
            docsSnap.forEach(doc => {
                const d = doc.data();
                html += `<tr><td>${d.nomeDocumento || "---"}</td><td>${d.numeroProcesso || "---"}</td></tr>`;
            });
            corpo.innerHTML = html + "</tbody></table>";
        }
    } catch (e) {
        corpo.innerHTML = "<p>Erro ao carregar dados.</p>";
    }
};

// --- FECHAR MODAL ---
document.querySelector(".close-btn").onclick = () => {
    document.getElementById("modalDetalhes").style.display = "none";
};

// --- CARREGAR HISTÓRICO ---
async function carregarGuiasAtivas() {
    if (!mainDisplay) return;
    mainDisplay.innerHTML = "<p>Carregando...</p>";

    try {
        // Busca apenas guias que NÃO estão arquivadas
        const q = query(collection(db, "guias"), where("status", "!=", "Arquivada"));
        const snap = await getDocs(q);

        if (snap.empty) {
            mainDisplay.innerHTML = "<p>Não há guias ativas.</p>";
            return;
        }

        let html = `<table class="sei-table">
            <thead><tr><th>Nº Guia</th><th>Unidade</th><th>Status</th><th>Ação</th></tr></thead>
            <tbody>`;

        snap.forEach(docSnap => {
            const g = docSnap.data();
            const id = docSnap.id;
            // Verifica se o campo é 'numero' ou 'numeroGuia' para não vir vazio
            const num = g.numero || g.numeroGuia || "S/N";
            
            html += `<tr>
                <td>${num}</td>
                <td>${g.unidade}</td>
                <td><span class="status-badge">${g.status}</span></td>
                <td><button class="btn-ver" onclick="verDetalhes('${id}', '${num}')">👁 Ver Itens</button></td>
            </tr>`;
        });

        mainDisplay.innerHTML = html + "</tbody></table>";
    } catch (error) {
        mainDisplay.innerHTML = "<p>Erro ao carregar o banco de dados.</p>";
        console.error(error);
    }
}
