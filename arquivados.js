import { db, auth } from "./firebase.js";
import { collection, getDocs } 
from "https://www.gstatic.com/firebasejs/12.9.0/firebase-firestore.js";
import { onAuthStateChanged } 
from "https://www.gstatic.com/firebasejs/12.9.0/firebase-auth.js";

onAuthStateChanged(auth, (user) => {
  if (!user) window.location.href = "index.html";
  else carregarArquivados();
});

async function carregarArquivados() {

  const lista = document.getElementById("listaArquivados");
  lista.innerHTML = "";

  const snapshot = await getDocs(collection(db, "guias"));

  let pastas = {};

  snapshot.forEach(docSnap => {
    const guia = docSnap.data();

    if (guia.status === "Arquivada") {

      const data = guia.arquivamento?.dataArquivamento || "Sem Data";

      if (!pastas[data]) {
        pastas[data] = [];
      }

      pastas[data].push({
        id: docSnap.id,
        ...guia
      });
    }
  });

  montarPastas(pastas);
}

function montarPastas(pastas) {

  const lista = document.getElementById("listaArquivados");

  Object.keys(pastas).sort().forEach(data => {

    lista.innerHTML += `
      <div class="pasta">
        <h3>📂 ${data}</h3>
        <div id="pasta-${data.replaceAll('/','-')}"></div>
      </div>
    `;

    const divPasta = document.getElementById("pasta-"+data.replaceAll('/','-'));

    pastas[data].forEach(guia => {

      divPasta.innerHTML += `
        <div class="guia-arquivada">
          <button onclick="mostrarDetalhes('${guia.id}')">
            📄 Guia Nº ${guia.numeroGuia}
          </button>
          <div id="detalhe-${guia.id}" style="display:none;"></div>
        </div>
      `;
    });
  });
}

window.mostrarDetalhes = async function(idGuia) {

  const detalheDiv = document.getElementById("detalhe-"+idGuia);

  if (detalheDiv.style.display === "block") {
    detalheDiv.style.display = "none";
    return;
  }

  detalheDiv.style.display = "block";
  detalheDiv.innerHTML = "Carregando...";

  const docsSnapshot = await getDocs(
    collection(db, "guias", idGuia, "documentos")
  );

  let documentosHTML = "";

  docsSnapshot.forEach(doc => {
    const d = doc.data();
    documentosHTML += `
      <tr>
        <td>${d.nomeDocumento}</td>
        <td>${d.guiaRemessa}</td>
        <td>${d.numeroSEI}</td>
        <td>${d.dataRecebimento}</td>
      </tr>
    `;
  });

  const guiaSnapshot = await getDocs(collection(db, "guias"));
  let guiaData;

  guiaSnapshot.forEach(doc => {
    if (doc.id === idGuia) {
      guiaData = doc.data();
    }
  });

  detalheDiv.innerHTML = `
    <div class="detalhes-box">
      <h4>Dados da Guia</h4>
      <p><strong>Nº Guia:</strong> ${guiaData.numeroGuia}</p>
      <p><strong>Unidade:</strong> ${guiaData.unidade}</p>
      <p><strong>Data Recebimento:</strong> ${guiaData.dataRecebimento}</p>

      <h4>Arquivamento</h4>
      <p><strong>Data Arquivamento:</strong> ${guiaData.arquivamento?.dataArquivamento}</p>
      <p><strong>Caixa:</strong> ${guiaData.arquivamento?.caixaGuia}</p>
      <p><strong>Observação:</strong> ${guiaData.arquivamento?.observacao}</p>

      <h4>Documentos</h4>
      <table>
        <tr>
          <th>Nome</th>
          <th>Guia Remessa</th>
          <th>SEI</th>
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
