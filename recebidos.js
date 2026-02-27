import { db, auth } from "./firebase.js";
import { 
  collection, 
  getDocs, 
  updateDoc, 
  doc,
  query,
  where
} from "https://www.gstatic.com/firebasejs/12.9.0/firebase-firestore.js";

import { onAuthStateChanged } 
from "https://www.gstatic.com/firebasejs/12.9.0/firebase-auth.js";

onAuthStateChanged(auth, (user) => {
  if (!user) window.location.href = "index.html";
  else carregar();
});

async function carregar() {

  const lista = document.getElementById("listaRecebidas");
  lista.innerHTML = "";

  const q = query(
    collection(db, "guias"),
    where("status", "==", "RECEBIDA")
  );

  const snapshot = await getDocs(q);

  snapshot.forEach(docSnap => {
    const guia = docSnap.data();

    lista.innerHTML += `
      <div>
        <strong>Guia Nº ${guia.numeroGuia}</strong>
        <button onclick="arquivar('${docSnap.id}')">Arquivar</button>
      </div>
    `;
  });
}

window.arquivar = async function(idGuia) {

  const dataArquivamento = prompt("Data do Arquivamento:");
  const caixaGuia = prompt("Nº da Caixa:");
  const observacao = prompt("Observação:");

  await updateDoc(doc(db, "guias", idGuia), {
    status: "ARQUIVADA",
    arquivamento: {
      dataArquivamento,
      caixaGuia,
      observacao
    }
  });

  alert("Guia arquivada com sucesso!");
  carregar();
};

window.voltar = function() {
  window.location.href = "index.html";
};
