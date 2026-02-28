import { auth, db } from "./firebase.js";
import { signInWithEmailAndPassword, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/12.9.0/firebase-auth.js";
import { collection, getDocs, query, where } from "https://www.gstatic.com/firebasejs/12.9.0/firebase-firestore.js";

// --- ELEMENTOS DA INTERFACE ---
const loginSection = document.getElementById("loginSection");
const appInterface = document.getElementById("appInterface");
const mainDisplay = document.getElementById("mainDisplay");
const pageTitle = document.getElementById("pageTitle");

// --- MONITOR DE SESSÃO ---
onAuthStateChanged(auth, (user) => {
    if (user) {
        if(loginSection) loginSection.style.display = "none";
        if(appInterface) appInterface.style.display = "flex";
        
        // Verifica se estamos na index (onde existe o mainDisplay) para carregar as guias
        if (mainDisplay) {
            carregarGuiasAtivas();
        }
    } else {
        if(loginSection) loginSection.style.display = "flex";
        if(appInterface) appInterface.style.display = "none";
    }
});

// --- FUNÇÃO DE LOGIN ---
const btnLogin = document.getElementById("btnLogin");
if (btnLogin) {
    btnLogin.onclick = async () => {
        const email = document.getElementById("email").value.trim();
        const senha = document.getElementById("senha").value.trim();
        try {
            await signInWithEmailAndPassword(auth, email, senha);
        } catch (error) {
            alert("Erro: Verifique e-mail/senha ou conexão.");
            console.error(error);
        }
    };
}

// --- FUNÇÃO DE LOGOUT ---
const btnLogout = document.getElementById("btnLogout");
if (btnLogout) {
    btnLogout.onclick = () => signOut(auth);
}

// --- LÓGICA DO BOTÃO "VER" (MODAL) ---
// Tornamos a função global (window) para que o HTML consiga chamá-la no onclick do botão
window.verDetalhes = async function(guiaId, numeroGuia) {
    const modal = document.getElementById("modalDetalhes");
    const corpo = document.getElementById("modalCorpo");
    const titulo = document.getElementById("modalTitulo");

    if (!modal || !corpo) return;

    titulo.innerText = "Documentos da Guia: " + numeroGuia;
    corpo.innerHTML = "<p>A carregar documentos...</p>";
    modal.style.display = "block";

    try {
        const docsSnap = await getDocs(collection(db, "guias", guiaId, "documentos"));
        if (docsSnap.empty) {
            corpo.innerHTML = "<p>Esta guia ainda não possui documentos inseridos.</p>";
        } else {
            let html = `
                <table class="sei-table">
                    <thead>
                        <tr>
                            <th>Documento</th>
                            <th>Processo SEI</th>
                            <th>Data</th>
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
        corpo.innerHTML = "<p>Erro ao carregar detalhes.</p>";
    }
};

// --- FECHAR MODAL ---
const closeBtn = document.querySelector(".close-btn");
if (closeBtn) {
    closeBtn.onclick = () => {
        document.getElementById("modalDetalhes").style.display = "none";
    };
}

// Fecha se clicar fora da caixa branca
window.onclick = (event) => {
    const modal = document.getElementById("modalDetalhes");
    if (event.target == modal) {
        modal.style.display = "none";
    }
};

// --- CARREGAR HISTÓRICO (COM BOTÃO VER) ---
async function carregarGuiasAtivas() {
    if (!mainDisplay) return;
    mainDisplay.innerHTML = "<p>A carregar guias...</p>";

    try {
        const q = query(collection(db, "guias"), where("status", "!=", "Arquivada"));
        const snap = await getDocs(q);

        if (snap.empty) {
            mainDisplay.innerHTML = "<p>Nenhuma guia aberta encontrada.</p>";
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
                    <td>${g.unidade || "---"}</td>
                    <td><span class="status-badge">${g.status || "Aberta"}</span></td>
                    <td>
                        <button class="btn-ver" onclick="verDetalhes('${id}', '${num}')">👁 Ver Itens</button>
                    </td>
                </tr>`;
        });

        mainDisplay.innerHTML = html + "</tbody></table>";
    } catch (error) {
        console.error(error);
        mainDisplay.innerHTML = "<p>Erro ao carregar dados do Histórico.</p>";
    }
}
