import { db, auth } from "./firebase.js";
import { collection, getDocs, addDoc, query, where } from "https://www.gstatic.com/firebasejs/12.9.0/firebase-firestore.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/12.9.0/firebase-auth.js";

const listaGuias = document.getElementById("listaGuias");
const areaDocumentos = document.getElementById("areaDocumentos");

// Verificar se está logado ao entrar
onAuthStateChanged(auth, (user) => { if (!user) window.location.href = "index.html"; });

// Carregar guias para o utilizador escolher
async function carregarMenuGuias() {
    const q = query(collection(db, "guias"), where("status", "!=", "Arquivada"));
    const snap = await getDocs(q);
    listaGuias.innerHTML = "";
    snap.forEach(doc => {
        const btn = document.createElement("button");
        btn.innerText = doc.data().numero || doc.data().numeroGuia;
        btn.className = "btn-primary";
        btn.style.margin = "5px";
        btn.onclick = () => iniciarInclusao(doc.id, btn.innerText);
        listaGuias.appendChild(btn);
    });
}

let guiaAtivaId = "";
async function iniciarInclusao(id, numero) {
    guiaAtivaId = id;
    areaDocumentos.style.display = "block";
    document.getElementById("tituloGuia").innerText = "A adicionar à Guia: " + numero;
    contarDocs(id);
}

async function contarDocs(id) {
    const snap = await getDocs(collection(db, "guias", id, "documentos"));
    document.getElementById("contadorDocs").innerText = `${snap.size} / 7 documentos`;
    return snap.size;
}

document.getElementById("formDocumento").onsubmit = async (e) => {
    e.preventDefault();
    const total = await contarDocs(guiaAtivaId);

    if (total >= 7) {
        alert("Limite de 7 documentos atingido para esta guia!");
        return;
    }

    const docDados = {
        nomeDocumento: document.getElementById("nomeDocumento").value,
        numeroProcesso: document.getElementById("numeroProcesso").value,
        dataRecebimento: document.getElementById("dataRecebimento").value,
        guiaRemessa: document.getElementById("guiaRemessa").value
    };

    await addDoc(collection(db, "guias", guiaAtivaId, "documentos"), docDados);
    alert("Documento salvo!");
    document.getElementById("formDocumento").reset();
    contarDocs(guiaAtivaId);
};

carregarMenuGuias();
