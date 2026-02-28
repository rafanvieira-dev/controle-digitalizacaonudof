import { auth, db } from "./firebase.js";
import { signInWithEmailAndPassword, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/12.9.0/firebase-auth.js";
import { collection, getDocs, query, where, doc, getDoc } from "https://www.gstatic.com/firebasejs/12.9.0/firebase-firestore.js";

// Variável global para saber quem está logado
let usuarioLogadoEmail = "";

// --- MONITOR DE SESSÃO ---
onAuthStateChanged(auth, (user) => {
    const loginSection = document.getElementById("loginSection");
    const appInterface = document.getElementById("appInterface");
    const mainDisplay = document.getElementById("mainDisplay");

    if (user) {
        usuarioLogadoEmail = user.email; // Guarda o e-mail de quem logou
        if(loginSection) loginSection.style.display = "none";
        if(appInterface) appInterface.style.display = "flex";
        if (mainDisplay) carregarGuiasAtivas();
    } else {
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
            console.error("Erro Firebase:", error.code);
            if (error.code === 'auth/network-request-failed') {
                alert("ERRO DE CONEXÃO: O Firebase bloqueou o acesso. Verifique se o domínio 127.0.0.1 está autorizado no Console do Firebase ou se sua rede possui firewall.");
            } else {
                alert("Erro: E-mail ou senha incorretos.");
            }
        }
    };
}

// --- LOGOUT ---
const btnLogout = document.getElementById("btnLogout");
if (btnLogout) {
    btnLogout.onclick = () => signOut(auth);
}

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
            corpo.innerHTML = "<p style='padding:20px;'>Nenhum documento nesta guia.</p>";
        } else {
            let html = `<table class="sei-table"><thead><tr><th>Documento</th><th>Processo SEI</th></tr></thead><tbody>`;
            docsSnap.forEach(doc => {
                const d = doc.data();
                html += `<tr><td>${d.nomeDocumento}</td><td>${d.numeroProcesso}</td></tr>`;
            });
            corpo.innerHTML = html + "</tbody></table>";
        }
    } catch (e) {
        corpo.innerHTML = "<p>Erro ao carregar dados.</p>";
    }
};

// --- FECHAR MODAL ---
const closeBtn = document.querySelector(".close-btn");
if (closeBtn) {
    closeBtn.onclick = () => document.getElementById("modalDetalhes").style.display = "none";
}

// --- CARREGAR HISTÓRICO (INDEX) ---
async function carregarGuiasAtivas() {
    const mainDisplay = document.getElementById("mainDisplay");
    if (!mainDisplay) return;
    
    mainDisplay.innerHTML = "<p>Carregando...</p>";

    try {
        const q = query(collection(db, "guias"), where("status", "!=", "Arquivada"));
        const snap = await getDocs(q);

        if (snap.empty) {
            mainDisplay.innerHTML = "<p>Não há guias ativas.</p>";
            return;
        }

        let guiasArray = [];
        snap.forEach(d => guiasArray.push({ id: d.id, ...d.data() }));

        // Ordenar: Mais recentes primeiro (pelo número)
        guiasArray.sort((a, b) => (parseInt(b.numeroGuia || b.numero) - parseInt(a.numeroGuia || a.numero)));

        let html = `<table class="sei-table">
            <thead><tr><th>Nº Guia</th><th>Unidade</th><th>Status</th><th>Ação</th></tr></thead>
            <tbody>`;

        guiasArray.forEach(g => {
            const num = g.numeroGuia || g.numero || "S/N";
            html += `<tr>
                <td>${num}</td>
                <td>${g.unidade}</td>
                <td><span class="status-badge">${g.status}</span></td>
                <td><button class="btn-ver" onclick="verDetalhes('${g.id}', '${num}')">👁 Ver</button></td>
            </tr>`;
        });

        mainDisplay.innerHTML = html + "</tbody></table>";
    } catch (error) {
        console.error(error);
        mainDisplay.innerHTML = "<p>Erro ao conectar com o banco de dados.</p>";
    }
}
