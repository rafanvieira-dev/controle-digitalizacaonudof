import { auth, db } from "./firebase.js";
import { onAuthStateChanged, signOut, signInWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/12.9.0/firebase-auth.js";
import { collection, getDocs, query, orderBy, where } from "https://www.gstatic.com/firebasejs/12.9.0/firebase-firestore.js";

// Controle de Login
onAuthStateChanged(auth, (user) => {
    if (user) {
        document.getElementById("loginSection").classList.add("hidden");
        document.getElementById("appInterface").classList.remove("hidden");
        carregarGuiasAtivas(); // Página inicial
    } else {
        document.getElementById("loginSection").classList.remove("hidden");
        document.getElementById("appInterface").classList.add("hidden");
    }
});

// Botão de Login
document.getElementById("btnLogin").onclick = () => {
    const email = document.getElementById("email").value;
    const senha = document.getElementById("senha").value;
    signInWithEmailAndPassword(auth, email, senha).catch(err => alert("Erro: " + err.message));
};

// Botão de Sair
document.getElementById("btnLogout").onclick = () => signOut(auth);

// --- FUNÇÃO PARA GERAR TABELA ESTILO EXCEL ---
function renderizarTabelaExcel(dados, colunas, elementoId) {
    const display = document.getElementById(elementoId);
    display.innerHTML = "";

    // Agrupar por data (usando o campo dataRecebimento)
    const grupos = dados.reduce((acc, item) => {
        const data = item.dataRecebimento || "Sem Data";
        if (!acc[data]) acc[data] = [];
        acc[data].push(item);
        return acc;
    }, {});

    // Ordenar datas (mais recente primeiro)
    const datasOrdenadas = Object.keys(grupos).sort((a, b) => new Date(b) - new Date(a));

    datasOrdenadas.forEach(data => {
        display.innerHTML += `<div class="data-header">Data: ${data}</div>`;
        let tabela = `<table class="sei-table"><thead><tr>`;
        colunas.forEach(col => tabela += `<th>${col.label}</th>`);
        tabela += `</tr></thead><tbody>`;

        grupos[data].forEach(row => {
            tabela += `<tr>`;
            colunas.forEach(col => tabela += `<td>${row[col.field] || ""}</td>`);
            tabela += `</tr>`;
        });

        tabela += `</tbody></table>`;
        display.innerHTML += tabela;
    });
}

// --- FUNÇÕES DE CARREGAMENTO ---
async function carregarGuiasAtivas() {
    document.getElementById("pageTitle").innerText = "Histórico de Guias Ativas";
    const q = query(collection(db, "guias"), where("status", "!=", "Arquivada"));
    const snap = await getDocs(q);
    const dados = snap.docs.map(doc => doc.data());

    renderizarTabelaExcel(dados, [
        {label: "Nº Guia", field: "numero"},
        {label: "Unidade", field: "unidade"},
        {label: "Status", field: "status"}
    ], "mainDisplay");
}

// Eventos do Menu
document.getElementById("menuHistorico").onclick = carregarGuiasAtivas;
document.getElementById("menuNovaGuia").onclick = () => {
    document.getElementById("pageTitle").innerText = "Inserir Nova Guia";
    document.getElementById("mainDisplay").innerHTML = `
        <div style="max-width: 400px; background: #f4f4f4; padding: 20px; border: 1px solid #ccc;">
            <label>Nº Guia:</label><input type="text" id="new_num">
            <label>Unidade:</label><input type="text" id="new_uni">
            <label>Data:</label><input type="date" id="new_date">
            <button style="margin-top:10px; background: #003366; color:white; padding:10px; border:none;">Salvar</button>
        </div>
    `;
};
