import { db, auth } from "./firebase.js";
import { 
  collection, 
  getDocs, 
  addDoc 
} from "https://www.gstatic.com/firebasejs/12.9.0/firebase-firestore.js";

import { onAuthStateChanged } 
from "https://www.gstatic.com/firebasejs/12.9.0/firebase-auth.js";

onAuthStateChanged(auth, (user) => {
  if (!user) window.location.href = "index.html";
  else carregarGuias();
});

async function carregarGuias() {

  const lista = document.getElementById("listaGuias");
  lista.innerHTML = "";

  const snapshot = await getDocs(collection(db, "guias"));

  snapshot.forEach(docSnap => {
    const guia = docSnap.data();

    if (guia.status === "Ativa") {

      lista.innerHTML += `
        <div style="margin-bottom:20px;">
          <strong>Guia Nº ${guia.numeroGuia}</strong>
          <button onclick="mostrarFormulario('${docSnap.id}')">Inserir Documento</button>
          <div id="form-${docSnap.id}" style="display:none;"></div>
        </div>
      `;
    }
  });
}

window.mostrarFormulario = function(idGuia) {

  const div = document.getElementById("form-" + idGuia);

  div.style.display = "block";

  div.innerHTML = `
    <input type="text" placeholder="Nome do Documento" id="nome-${idGuia}">
    <input type="text" placeholder="Guia de Remessa" id="remessa-${idGuia}">
    <input type="text" placeholder="Nº Processo SEI" id="sei-${idGuia}">
    <input type="date" id="data-${idGuia}">
    <button onclick="salvarDocumento('${idGuia}')">Salvar Documento</button>
  `;
};

window.salvarDocumento = async function(idGuia) {

  const docsRef = collection(db, "guias", idGuia, "documentos");
  const snapshot = await getDocs(docsRef);

  if (snapshot.size >= 6) {
    alert("Limite máximo de 6 documentos atingido.");
    return;
  }

  await addDoc(docsRef, {
    nomeDocumento: document.getElementById("nome-"+idGuia).value,
    guiaRemessa: document.getElementById("remessa-"+idGuia).value,
    numeroSEI: document.getElementById("sei-"+idGuia).value,
    dataRecebimento: document.getElementById("data-"+idGuia).value,
    criadoEm: new Date()
  });

  alert("Documento inserido com sucesso!");
  carregarGuias();
};

window.voltar = function() {
  window.location.href = "index.html";
};
