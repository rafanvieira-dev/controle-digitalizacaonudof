// Pega o ID da guia pela URL
const urlParams = new URLSearchParams(window.location.search);
const guiaId = urlParams.get("id");

const form = document.getElementById("formDocumento");
const lista = document.getElementById("listaDocumentos");
const contador = document.getElementById("contadorDocs");
const botao = document.getElementById("btnAdicionar");

// Carrega documentos ao abrir página
window.addEventListener("DOMContentLoaded", () => {
    if (guiaId) {
        carregarDocumentos();
    }
});

// Adicionar documento sem popup
form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const nomeDocumento = document.getElementById("nomeDocumento").value.trim();

    if (!nomeDocumento) return;

    const snapshot = await db.collection("documentos")
        .where("guiaId", "==", guiaId)
        .get();

    if (snapshot.size >= 7) {
        botao.disabled = true;
        return;
    }

    await db.collection("documentos").add({
        nomeDocumento: nomeDocumento,
        guiaId: guiaId,
        criadoEm: new Date()
    });

    document.getElementById("nomeDocumento").value = "";

    carregarDocumentos();
});

// Função para listar documentos
async function carregarDocumentos() {

    const snapshot = await db.collection("documentos")
        .where("guiaId", "==", guiaId)
        .orderBy("criadoEm", "asc")
        .get();

    lista.innerHTML = "";

    snapshot.forEach(doc => {
        const li = document.createElement("li");
        li.textContent = doc.data().nomeDocumento;
        lista.appendChild(li);
    });

    contador.innerText = snapshot.size + " / 7 documentos";

    if (snapshot.size >= 7) {
        botao.disabled = true;
    } else {
        botao.disabled = false;
    }
}
