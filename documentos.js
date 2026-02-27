import { db } from "./firebase.js";
import { 
    collection, 
    getDocs, 
    addDoc 
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

const listaGuias = document.getElementById("listaGuias");
const areaDocumentos = document.getElementById("areaDocumentos");
const tituloGuia = document.getElementById("tituloGuia");
const form = document.getElementById("formDocumento");
const listaDocumentos = document.getElementById("listaDocumentos");
const contador = document.getElementById("contadorDocs");

let guiaSelecionada = null;
let numeroGuiaSelecionada = "";

// 🔹 CARREGAR GUIAS
async function carregarGuias() {
    const snapshot = await getDocs(collection(db, "guias"));
    listaGuias.innerHTML = "";

    snapshot.forEach(doc => {
        const dados = doc.data();

        const li = document.createElement("li");
        li.innerHTML = `
            <strong>${dados.numero}</strong>
            - <a href="#" data-id="${doc.id}" data-numero="${dados.numero}">
                Inserir Documentos
              </a>
        `;

        listaGuias.appendChild(li);
    });
}

// 🔹 SELECIONAR GUIA
listaGuias.addEventListener("click", async (e) => {
    if (e.target.tagName === "A") {
        e.preventDefault();

        guiaSelecionada = e.target.dataset.id;
        numeroGuiaSelecionada = e.target.dataset.numero;

        tituloGuia.innerText = "Guia: " + numeroGuiaSelecionada;

        areaDocumentos.style.display = "block";

        carregarDocumentos();
    }
});

// 🔹 CARREGAR DOCUMENTOS
async function carregarDocumentos() {
    const snapshot = await getDocs(
        collection(db, "guias", guiaSelecionada, "documentos")
    );

    listaDocumentos.innerHTML = "";

    snapshot.forEach(doc => {
        const dados = doc.data();

        const li = document.createElement("li");
        li.innerHTML = `
            <strong>${dados.nome}</strong><br>
            Processo SEI: ${dados.numeroProcesso}<br>
            Data de Recebimento: ${dados.dataRecebimento}<br>
            Guia de Remessa: ${dados.guiaRemessa}<br>
            Status: ${dados.status}
            <hr>
        `;

        listaDocumentos.appendChild(li);
    });

    contador.innerText = `${snapshot.size} / 7 documentos`;

    if (snapshot.size >= 7) {
        form.style.display = "none";
    } else {
        form.style.display = "block";
    }
}

// 🔹 ADICIONAR DOCUMENTO
form.addEventListener("submit", async (e) => {
    e.preventDefault();

    if (!guiaSelecionada) {
        alert("Selecione uma guia primeiro.");
        return;
    }

    const nome = document.getElementById("nomeDocumento").value;
    const numeroProcesso = document.getElementById("numeroProcesso").value;
    const dataRecebimento = document.getElementById("dataRecebimento").value;
    const guiaRemessa = document.getElementById("guiaRemessa").value;

    const snapshot = await getDocs(
        collection(db, "guias", guiaSelecionada, "documentos")
    );

    if (snapshot.size >= 7) {
        alert("Limite máximo de 7 documentos atingido.");
        return;
    }

    await addDoc(
        collection(db, "guias", guiaSelecionada, "documentos"),
        {
            nome: nome,
            numeroProcesso: numeroProcesso,
            dataRecebimento: dataRecebimento,
            guiaRemessa: guiaRemessa,
            status: "recebido", // 🔹 Vai direto para recebidos
            criadoEm: new Date()
        }
    );

    form.reset();
    carregarDocumentos();
});

// 🔹 INICIAR
carregarGuias();
