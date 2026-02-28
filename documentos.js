import { db } from "./firebase.js";
import {
  collection,
  getDocs,
  addDoc
} from "https://www.gstatic.com/firebasejs/12.9.0/firebase-firestore.js";

const listaGuias = document.getElementById("listaGuias");
const areaDocumentos = document.getElementById("areaDocumentos");
const tituloGuia = document.getElementById("tituloGuia");
const form = document.getElementById("formDocumento");
const listaDocumentos = document.getElementById("listaDocumentos");
const contador = document.getElementById("contadorDocs");

let guiaSelecionada = null;

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

listaGuias.addEventListener("click", async (e) => {
    if (e.target.tagName === "A") {
        e.preventDefault();
        guiaSelecionada = e.target.dataset.id;
        tituloGuia.innerText = "Guia: " + e.target.dataset.numero;
        areaDocumentos.style.display = "block";
        carregarDocumentos();
    }
});

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
            Data: ${dados.dataRecebimento}<br>
            Guia Remessa: ${dados.guiaRemessa}
            <hr>
        `;
        listaDocumentos.appendChild(li);
    });

    contador.innerText = `${snapshot.size} / 7 documentos`;
    form.style.display = snapshot.size >= 7 ? "none" : "block";
}

form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const nome = document.getElementById("nomeDocumento").value;
    const numeroProcesso = document.getElementById("numeroProcesso").value;
    const dataRecebimento = document.getElementById("dataRecebimento").value;
    const guiaRemessa = document.getElementById("guiaRemessa").value;

    const snapshot = await getDocs(
        collection(db, "guias", guiaSelecionada, "documentos")
    );

    if (snapshot.size >= 7) {
        alert("Limite máximo atingido.");
        return;
    }

    await addDoc(
        collection(db, "guias", guiaSelecionada, "documentos"),
        {
            nome,
            numeroProcesso,
            dataRecebimento,
            guiaRemessa,
            status: "Recebido",
            criadoEm: new Date()
        }
    );

    form.reset();
    carregarDocumentos();
});

carregarGuias();
