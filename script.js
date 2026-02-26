let guias = JSON.parse(localStorage.getItem("guias")) || [];

function salvar() {
  localStorage.setItem("guias", JSON.stringify(guias));
}

function renderizar() {
  const listaGuias = document.getElementById("listaGuias");
  const listaArquivadas = document.getElementById("listaArquivadas");

  listaGuias.innerHTML = "";
  listaArquivadas.innerHTML = "";

  guias.forEach((guia, index) => {

    const totalDocs = guia.documentos.length;
    const pendentes = guia.documentos.filter(d => d.status === "Pendente").length;

    const div = document.createElement("div");
    div.className = "guia";

    div.innerHTML = `
      <strong>Guia:</strong> ${guia.numeroGuia}<br>
      <strong>Unidade:</strong> ${guia.unidade}<br>
      <strong>Responsável:</strong> ${guia.responsavel}<br>
      <strong>Documentos:</strong> ${totalDocs} | Pendentes: ${pendentes}<br>
      ${guia.status === "Arquivada" ? 
        `<strong>Caixa:</strong> ${guia.caixa}<br>
         <strong>Data Arquivamento:</strong> ${guia.dataArquivamento}<br>` 
         : ""
      }
      <button class="small-btn" onclick="mostrarDocumentos(${index})">Abrir</button>
      ${guia.status !== "Arquivada" ? 
        `<button class="small-btn" onclick="arquivarGuia(${index})">Arquivar</button>` 
        : ""
      }
    `;

    if (guia.status === "Arquivada") {
      listaArquivadas.appendChild(div);
    } else {
      listaGuias.appendChild(div);
    }
  });

  salvar();
}

document.getElementById("formGuia").addEventListener("submit", function(e) {
  e.preventDefault();

  const numeroGuia = document.getElementById("numeroGuia").value;

  if (guias.some(g => g.numeroGuia === numeroGuia)) {
    alert("Número de guia já existe!");
    return;
  }

  const novaGuia = {
    numeroGuia,
    unidade: document.getElementById("unidade").value,
    dataRecebimento: document.getElementById("dataRecebimento").value,
    responsavel: document.getElementById("responsavel").value,
    status: "Em andamento",
    caixa: "",
    dataArquivamento: "",
    documentos: []
  };

  guias.push(novaGuia);
  this.reset();
  renderizar();
});

function mostrarDocumentos(index) {
  const guia = guias[index];

  const nome = prompt("Nome do documento:");
  if (!nome) return;

  const paginas = prompt("Quantidade de páginas:");
  if (!paginas) return;

  guia.documentos.push({
    nome,
    paginas,
    status: "Pendente"
  });

  renderizar();
}

function arquivarGuia(index) {
  const guia = guias[index];

  const pendentes = guia.documentos.filter(d => d.status === "Pendente");

  if (pendentes.length > 0) {
    alert("Existem documentos pendentes!");
    return;
  }

  const caixa = prompt("Informe Nº da Caixa:");
  if (!caixa) return;

  guia.caixa = caixa;
  guia.dataArquivamento = new Date().toLocaleDateString();
  guia.status = "Arquivada";

  renderizar();
}

renderizar();
