import { db, auth } from "./firebase.js";
import {
  collection,
  getDocs,
  updateDoc,
  doc
} from "https://www.gstatic.com/firebasejs/12.9.0/firebase-firestore.js";

import { onAuthStateChanged } from
"https://www.gstatic.com/firebasejs/12.9.0/firebase-auth.js";

onAuthStateChanged(auth, (user) => {
  if (!user) window.location.href = "index.html";
  else carregar();
});

async function carregar() {

  const lista = document.getElementById("listaRecebidas");
  lista.innerHTML = "";

  const snapshot = await getDocs(collection(db, "guias"));

  snapshot.forEach(docSnap => {
    const guia = docSnap.data();

    if (guia.status === "recebida") {
      lista.innerHTML += `
        <div style="margin-bottom:20px;">
          <strong>Guia Nº ${guia.numero}</strong>
          <button onclick="arquivar('${docSnap.id}')">Arquivar</button>
        </div>
      `;
    }
  });
}

window.arquivar = async function(idGuia) {

  const dataArquivamento = prompt("Data do Arquivamento:");
  const caixaGuia = prompt("Nº da Caixa:");
  const observacao = prompt("Observação:");

  await updateDoc(doc(db, "guias", idGuia), {
    status: "Arquivada",
    arquivamento: {
      dataArquivamento,
      caixaGuia,
      observacao
    }
  });

  alert("Guia arquivada!");
  carregar();
};

window.voltar = function() {
  window.location.href = "index.html";
};
