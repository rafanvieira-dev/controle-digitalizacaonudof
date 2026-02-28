import { db } from "./firebase.js";
import { collection, getDocs, addDoc, query } from "https://www.gstatic.com/firebasejs/12.9.0/firebase-firestore.js";

let guiaSelecionada = null;

async function carregarDocumentos() {
    if (!guiaSelecionada) return;
    
    const container = document.getElementById("listaDocumentos");
    const snapshot = await getDocs(collection(db, "guias", guiaSelecionada, "documentos"));
    let docs = [];
    
    snapshot.forEach(doc => docs.push(doc.data()));

    // Ordenação Decrescente por Data de Recebimento do Documento
    docs.sort((a, b) => new Date(b.dataRecebimento) - new Date(a.dataRecebimento));

    const agrupado = docs.reduce((acc, d) => {
        const data = d.dataRecebimento || "Sem Data";
        if (!acc[data]) acc[data] = [];
        acc[data].push(d);
        return acc;
    }, {});

    container.innerHTML = "";
    for (const data in agrupado) {
        let table = `<div class="data-group-header">Recebidos em: ${data}</div>
        <table class="excel-table">
            <thead><tr><th>Nome</th><th>Processo SEI</th><th>Guia Remessa</th></tr></thead>
            <tbody>`;
        agrupado[data].forEach(d => {
            table += `<tr><td>${d.nome}</td><td>${d.numeroProcesso}</td><td>${d.guiaRemessa}</td></tr>`;
        });
        table += `</tbody></table>`;
        container.innerHTML += table;
    }
}
// ... (restante da lógica de salvar segue o padrão de addDoc já existente)
