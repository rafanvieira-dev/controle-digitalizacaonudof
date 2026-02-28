import { db, auth } from "./firebase.js";
import {
  collection,
  getDocs,
  addDoc,
  deleteDoc,
  doc,
  getDoc,
  query,
  orderBy
} from "https://www.gstatic.com/firebasejs/12.9.0/firebase-firestore.js";

import { onAuthStateChanged } from
"https://www.gstatic.com/firebasejs/12.9.0/firebase-auth.js";

const listaGuias = document.getElementById("listaGuias");
const areaDocumentos = document.getElementById("areaDocumentos");
const tituloGuia = document.getElementById("tituloGuia");
const form = document.getElementById("formDocumento");
const listaDocumentos = document.getElementById("listaDocumentos");
const contador = document.getElementById("contadorDocs");

let guiaSelecionada = null;
let isAdmin = false;

onAuthStateChanged(auth, async (user) => {

  if (!user) {
    window.location.href = "index.html";
  } else {

    const userDoc = await getDoc(doc(db, "usuarios", user.uid));

    if (userDoc.exists() && userDoc.data().role === "admin") {
      isAdmin = true;
    }

    carregarGuias();
  }
});

// ======================
// CARREGAR GUIAS ORGANIZADAS
// ======================
async function carregarGuias() {

  const q = query(collection(db, "guias"), orderBy("dataRecebimento", "desc"));
  const snapshot = await getDocs(q);

  listaGuias.innerHTML = "";

  let guiasPorData = {};

  snapshot.forEach(docSnap => {

    const dados = docSnap.data();
    const data = dados.dataRecebimento || "Sem Data";

    if (!guiasPorData[data]) {
      guiasPorData[data] = [];
    }

    guiasPorData[data].push({
      id: docSnap.id,
      ...dados
    });
  });

  Object.keys(guiasPorData).forEach(data => {

    const blocoData = document.createElement("div");
    blocoData.classList.add("bloco-data");
    blocoData.innerHTML = `<h3 class="titulo-data">Data: ${data}</h3>`;

    const grid = document.createElement("div");
    grid.classList.add("grid-guias");

    guiasPorData[data].forEach(guia => {

      const card = document.createElement("div");
      card.classList.add("card-guia");

      card.innerHTML = `
        <h4>Guia Nº ${guia.numero}</h4>
        <p><strong>Unidade:</strong> ${guia.unidade}</p>
        <p><strong>Status:</strong> ${guia.status}</p>

        <button onclick="selecionarGuia('${guia.id}', '${guia.numero}')">
          Documentos
        </button>

        ${isAdmin ? `
        <button class="btn-danger" onclick="excluirGuia('${guia.id}')">
          Excluir
        </button>
        ` : ""}
      `;

      grid.appendChild(card);
    });

    blocoData.appendChild(grid);
    listaGuias.appendChild(blocoData);
  });
}

// ======================
window.selecionarGuia = function(id, numero) {
  guiaSelecionada = id;
  tituloGuia.innerText = "Guia: " + numero;
  areaDocumentos.style.display = "block";
  carregarDocumentos();
};

async function carregarDocumentos() {

  const snapshot = await getDocs(
    collection(db, "guias", guiaSelecionada, "documentos")
  );

  listaDocumentos.innerHTML = "";

  snapshot.forEach(docSnap => {
    const dados = docSnap.data();

    listaDocumentos.innerHTML += `
      <li>
        <strong>${dados.nome}</strong><br>
        Processo: ${dados.numeroProcesso}<br>
        Data: ${dados.dataRecebimento}
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

// ======================
// EXCLUIR GUIA
// ======================
window.excluirGuia = async function(idGuia) {

  const confirmar = confirm("Excluir guia e documentos?");
  if (!confirmar) return;

  const docsSnapshot = await getDocs(
    collection(db, "guias", idGuia, "documentos")
  );

  for (const docSnap of docsSnapshot.docs) {
    await deleteDoc(doc(db, "guias", idGuia, "documentos", docSnap.id));
  }

  await deleteDoc(doc(db, "guias", idGuia));

  alert("Guia excluída!");
  areaDocumentos.style.display = "none";
  carregarGuias();
};
