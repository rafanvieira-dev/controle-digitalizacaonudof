import { auth, db } from "./firebase.js";
import { signInWithEmailAndPassword, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/12.9.0/firebase-auth.js";
import { collection, getDocs, query, where, doc, updateDoc, addDoc } from "https://www.gstatic.com/firebasejs/12.9.0/firebase-firestore.js";

const loginSection = document.getElementById("loginSection");
const appInterface = document.getElementById("appInterface");
const mainDisplay = document.getElementById("mainDisplay");
const pageTitle = document.getElementById("pageTitle");

// --- 1. MONITOR DE AUTENTICAÇÃO ---
onAuthStateChanged(auth, (user) => {
    if (user) {
        loginSection.classList.add("hidden");
        appInterface.style.display = "flex";
        carregarGuiasAtivas(); // Página inicial
    } else {
        loginSection.classList.remove("hidden");
        appInterface.style.display = "none";
    }
});

// --- 2. FUNÇÃO DE LOGIN ---
document.getElementById("btnLogin").onclick = async () => {
    const email = document.getElementById("email").value.trim();
    const senha = document.getElementById("senha").value.trim();
    if (!email || !senha) return alert("Preencha os campos!");

    try {
        await signInWithEmailAndPassword(auth, email, senha);
    } catch (error) {
        alert("Erro no login: " + error.message);
    }
};

document.getElementById("btnLogout").onclick = () => signOut(auth);

// --- 3. FUNÇÕES DE RENDERIZAÇÃO (TABELA EXCEL) ---
function renderizarTabela(dados, colunas, campoData) {
    mainDisplay.innerHTML = "";
    if (dados.length === 0) {
        mainDisplay.innerHTML = "<p>Nenhum registo encontrado.</p>";
        return;
    }

    const grupos = dados.reduce((acc, item) => {
        const data = item[campoData] || "Sem Data";
        if (!acc[data]) acc[data] = [];
        acc[data].push(item);
        return acc;
    }, {});

    const datasOrdenadas = Object.keys(grupos).sort((a, b) => new Date(b) - new Date(a));

    datasOrdenadas.forEach(data => {
        mainDisplay.innerHTML += `<div class="data-header">Data: ${data}</div>`;
        let tabela = `<table class="sei-table"><thead><tr>`;
        colunas.forEach(col => tabela += `<th>${col.label}</th>`);
        tabela += `</tr></thead><tbody>`;
        grupos[data].forEach(row => {
            tabela += `<tr>${colunas.map(c => `<td>${row[c.field] || ""}</td>`).join('')}</tr>`;
        });
        mainDisplay.innerHTML += tabela + `</tbody></table>`;
    });
}

// --- 4. ABAS DO SISTEMA ---

// ABA: Histórico de Guias Ativas
async function carregarGuiasAtivas() {
    pageTitle.innerText = "Histórico de Guias Ativas";
    mainDisplay.innerHTML = "Carregando...";
    const q = query(collection(db, "guias"), where("status", "!=", "Arquivada"));
    const snap = await getDocs(q);
    const dados = snap.docs.map(d => ({ id: d.id, ...d.data() }));
    renderizarTabela(dados, [
        {label: "Guia", field: "numeroGuia"},
        {label: "Unidade", field: "unidade"},
        {label: "Status", field: "status"}
    ], "dataRecebimento");
}

// ABA: Nova Guia
function telaNovaGuia() {
    pageTitle.innerText = "Inserir Nova Guia";
    mainDisplay.innerHTML = `
        <div class="form-container">
            <input type="text" id="g_num" placeholder="Número da Guia">
            <input type="text" id="g_uni" placeholder="Unidade Solicitante">
            <input type="date" id="g_dat">
            <button id="btnSalvarG" class="btn-primary">Criar Guia</button>
        </div>`;
    document.getElementById("btnSalvarG").onclick = async () => {
        const numeroGuia = document.getElementById("g_num").value;
        const unidade = document.getElementById("g_uni").value;
        const dataRecebimento = document.getElementById("g_dat").value;
        if(!numeroGuia) return alert("Mínimo: Número da Guia");
        await addDoc(collection(db, "guias"), { numeroGuia, unidade, dataRecebimento, status: "Aberta" });
        alert("Guia Criada!");
        carregarGuiasAtivas();
    };
}

// ABA: Inserir Documentos
async function telaDocumentos() {
    pageTitle.innerText = "Inserir Documentos em Guia";
    const snap = await getDocs(query(collection(db, "guias"), where("status", "!=", "Arquivada")));
    
    let html = `<div class="form-container">
        <label>Selecione a Guia:</label>
        <select id="selGuia"><option value="">Escolha...</option>
        ${snap.docs.map(d => `<option value="${d.id}">${d.data().numeroGuia} - ${d.data().unidade}</option>`).join('')}
        </select>
        <input type="text" id="doc_nome" placeholder="Nome do Documento">
        <input type="text" id="doc_sei" placeholder="Processo SEI">
        <button id="btnSaveDoc" class="btn-primary">Adicionar Documento</button>
    </div>`;
    mainDisplay.innerHTML = html;

    document.getElementById("btnSaveDoc").onclick = async () => {
        const id = document.getElementById("selGuia").value;
        if(!id) return alert("Selecione uma guia!");
        await addDoc(collection(db, "guias", id, "documentos"), {
            nomeDocumento: document.getElementById("doc_nome").value,
            numeroProcesso: document.getElementById("doc_sei").value,
            dataRecebimento: new Date().toISOString().split('T')[0]
        });
        alert("Documento Adicionado!");
    };
}

// ABA: Arquivar Guia
async function telaArquivar() {
    pageTitle.innerText = "Arquivamento de Guias";
    const snap = await getDocs(query(collection(db, "guias"), where("status", "!=", "Arquivada")));
    let html = `<table class="sei-table"><thead><tr><th>Guia</th><th>Unidade</th><th>Ação</th></tr></thead><tbody>`;
    snap.forEach(d => {
        html += `<tr><td>${d.data().numeroGuia}</td><td>${d.data().unidade}</td>
        <td><button class="btn-primary" style="padding:5px" onclick="janelaArquivar('${d.id}')">Arquivar</button></td></tr>`;
    });
    mainDisplay.innerHTML = html + "</tbody></table>";
}

window.janelaArquivar = async (id) => {
    const caixa = prompt("Número da Caixa:");
    if(!caixa) return;
    await updateDoc(doc(db, "guias", id), {
        status: "Arquivada",
        dataArquivamento: new Date().toISOString().split('T')[0],
        caixa: caixa
    });
    alert("Guia Arquivada!");
    telaArquivar();
};

// ABA: Guias Arquivadas
async function carregarArquivadas() {
    pageTitle.innerText = "Consulta de Guias Arquivadas";
    const snap = await getDocs(query(collection(db, "guias"), where("status", "==", "Arquivada")));
    const dados = snap.docs.map(d => d.data());
    renderizarTabela(dados, [
        {label: "Guia", field: "numeroGuia"},
        {label: "Unidade", field: "unidade"},
        {label: "Caixa", field: "caixa"},
        {label: "Data Arq.", field: "dataArquivamento"}
    ], "dataArquivamento");
}

// --- 5. MAPEAMENTO DOS CLIQUES DO MENU ---
document.getElementById("menuHistorico").onclick = carregarGuiasAtivas;
document.getElementById("menuNovaGuia").onclick = telaNovaGuia;
document.getElementById("menuDocs").onclick = telaDocumentos;
document.getElementById("menuArquivar").onclick = telaArquivar;
document.getElementById("menuArquivadas").onclick = carregarArquivadas;
