import { db, auth } from "./firebase.js";
import { 
  collection, 
  getDocs,
  query,
  where,
  doc,
  getDoc
} from "https://www.gstatic.com/firebasejs/12.9.0/firebase-firestore.js";

import { onAuthStateChanged } 
from "https://www.gstatic.com/firebasejs/12.9.0/firebase-auth.js";

onAuthStateChanged(auth, (user) => {
  if (!user) window.location.href = "index.html";
  else carregarArquivados();
});

async function carregarArquivados() {

  const lista = document.getElementById("listaArquivados");
  lista.innerHTML = "";

  const q = query(
    collection(db, "guias"),
    where("status", "==", "ARQUIVADA")
  );

  const snapshot = await getDocs(q);

  snapshot.forEach(docSnap => {
    const guia = docSnap.data();

    lista.innerHTML += `
      <div>
        <button onclick="mostrarDetalhes('${docSnap.id}')">
          Guia Nº ${guia.numeroGuia}
        </button>
        <div id="detalhe-${docSnap.id}" style="display:none;"></div>
      </div>
    `;
  });
}

window.mostrarDetalhes = async function(idGuia) {

  const detalheDiv = document.getElementById("detalhe-"+idGuia);

  if (detalheDiv.style.display === "block") {
    detalheDiv.style.display = "none";
    return;
  }

  detalheDiv.style.display = "block";

  const guiaDoc = await getDoc(doc(db, "guias", idGuia));
  const guiaData = guiaDoc.data();

  const docsSnapshot = await getDocs(
    collection(db, "guias", idGuia, "documentos")
  );

  let documentosHTML = "";

  docsSnapshot.forEach(docSnap => {
    const d = docSnap.data();

    documentosHTML += `
      <tr>
        <td>${d.nomeDocumento}</td>
        <td>${d.numeroProcesso}</td>
        <td>${d.guiaRemessa}</td>
        <td>${d.dataRecebimento}</td>
      </tr>
    `;
  });

  detalheDiv.innerHTML = `
    <p><strong>Unidade:</strong> ${guiaData.unidade}</p>
    <p><strong>Data Arquivamento:</strong> ${guiaData.arquivamento?.dataArquivamento}</p>
    <table>
      <tr>
        <th>Nome</th>
        <th>Processo</th>
        <th>Remessa</th>
        <th>Data</th>
      </tr>
      ${documentosHTML}
    </table>
  `;
};

window.voltar = function() {
  window.location.href = "index.html";
};
