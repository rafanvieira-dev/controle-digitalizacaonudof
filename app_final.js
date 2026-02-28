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
            <thead><tr><th style="padding:10px; border-bottom:1px solid #ddd; text-align: left;">Nº Guia</th><th style="padding:10px; border-bottom:1px solid #ddd; text-align: left;">Unidade</th><th style="padding:10px; border-bottom:1px solid #ddd; text-align: left;">Status</th><th style="padding:10px; border-bottom:1px solid #ddd; text-align: left;">Ação</th></tr></thead>
            <tbody>`;

        snap.forEach(d => {
            const g = d.data();
            const num = g.numero || g.numeroGuia || "S/N";
            // Repare que adicionei window. antes do verDetalhes
            html += `<tr>
                <td style="padding:10px; border-bottom:1px solid #eee;">${num}</td>
                <td style="padding:10px; border-bottom:1px solid #eee;">${g.unidade}</td>
                <td style="padding:10px; border-bottom:1px solid #eee;"><span class="status-badge" style="background: #e8f4fd; color: #003366; padding: 5px 10px; border-radius: 4px; font-weight: bold;">${g.status}</span></td>
                <td style="padding:10px; border-bottom:1px solid #eee;"><button class="btn-ver" onclick="window.verDetalhes('${d.id}', '${num}')" style="background:#4682B4; color:white; padding:8px 12px; border:none; border-radius:4px; cursor:pointer;">👁 Ver</button></td>
            </tr>`;
        });
        mainDisplay.innerHTML = html + "</tbody></table>";
    } catch (error) {
        mainDisplay.innerHTML = "<p>Erro ao carregar dados.</p>";
    }
}

// --- FUNÇÃO PARA VER DETALHES DA GUIA (Agora atrelada ao window) ---
window.verDetalhes = async function(id, num) {
    const modal = document.getElementById("modalDetalhes");
    const titulo = document.getElementById("modalTitulo");
    const corpo = document.getElementById("modalCorpo");
    
    // Mostra o modal carregando
    modal.style.display = "block";
    titulo.innerText = "Documentos da Guia " + num;
    corpo.innerHTML = "<p>Buscando documentos...</p>";

    try {
        // Vai na coleção guias -> id específico -> subcoleção documentos
        const docsSnap = await getDocs(collection(db, "guias", id, "documentos"));
        
        if (docsSnap.empty) {
            corpo.innerHTML = "<p>Esta guia ainda não possui documentos inseridos.</p>";
        } else {
            let html = `<table class="sei-table" style="width:100%; border-collapse:collapse; margin-top: 15px;">
                <thead><tr style="background:#eee;">
                    <th style="padding:10px; border:1px solid #ddd; text-align: left;">Documento</th>
                    <th style="padding:10px; border:1px solid #ddd; text-align: left;">Nº Processo SEI</th>
                    <th style="padding:10px; border:1px solid #ddd; text-align: left;">Data Rec.</th>
                </tr></thead><tbody>`;
            
            docsSnap.forEach(docItem => {
                const d = docItem.data();
                html += `<tr>
                    <td style="padding:10px; border:1px solid #ddd;">${d.nomeDocumento}</td>
                    <td style="padding:10px; border:1px solid #ddd;">${d.numeroProcesso}</td>
                    <td style="padding:10px; border:1px solid #ddd;">${d.dataRecebimento || '--'}</td>
                </tr>`;
            });
            corpo.innerHTML = html + "</tbody></table>";
        }
    } catch (e) {
        corpo.innerHTML = "<p>Erro ao carregar os documentos da guia.</p>";
        console.error("Erro:", e);
    }
};

// --- FUNÇÕES PARA FECHAR O MODAL ---
// Fecha ao clicar no X
const closeBtn = document.querySelector(".close-btn");
if (closeBtn) {
    closeBtn.onclick = () => {
        document.getElementById("modalDetalhes").style.display = "none";
    };
}

// Fecha ao clicar fora do modal
window.onclick = (event) => {
    const modal = document.getElementById("modalDetalhes");
    if (event.target === modal) {
        modal.style.display = "none";
    }
};
