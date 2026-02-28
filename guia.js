import { db } from "./firebase.js";
import { collection, addDoc } from "https://www.gstatic.com/firebasejs/12.9.0/firebase-firestore.js";

document.getElementById("horaEntrada").value =
    new Date().toLocaleTimeString("pt-BR");

window.salvarGuia = async function () {

    const numeroGuia = document.getElementById("numeroGuia").value;
    const horaEntrada = document.getElementById("horaEntrada").value;
    const unidade = document.getElementById("unidade").value;
    const dataRecebimento = document.getElementById("dataRecebimento").value;

    if (!numeroGuia || !unidade || !dataRecebimento) {
        alert("Preencha todos os campos.");
        return;
    }

    try {
        await addDoc(collection(db, "guias"), {
            numero: numeroGuia,
            horaEntrada,
            unidade,
            dataRecebimento,
            status: "Recebida",
            criadoEm: new Date()
        });

        alert("Guia salva com sucesso!");
        document.querySelector("form").reset();
        document.getElementById("horaEntrada").value =
            new Date().toLocaleTimeString("pt-BR");

    } catch (error) {
        alert("Erro ao salvar guia.");
    }
};

window.voltar = function () {
    window.location.href = "index.html";
};
