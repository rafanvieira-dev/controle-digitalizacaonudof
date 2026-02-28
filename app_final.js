import { auth, db } from "./firebase.js";
import { signInWithEmailAndPassword, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/12.9.0/firebase-auth.js";
import { collection, getDocs, query, where, doc, getDoc } from "https://www.gstatic.com/firebasejs/12.9.0/firebase-firestore.js";

// --- ELEMENTOS DA INTERFACE ---
const loginSection = document.getElementById("loginSection");
const appInterface = document.getElementById("appInterface");
const mainDisplay = document.getElementById("mainDisplay");

// --- MONITOR DE SESSÃO ---
onAuthStateChanged(auth, (user) => {
    if (user) {
        if(loginSection) loginSection.style.display = "none";
        if(appInterface) appInterface.style.display = "flex";
        
        // Se estivermos na index, carrega o histórico automaticamente
        if (mainDisplay) carregarGuiasAtivas();
    } else {
        if(loginSection) loginSection.style.display = "flex";
        if(appInterface) appInterface.style.display = "none";
    }
});

// --- LOGIN E LOGOUT ---
const btnLogin = document.getElementById("btnLogin");
if (btnLogin) {
    btnLogin.onclick = async () => {
        const email = document.getElementById("email").value.trim();
        const senha = document.getElementById("senha").value.trim();
        try {
            await signInWithEmailAndPassword(auth, email, senha);
        } catch (error) {
            alert("Erro no login: Verifique suas credenciais.");
        }
    };
}

const btnLogout = document.getElementById("btnLogout");
if (btnLogout) {
    btnLogout.onclick = () => signOut(auth);
}

// --- FUNÇÃO GLOBAL PARA VER DETALHES (MODAL) ---
window.verDetalhes = async function(guiaId, numeroGuia) {
    const modal = document.getElementById("modalDetalhes");
    const corpo = document.getElementById("modalCorpo");
    const titulo = document.getElementById("modalTitulo");

    if (!modal || !corpo) return;

    titulo.innerText = "Documentos da Guia: " + numeroGuia;
    corpo.innerHTML = "<p>Carregando itens...</p>";
    modal.style.display = "block";

    try {
        // Busca a subcoleção "documentos" dentro da guia selecionada
        const docsSnap = await getDocs(collection(db, "guias", guiaId, "documentos"));
        
        if (docsSnap.empty) {
            corpo.innerHTML = "<p style='padding:20px; text-align:center;'>Nenhum documento cadastrado nesta guia.</p>";
        } else {
            let html = `
                <table class="sei-table">
                    <thead>
                        <tr>
                            <th>Documento</th>
                            <th>Nº Processo SEI</th>
                            <th>Data Rec.</th>
                        </tr>
                    </thead>
                    <tbody>`;
            
            docsSnap.forEach(doc => {
                const d = doc.data();
                html += `
                    <tr>
                        <td>${d.nomeDocumento || "---"}</td>
                        <td>${d.numeroProcesso || "---"}</td>
                        <td>${d.dataRecebimento || "---"}</td>
                    </tr>`;
            });
            corpo.innerHTML = html + "</tbody></table>";
        }
    } catch (error) {
        console.error(error);
        corpo.innerHTML = "<p>Erro ao carregar os documentos da guia.</p>";
    }
};

// --- CONTROLE DE FECHAMENTO DO MODAL ---
const closeBtn = document.querySelector(".close-btn");
if (closeBtn) {
    closeBtn.onclick = () => document.getElementById("modalDetalhes").style.display = "none";
}

window.onclick = (event) => {
    const modal = document.getElementById("modalDetalhes");
    if (event.target == modal) modal.style.display = "none";
};

// --- CARREGAR HISTÓRICO (INDEX) ---
async function carregarGuiasAtivas() {
    if (!mainDisplay) return;
    mainDisplay.innerHTML = "<p>Carregando guias ativas...</p>";

    try {
        const q = query(collection(db, "guias"), where("status", "!=", "Arquivada"));
        const snap = await getDocs(q);

        if (snap.empty) {
            mainDisplay.innerHTML = "<p>Não há guias abertas no momento.</p>";
            return;
        }

        let html = `
            <table class="sei-table">
                <thead>
                    <tr>
                        <th>Nº Guia</th>
                        <th>Unidade</th>
                        <th>Status</th>
                        <th>Ações</th>
                    </tr>
                </thead>
                <tbody>`;

        snap.forEach(docSnap => {
            const g = docSnap.data();
            const id = docSnap.id;
            const num = g.numero || g.numeroGuia || "S/N";
            
            html += `
                <tr>
                    <td>${num}</td>
                    <td>${g.unidade}</td>
                    <td><span class="status-badge">${g.status}</span></td>
                    <td>
                        <button class="btn-ver" onclick="verDetalhes('${id}', '${num}')">👁 Ver</button>
                    </td>
                </tr>`;
        });

        mainDisplay.innerHTML = html + "</tbody></table>";
    } catch (error) {
        mainDisplay.innerHTML = "<p>Erro ao conectar com o banco de dados.</p>";
    }
}
