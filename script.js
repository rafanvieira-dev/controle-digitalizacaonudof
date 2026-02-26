// Inicializa armazenamento
let guias = JSON.parse(localStorage.getItem("guias")) || [];

// Salvar nova guia
function salvarGuia() {
    const numeroGuia = document.getElementById("numeroGuia").value;
    const horaEntrada = document.getElementById("horaEntrada").value;
    const unidade = document.getElementById("unidade").value;
    const dataRecebimento = document.getElementById("dataRecebimento").value;

    // Verifica se guia já existe
    if (guias.some(g => g.numeroGuia === numeroGuia)) {
        alert("Já existe uma guia com esse número.");
        return;
    }

    const novaGuia = {
        numeroGuia,
        horaEntrada,
        unidade,
        dataRecebimento,
        status: "Ativa",
        documentos: [],
        arquivamento: null
    };

    guias.push(novaGuia);
    localStorage.setItem("guias", JSON.stringify(guias));

    alert("Guia criada com sucesso!");
    window.location.href = "index.html";
}

// Voltar para menu
function voltar() {
    window.location.href = "index.html";
}
