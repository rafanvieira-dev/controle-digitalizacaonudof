import { auth, db } from "./firebase.js";
import { signInWithEmailAndPassword, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/12.9.0/firebase-auth.js";
import { collection, getDocs, query, where, doc, updateDoc, addDoc } from "https://www.gstatic.com/firebasejs/12.9.0/firebase-firestore.js";

// Função para alternar telas com segurança
function toggleInterface(isLogged) {
    const loginSec = document.getElementById("loginSection");
    const appInt = document.getElementById("appInterface");
    
    if (isLogged) {
        if(loginSec) loginSec.style.display = "none";
        if(appInt) appInt.style.display = "flex";
    } else {
        if(loginSec) loginSec.style.display = "flex";
        if(appInt) appInt.style.display = "none";
    }
}

// Observador de Login
onAuthStateChanged(auth, (user) => {
    if (user) {
        toggleInterface(true);
        carregarGuiasAtivas();
    } else {
        toggleInterface(false);
    }
});

// Evento de Login
const btnLogin = document.getElementById("btnLogin");
if (btnLogin) {
    btnLogin.onclick = async () => {
        const email = document.getElementById("email").value;
        const senha = document.getElementById("senha").value;
        try {
            await signInWithEmailAndPassword(auth, email, senha);
        } catch (error) {
            alert("Erro: " + error.message);
        }
    };
}

// Evento de Logout
const btnLogout = document.getElementById("btnLogout");
if (btnLogout) btnLogout.onclick = () => signOut(auth);

// --- FUNÇÃO PARA RENDERIZAR TABELA EXCEL ---
function renderizarTabela(dados, colunas, campoData) {
    const mainDisplay = document.getElementById("mainDisplay");
    mainDisplay.innerHTML = "";

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

// --- LOGICA DAS ABAS ---
async function carregarGuiasAtivas() {
    document.getElementById("pageTitle").innerText = "Histórico de Guias Ativas";
    const snap = await getDocs(query(collection(db, "guias"), where("status", "!=", "Arquivada")));
    const dados = snap.docs.map(d => d.data());
    renderizarTabela(dados, [
        {label: "Nº Guia", field: "numeroGuia"},
        {label: "Unidade", field: "unidade"},
        {label: "Status", field: "status"}
    ], "dataRecebimento");
}

// Mapeamento dos Menus
const menuIds = {
    "menuHistorico": carregarGuiasAtivas,
    "menuNovaGuia": () => { 
        document.getElementById("pageTitle").innerText = "Nova Guia";
        document.getElementById("mainDisplay").innerHTML = `<div class="form-container"><input id="g_num" placeholder="Nº Guia"><button id="btnG" class="btn-primary">Salvar</button></div>`;
    },
    "menuArquivadas": async () => {
        document.getElementById("pageTitle").innerText = "Guias Arquivadas";
        const snap = await getDocs(query(collection(db, "guias"), where("status", "==", "Arquivada")));
        renderizarTabela(snap.docs.map(d => d.data()), [
            {label: "Guia", field: "numeroGuia"},
            {label: "Caixa", field: "caixa"}
        ], "dataArquivamento");
    }
};

Object.keys(menuIds).forEach(id => {
    const el = document.getElementById(id);
    if(el) el.onclick = menuIds[id];
});
