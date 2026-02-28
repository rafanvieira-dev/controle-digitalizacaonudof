import { db, auth } from "./firebase.js";
import {
  collection,
  getDocs,
  doc,
  getDoc
} from "https://www.gstatic.com/firebasejs/12.9.0/firebase-firestore.js";

import { onAuthStateChanged } from
"https://www.gstatic.com/firebasejs/12.9.0/firebase-auth.js";

onAuthStateChanged(auth, (user) => {
  if (!user) window.location.href = "index.html";
  else carregarArquivados();
});

async function carregarArquivados() {

  const lista = document.getElementById("listaArquivados");
  lista.innerHTML = "";

  const snapshot = await getDocs(collection(db, "guias"));

  snapshot.forEach(docSnap => {
    const guia = docSnap.data();

    if (guia.status === "Arquivada") {
      lista.innerHTML += `
        <div class="pasta">
          <strong>Guia Nº ${guia.numero}</strong>
          <button onclick="mostrarDetalhes('${docSnap.id}')">Ver Detalhes</button>
          <div id="detalhe-${docSnap.id}"></div>
        </div>
      `;
    }
  });
}

window.mostrarDetalhes = async function(idGuia) {

  const detalheDiv = document.getElementById("detalhe-"+idGuia);

  const guiaSnap = await getDoc(doc(db, "guias", idGuia));
  const guiaData = guiaSnap.data();

  const docsSnapshot = await getDocs(
    collection(db, "guias", idGuia, "documentos")
  );

  let documentosHTML = "";

  docsSnapshot.forEach(doc => {
    const d = doc.data();
    documentosHTML += `
      <tr>
        <td>${d.nome}</td>
        <td>${d.numeroProcesso}</td>
        <td>${d.guiaRemessa}</td>
        <td>${d.dataRecebimento}</td>
      </tr>
    `;
  });

  detalheDiv.innerHTML = `
    <div class="detalhes-box">
      <p><strong>Unidade:</strong> ${guiaData.unidade}</p>
      <p><strong>Data Recebimento:</strong> ${guiaData.dataRecebimento}</p>
      <p><strong>Data Arquivamento:</strong> ${guiaData.arquivamento?.dataArquivamento}</p>

      <table>
        <tr>
          <th>Nome</th>
          <th>Processo</th>
          <th>Guia Remessa</th>
          <th>Data</th>
        </tr>
        ${documentosHTML}
      </table>
    </div>
  `;
};

window.voltar = function() {
  window.location.href = "index.html";
};
