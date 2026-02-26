import { db, auth } from "./firebase.js";
import { 
  collection, 
  addDoc, 
  getDocs, 
  query, 
  where 
} from "https://www.gstatic.com/firebasejs/12.9.0/firebase-firestore.js";

import { onAuthStateChanged } 
from "https://www.gstatic.com/firebasejs/12.9.0/firebase-auth.js";

onAuthStateChanged(auth, (user) => {
  if (!user) {
    window.location.href = "index.html";
  }
});

window.salvarGuia = async function () {

  const numeroGuia = document.getElementById("numeroGuia").value;
  const horaEntrada = document.getElementById("horaEntrada").value;
  const unidade = document.getElementById("unidade").value;
  const dataRecebimento = document.getElementById("dataRecebimento").value;

  if (!numeroGuia || !unidade || !dataRecebimento) {
    alert("Preencha todos os campos.");
    return;
  }

  // Verificar duplicidade
  const q = query(
    collection(db, "guias"),
    where("numeroGuia", "==", numeroGuia)
  );

  const snapshot = await getDocs(q);

  if (!snapshot.empty) {
    alert("Já existe uma guia com esse número.");
    return;
  }

  await addDoc(collection(db, "guias"), {
    numeroGuia,
    horaEntrada,
    unidade,
    dataRecebimento,
    status: "Ativa",
    criadoPor: auth.currentUser.email,
    criadoEm: new Date()
  });

  alert("Guia criada com sucesso!");
  window.location.href = "index.html";
};

window.voltar = function () {
  window.location.href = "index.html";
};
