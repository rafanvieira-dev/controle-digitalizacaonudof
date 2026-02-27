import { db } from "./firebase.js";
import { 
  collection, 
  getDocs, 
  addDoc,
  query,
  where,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/12.9.0/firebase-firestore.js";

const listaGuias = document.getElementById("listaGuias");
const areaDocumentos = document.getElementById("areaDocumentos");
const tituloGuia = document.getElementById("tituloGuia");
const form = document.getElementById("formDocumento");
const listaDocumentos = document.getElementById("listaDocumentos");
const contador = document.getElementById("contadorDocs");

let guiaSelecionada = null;

async function carregarGuias() {

    const q = query(
        collection(db, "guias"),
        where("status", "==", "RECEBIDA")
    );

    const snapshot = await getDocs(q);
    listaGuias.innerHTML = "";

    snapshot.forEach(docSnap => {
        const dados = docSnap.data();

        listaGuias.innerHTML += `
            <li>
                <strong>${dados.numeroGuia}</strong>
                - <a href="#" data-id="${docSnap.id}" data-numero="${dados.numeroGuia}">
                    Inserir Documentos
                </a>
            </li>
        `;
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

    snapshot.forEach(docSnap => {
        const d = docSnap.data();

        listaDocumentos.innerHTML += `
            <li>
                <strong>${d.nomeDocumento}</strong><br>
                Processo SEI: ${d.numeroProcesso}<br>
                Data: ${d.dataRecebimento}<br>
                Guia Remessa: ${d.guiaRemessa}
                <hr>
            </li>
        `;
    });

    contador.innerText = `${snapshot.size} / 7 documentos`;
    form.style.display = snapshot.size >= 7 ? "none" : "block";
}

form.addEventListener("submit", async (e) => {
    e.preventDefault();

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
            nomeDocumento: nomeDocumento.value,
            numeroProcesso: numeroProcesso.value,
            dataRecebimento: dataRecebimento.value,
            guiaRemessa: guiaRemessa.value,
            criadoEm: serverTimestamp()
        }
    );

    form.reset();
    carregarDocumentos();
});

carregarGuias();
