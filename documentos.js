import { db, auth } from "./firebase.js";
import {
  collection,
  getDocs,
  addDoc,
  deleteDoc,
  doc,
  getDoc
} from "https://www.gstatic.com/firebasejs/12.9.0/firebase-firestore.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/12.9.0/firebase-auth.js";

let guiaSelecionada = null;
let isAdmin = false;

const listaGuias = document.getElementById("listaGuias");
const areaDocumentos = document.getElementById("areaDocumentos");
const tituloGuia = document.getElementById("tituloGuia");
const form = document.getElementById("formDocumento");
const listaDocumentos = document.getElementById("listaDocumentos");
const contador = document.getElementById("contadorDocs");

onAuthStateChanged(auth, async (user) => {
  if (!user) {
    window.location.href = "index.html";
    return;
  }

  const userDoc = await getDoc(doc(db, "usuarios", user.uid));

  if (userDoc.exists() && userDoc.data().role === "admin") {
    isAdmin = true;
  }

  carregarGuias();
});

async function carregarGuias() {
  const snapshot = await getDocs(collection(db, "guias"));
  listaGuias.innerHTML = "";

  snapshot.forEach(docSnap => {
    const dados = docSnap.data();

    const li = document.createElement("li");
    li.innerHTML = `
      <strong>${dados.numero}</strong>
      <button onclick="selecionarGuia('${docSnap.id}','${dados.numero}')">Inserir</button>
      ${isAdmin ? `<button class="btn-danger" onclick="excluirGuia('${docSnap.id}')">Excluir</button>` : ""}
      <hr>
    `;

    listaGuias.appendChild(li);
  });
}

window.selecionarGuia = function(id, numero) {
  guiaSelecionada = id;
  tituloGuia.innerText = "Guia: " + numero;
  areaDocumentos.style.display = "block";
  carregarDocumentos();
};

async function carregarDocumentos() {
  const snapshot = await getDocs(collection(db, "guias", guiaSelecionada, "documentos"));
  listaDocumentos.innerHTML = "";

  snapshot.forEach(docSnap => {
    const dados = docSnap.data();

    listaDocumentos.innerHTML += `
      <li>
        <strong>${dados.nome}</strong><br>
        Processo: ${dados.numeroProcesso}<br>
        Data: ${dados.dataRecebimento}<br>
        Guia Remessa: ${dados.guiaRemessa}
        <hr>
      </li>
    `;
  });

  contador.innerText = `${snapshot.size} / 7 documentos`;
}

form.addEventListener("submit", async (e) => {
  e.preventDefault();

  const nome = document.getElementById("nomeDocumento").value;
  const numeroProcesso = document.getElementById("numeroProcesso").value;
  const dataRecebimento = document.getElementById("dataRecebimento").value;
  const guiaRemessa = document.getElementById("guiaRemessa").value;

  await addDoc(collection(db, "guias", guiaSelecionada, "documentos"), {
    nome,
    numeroProcesso,
    dataRecebimento,
    guiaRemessa,
    criadoEm: new Date()
  });

  form.reset();
  carregarDocumentos();
});

window.excluirGuia = async function(idGuia) {

  if (!confirm("Deseja excluir essa guia?")) return;

  const docsSnapshot = await getDocs(collection(db, "guias", idGuia, "documentos"));

  for (const d of docsSnapshot.docs) {
    await deleteDoc(doc(db, "guias", idGuia, "documentos", d.id));
  }

  await deleteDoc(doc(db, "guias", idGuia));

  alert("Guia excluída!");
  carregarGuias();
};
