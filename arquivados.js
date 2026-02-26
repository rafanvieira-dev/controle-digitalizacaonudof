import { db, auth } from "./firebase.js";
import { collection, getDocs } 
from "https://www.gstatic.com/firebasejs/12.9.0/firebase-firestore.js";
import { onAuthStateChanged } 
from "https://www.gstatic.com/firebasejs/12.9.0/firebase-auth.js";

let dados = [];

onAuthStateChanged(auth, (user) => {
  if (!user) window.location.href = "index.html";
  else carregar();
});

async function carregar() {

  const lista = document.getElementById("listaArquivados");
  lista.innerHTML = "";

  const snapshot = await getDocs(collection(db, "guias"));

  dados = [];

  snapshot.forEach(docSnap => {
    const guia = docSnap.data();

    if (guia.status === "Arquivada") {
      dados.push(guia);
    }
  });

  mostrar(dados);
}

function mostrar(listaDados) {

  const lista = document.getElementById("listaArquivados");
  lista.innerHTML = "";

  listaDados.forEach(guia => {
    lista.innerHTML += `
      <div style="margin-bottom:20px;">
        <strong>Guia Nº ${guia.numeroGuia}</strong>
        <p>Data Arquivamento: ${guia.arquivamento?.dataArquivamento || ""}</p>
      </div>
    `;
  });
}

window.filtrar = function() {

  const termo = document.getElementById("pesquisa").value.toLowerCase();

  const filtrado = dados.filter(g =>
    JSON.stringify(g).toLowerCase().includes(termo)
  );

  mostrar(filtrado);
};

window.voltar = function() {
  window.location.href = "index.html";
};
