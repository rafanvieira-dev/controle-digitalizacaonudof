import { auth, db } from "./firebase.js";
import { onAuthStateChanged, signOut, signInWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/12.9.0/firebase-auth.js";
import { collection, getDocs, query, where, doc, updateDoc, addDoc } from "https://www.gstatic.com/firebasejs/12.9.0/firebase-firestore.js";

// --- CONTROLE DE LOGIN ---
onAuthStateChanged(auth, (user) => {
    if (user) {
        document.getElementById("loginSection").classList.add("hidden");
        document.getElementById("appInterface").classList.remove("hidden");
        carregarGuiasAtivas(); 
    } else {
        document.getElementById("loginSection").classList.remove("hidden");
        document.getElementById("appInterface").classList.add("hidden");
    }
});

// Botões básicos
document.getElementById("btnLogout").onclick = () => signOut(auth);

// --- FUNÇÃO AUXILIAR PARA LIMPAR E MONTAR A TELA ---
function prepararTela(titulo) {
    document.getElementById("pageTitle").innerText = titulo;
    const display = document.getElementById("mainDisplay");
    display.innerHTML = '<p>Carregando...</p>';
    return display;
}

// --- 1. HISTÓRICO DE GUIAS ATIVAS (PÁGINA INICIAL) ---
async function carregarGuiasAtivas() {
    const display = prepararTela("Histórico de Guias Ativas");
    const q = query(collection(db, "guias"), where("status", "!=", "Arquivada"));
    const snap = await getDocs(q);
    
    let dados = [];
    snap.forEach(doc => dados.push({ id: doc.id, ...doc.data() }));

    if (dados.length === 0) {
        display.innerHTML = "<p>Nenhuma guia ativa encontrada.</p>";
        return;
    }

    renderizarTabelaExcel(dados, [
        {label: "Nº Guia", field: "numero"},
        {label: "Unidade", field: "unidade"},
        {label: "Status", field: "status"}
    ], display);
}

// --- 2. INSERIR DOCUMENTOS EM GUIA ---
async function telaInserirDocumentos() {
    const display = prepararTela("Inserir Documentos em Guia");
    const snap = await getDocs(query(collection(db, "guias"), where("status", "!=", "Arquivada")));
    
    let html = `
        <div class="form-container">
            <label>Selecione a Guia:</label>
            <select id="selectGuia" style="margin-bottom:10px;">
                <option value="">Escolha uma guia...</option>
                ${snap.docs.map(d => `<option value="${d.id}">${d.data().numero} - ${d.data().unidade}</option>`).join('')}
            </select>
            <input type="text" id="doc_nome" placeholder="Nome do Documento">
            <input type="text" id="doc_sei" placeholder="Processo SEI">
            <button class="btn-primary" id="btnSalvarDoc">Adicionar Documento</button>
        </div>
        <div id="listaDocsExcel"></div>
    `;
    display.innerHTML = html;

    document.getElementById("btnSalvarDoc").onclick = async () => {
        const guiaId = document.getElementById("selectGuia").value;
        const nome = document.getElementById("doc_nome").value;
        const sei = document.getElementById("doc_sei").value;

        if(!guiaId || !nome) return alert("Preencha os dados!");

        await addDoc(collection(db, "guias", guiaId, "documentos"), {
            nomeDocumento: nome,
            numeroProcesso: sei,
            dataRecebimento: new Date().toISOString().split('T')[0]
        });
        alert("Documento inserido!");
        telaInserirDocumentos();
    };
}

// --- 3. ARQUIVAR GUIA ---
async function telaArquivar() {
    const display = prepararTela("Arquivar Guia");
    const snap = await getDocs(query(collection(db, "guias"), where("status", "!=", "Arquivada")));
    
    let html = `<table class="sei-table"><thead><tr><th>Guia</th><th>Ação</th></tr></thead><tbody>`;
    snap.forEach(d => {
        html += `<tr>
            <td>${d.data().numero} - ${d.data().unidade}</td>
            <td><button onclick="executarArquivamento('${d.id}')">Arquivar</button></td>
        </tr>`;
    });
    display.innerHTML = html + `</tbody></table>`;
}

window.executarArquivamento = async (id) => {
    const caixa = prompt("Número da Caixa:");
    if(!caixa) return;
    await updateDoc(doc(db, "guias", id), {
        status: "Arquivada",
        dataArquivamento: new Date().toISOString().split('T')[0],
        caixa: caixa
    });
    alert("Guia arquivada com sucesso!");
    telaArquivar();
};

// --- 4. GUIAS ARQUIVADAS ---
async function carregarArquivadas() {
    const display = prepararTela("Guias Arquivadas");
    const q = query(collection(db, "guias"), where("status", "==", "Arquivada"));
    const snap = await getDocs(q);
    
    let dados = [];
    snap.forEach(doc => dados.push(doc.data()));

    renderizarTabelaExcel(dados, [
        {label: "Guia", field: "numero"},
        {label: "Unidade", field: "unidade"},
        {label: "Caixa", field: "caixa"},
        {label: "Data Arq.", field: "dataArquivamento"}
    ], display);
}

//
