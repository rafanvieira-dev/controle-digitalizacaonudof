import { auth, db } from "./firebase.js";
import { signInWithEmailAndPassword, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/12.9.0/firebase-auth.js";
import { collection, getDocs, query, where, doc, updateDoc, addDoc } from "https://www.gstatic.com/firebasejs/12.9.0/firebase-firestore.js";

// --- CONTROLE DE INTERFACE ---
const loginSection = document.getElementById("loginSection");
const appInterface = document.getElementById("appInterface");
const mainDisplay = document.getElementById("mainDisplay");
const pageTitle = document.getElementById("pageTitle");

// Monitor de Login
onAuthStateChanged(auth, (user) => {
    if (user) {
        if(loginSection) loginSection.classList.add("hidden");
        if(appInterface) {
            appInterface.classList.remove("hidden");
            appInterface.style.display = "flex";
        }
        carregarGuiasAtivas();
    } else {
        if(loginSection) loginSection.classList.remove("hidden");
        if(appInterface) {
            appInterface.classList.add("hidden");
            appInterface.style.display = "none";
        }
    }
});

// Ação de Login
const btnLogin = document.getElementById("btnLogin");
if (btnLogin) {
    btnLogin.onclick = async () => {
        const email = document.getElementById("email").value;
        const senha = document.getElementById("senha").value;
        try {
            await signInWithEmailAndPassword(auth, email, senha);
        } catch (error) {
            alert("Falha no login: " + error.message);
        }
    };
}

// Ação de Logout
const btnLogout = document.getElementById("btnLogout");
if (btnLogout) btnLogout.onclick = () => signOut(auth);

// --- FUNÇÕES DE EXIBIÇÃO ---

async function carregarGuiasAtivas() {
    pageTitle.innerText = "Histórico de Guias Ativas";
    mainDisplay.innerHTML = "Carregando...";
    
    const q = query(collection(db, "guias"), where("status", "!=", "Arquivada"));
    const snap = await getDocs(q);
    
    if (snap.empty) {
        mainDisplay.innerHTML = "<p>Nenhuma guia ativa encontrada.</p>";
        return;
    }

    let html = `<table class="sei-table">
                <thead>
                    <tr>
                        <th>Nº Guia</th>
                        <th>Unidade</th>
                        <th>Data Recebimento</th>
                        <th>Status</th>
                    </tr>
                </thead>
                <tbody>`;

    snap.forEach(d => {
        const guia = d.data();
        html += `<tr>
                    <td>${guia.numeroGuia || guia.numero || "---"}</td>
                    <td>${guia.unidade || "---"}</td>
                    <td>${guia.dataRecebimento || "---"}</td>
                    <td>${guia.status || "Aberta"}</td>
                </tr>`;
    });

    html += `</tbody></table>`;
    mainDisplay.innerHTML = html;
}

// --- MAPEAMENTO DO MENU ---

// Link para Inserir Documentos (Abre a página que você recuperou)
document.getElementById("menuDocs").onclick = () => {
    window.location.href = "documentos.html";
};

// Link para Nova Guia
document.getElementById("menuNovaGuia").onclick = () => {
    pageTitle.innerText = "Cadastrar Nova Guia";
    mainDisplay.innerHTML = `
        <div class="form-container">
            <label>Número da Guia:</label>
            <input type="text" id="new_guia_num" placeholder="Ex: 123/2026">
            <label>Unidade Solicitante:</label>
            <input type="text" id="new_guia_uni" placeholder="Ex: Secretaria X">
            <label>Data:</label>
            <input type="date" id="new_guia_date" value="${new Date().toISOString().split('T')[0]}">
            <button id="btnSalvarGuia" class="btn-primary" style="margin-top:10px;">Criar Guia</button>
        </div>
    `;

    document.getElementById("btnSalvarGuia").onclick = async () => {
        const num = document.getElementById("new_guia_num").value;
        const uni = document.getElementById("new_guia_uni").value;
        const data = document.getElementById("new_guia_date").value;

        if(!num || !uni) return alert("Preencha os campos obrigatórios!");

        await addDoc(collection(db, "guias"), {
            numeroGuia: num,
            unidade: uni,
            dataRecebimento: data,
            status: "Aberta",
            timestamp: new Date()
        });
        alert("Guia cadastrada com sucesso!");
        carregarGuiasAtivas();
    };
};

// Link para Histórico Principal
document.getElementById("menuHistorico").onclick = carregarGuiasAtivas;

// Link para Arquivadas
document.getElementById("menuArquivadas").onclick = async () => {
    pageTitle.innerText = "Guias Arquivadas";
    const q = query(collection(db, "guias"), where("status", "==", "Arquivada"));
    const snap = await getDocs(q);
    
    let html = `<table class="sei-table"><thead><tr><th>Guia</th><th>Unidade</th><th>Caixa</th></tr></thead><tbody>`;
    snap.forEach(d => {
        html += `<tr><td>${d.data().numeroGuia}</td><td>${d.data().unidade}</td><td>${d.data().caixa}</td></tr>`;
    });
    mainDisplay.innerHTML = html + `</tbody></table>`;
};
