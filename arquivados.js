import { db, auth } from "./firebase.js";
import {
  collection,
  getDocs,
  deleteDoc,
  doc,
  getDoc
} from "https://www.gstatic.com/firebasejs/12.9.0/firebase-firestore.js";

import { onAuthStateChanged } from
"https://www.gstatic.com/firebasejs/12.9.0/firebase-auth.js";

const lista = document.getElementById("listaArquivados");
let isAdmin = false;

onAuthStateChanged(auth, async (user) => {

  if (!user) {
    window.location.href = "index.html";
  } else {

    const userDoc = await getDoc(doc(db, "usuarios", user.uid));

    if (userDoc.exists() && userDoc.data().role === "admin") {
      isAdmin = true;
    }

    carregarArquivados();
  }
});

async function carregarArquivados() {

  lista.innerHTML = "";

  const snapshot = await getDocs(collection(db, "guias"));

  snapshot.forEach(docSnap => {

    const guia = docSnap.data();

    if (guia.status === "Arquivada") {

      lista.innerHTML += `
        <div class="pasta">
          <strong>Guia Nº ${guia.numero}</strong>
          <p>Unidade: ${guia.unidade}</p>

          ${isAdmin ? `
          <button class="btn-danger" onclick="excluirGuia('${docSnap.id}')">
            Excluir
          </button>
          ` : ""}
        </div>
      `;
    }
  });
}

window.excluirGuia = async function(idGuia) {

  const confirmar = confirm("Excluir guia arquivada?");
  if (!confirmar) return;

  const docsSnapshot = await getDocs(
    collection(db, "guias", idGuia, "documentos")
  );

  for (const docSnap of docsSnapshot.docs) {
    await deleteDoc(doc(db, "guias", idGuia, "documentos", docSnap.id));
  }

  await deleteDoc(doc(db, "guias", idGuia));

  alert("Guia arquivada excluída!");
  carregarArquivados();
};
