import { auth, db } from "./firebase.js";
import { onAuthStateChanged, signOut, signInWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/12.9.0/firebase-auth.js";
import { collection, getDocs, query, where, doc, updateDoc, addDoc } from "https://www.gstatic.com/firebasejs/12.9.0/firebase-firestore.js";

// --- LOGIN ---
onAuthStateChanged(auth, (user) => {
    if (user) {
        document.getElementById("loginSection").classList.add("hidden");
        document.getElementById("appInterface").style.display = "flex";
        carregarGuiasAtivas();
    } else {
        document.getElementById("loginSection").classList.remove("hidden");
        document.getElementById("appInterface").style.display = "none";
    }
});

document.getElementById("btnLogin").onclick = () => {
    const email = document.getElementById("email").value;
    const senha = document.getElementById("senha").value;
    signInWithEmailAndPassword(auth, email, senha).catch(e => alert("Erro: " + e.message));
};

document.getElementById("btnLogout").onclick = () => signOut(auth);

// --- FUNÇÃO PARA RENDERIZAR TABELA ESTILO EXCEL ---
function exibirTabela(dados, colunas, elemento, campoData) {
    elemento.innerHTML = "";
    const grupos = dados.reduce((acc, item) => {
        const data = item[campoData] || "Sem Data";
        if (!acc[data]) acc[data] = [];
        acc[data].push(item);
        return acc;
    }, {});

    const datasOrdenadas = Object.keys(grupos).sort((a, b) => new Date(b) - new Date(a));

    datasOrdenadas.forEach(data => {
        elemento.innerHTML += `<div class="data-header">Data: ${data}</div>`;
        let tabela = `<table class="sei-table"><thead><tr>`;
        colunas.forEach(col => tabela += `<th>${col.label}</th>`);
        tabela += `</tr></thead><tbody>`;
        grupos[data].forEach(row => {
            tabela += `<tr>${colunas.map(c => `<td>${row[c.field] || ""}</td>`).join('')}</tr>`;
        });
        elemento.innerHTML += tabela + `</tbody></table>`;
    });
}

// --- PÁGINAS ---
async function carregarGuiasAtivas() {
    document.getElementById("pageTitle").innerText = "Histórico de Guias Ativas";
    const snap = await getDocs(query(collection(db, "guias"), where("status", "!=", "Arquivada")));
    const dados = snap.docs.map(d => d.data());
    exibirTabela(dados, [{label:"Guia", field:"numeroGuia"}, {label:"Unidade", field:"unidade"}, {label:"Status", field:"status"}], document.getElementById("mainDisplay"), "dataRecebimento");
}

async function telaInserirDocs() {
    document.getElementById("pageTitle").innerText = "Inserir Documentos";
    const snap = await getDocs(query(collection(db, "guias"), where("status", "!=", "Arquivada")));
    let html = `<div class="form-container"><label>Guia:</label><select id="selGuia"><option value="">Selecione...</option>`;
    snap.forEach(d => html += `<option value="${d.id}">${d.data().numeroGuia}</option>`);
    html += `</select><input id="doc_n" placeholder="Nome Documento"><input id="doc_s" placeholder="SEI"><button id="btnSaveD" class="btn-primary">Salvar</button></div>`;
    document.getElementById("mainDisplay").innerHTML = html;

    document.getElementById("btnSaveD").onclick = async () => {
        const id = document.getElementById("selGuia").value;
        if(!id) return alert("Selecione uma guia");
        await addDoc(collection(db, "guias", id, "documentos"), {
            nomeDocumento: document.getElementById("doc_n").value,
            numeroProcesso: document.getElementById("doc_s").value,
            dataRecebimento: new Date().toISOString().split('T')[0]
        });
        alert("Salvo!");
    };
}

async function carregarArquivadas() {
    document.getElementById("pageTitle").innerText = "Guias Arquivadas";
    const snap = await getDocs(query(collection(db, "guias"), where("status", "==", "Arquivada")));
    const dados = snap.docs.map(d => d.data());
    exibirTabela(dados, [{label:"Guia", field:"numeroGuia"}, {label:"Unidade", field:"unidade"}, {label:"Caixa", field:"caixa"}], document.getElementById("mainDisplay"), "dataArquivamento");
}

// --- MENU CLICK ---
document.getElementById("menuHistorico").onclick = carregarGuiasAtivas;
document.getElementById("menuNovaGuia").onclick = () => {
    document.getElementById("pageTitle").innerText = "Nova Guia";
    document.getElementById("mainDisplay").innerHTML = `<div class="form-container"><input id="g_num" placeholder="Nº Guia"><input id="g_uni" placeholder="Unidade"><input type="date" id="g_dat"><button id="btnG" class="btn-primary">Criar Guia</button></div>`;
    document.getElementById("btnG").onclick = async () => {
        await addDoc(collection(db, "guias"), { 
            numeroGuia: document.getElementById("g_num").value, 
            unidade: document.getElementById("g_uni").value, 
            dataRecebimento: document.getElementById("g_dat").value, 
            status: "Aberta" 
        });
        alert("Guia Criada!");
        carregarGuiasAtivas();
    };
};
document.getElementById("menuDocs").onclick = telaInserirDocs;
document.getElementById("menuArquivadas").onclick = carregarArquivadas;
