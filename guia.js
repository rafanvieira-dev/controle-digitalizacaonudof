import { db } from "./firebase.js";
import { collection, addDoc, serverTimestamp } 
from "https://www.gstatic.com/firebasejs/12.9.0/firebase-firestore.js";

window.salvarGuia = async function () {

    const numeroGuia = document.getElementById("numeroGuia").value.trim();
    const unidade = document.getElementById("unidade").value.trim();
    const dataRecebimento = document.getElementById("dataRecebimento").value;

    if (!numeroGuia || !unidade || !dataRecebimento) {
        alert("Preencha todos os campos.");
        return;
    }

    await addDoc(collection(db, "guias"), {
        numeroGuia,
        unidade,
        dataRecebimento,
        status: "RECEBIDA",
        criadoEm: serverTimestamp()
    });

    alert("Guia salva com sucesso!");
    document.querySelector("form").reset();
};

window.voltar = function () {
    window.location.href = "index.html";
};
