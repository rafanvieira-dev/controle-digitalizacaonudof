let guias = JSON.parse(localStorage.getItem("guias")) || [];
let documentos = JSON.parse(localStorage.getItem("documentos")) || [];

function salvar() {
  localStorage.setItem("guias", JSON.stringify(guias));
  localStorage.setItem("documentos", JSON.stringify(documentos));
}

/* ---------------- GUIAS ---------------- */

if (document.getElementById("formGuia")) {

  document.getElementById("formGuia").addEventListener("submit", function(e){
    e.preventDefault();

    const numeroGuia = document.getElementById("numeroGuia").value;

    if(guias.some(g => g.numeroGuia === numeroGuia)){
      alert("Guia já cadastrada!");
      return;
    }

    guias.push({
      numeroGuia,
      horaEntrada: new Date().toLocaleString(),
      unidade: document.getElementById("unidade").value,
      dataRecebimento: document.getElementById("dataRecebimento").value,
      status: "Em Andamento",
      numeroCaixa: "",
      dataArquivamento: "",
      observacao: document.getElementById("observacao").value
    });

    salvar();
    renderizarGuias();
    this.reset();
  });

  function renderizarGuias(){
    const tabela = document.getElementById("tabelaGuias");
    tabela.innerHTML = "";

    guias.forEach(g => {
      tabela.innerHTML += `
        <tr>
          <td>${g.numeroGuia}</td>
          <td>${g.horaEntrada}</td>
          <td>${g.unidade}</td>
          <td>${g.dataRecebimento}</td>
          <td>${g.status}</td>
          <td>${g.numeroCaixa}</td>
          <td>${g.dataArquivamento}</td>
          <td>${g.observacao}</td>
        </tr>
      `;
    });
  }

  renderizarGuias();
}

/* ---------------- DOCUMENTOS ---------------- */

if (document.getElementById("formDocumento")) {

  document.getElementById("formDocumento").addEventListener("submit", function(e){
    e.preventDefault();

    const guiaDoc = document.getElementById("guiaDoc").value;

    if(!guias.some(g => g.numeroGuia === guiaDoc)){
      alert("Guia não encontrada!");
      return;
    }

    documentos.push({
      numeroGuia: guiaDoc,
      nome: document.getElementById("nomeDoc").value,
      tipo: document.getElementById("tipoDoc").value,
      paginas: document.getElementById("paginasDoc").value,
      status: "Pendente",
      observacao: document.getElementById("obsDoc").value
    });

    salvar();
    renderizarDocumentos();
    this.reset();
  });

  function renderizarDocumentos(){
    const tabela = document.getElementById("tabelaDocumentos");
    tabela.innerHTML = "";

    documentos.forEach(d => {
      tabela.innerHTML += `
        <tr>
          <td>${d.numeroGuia}</td>
          <td>${d.nome}</td>
          <td>${d.tipo}</td>
          <td>${d.paginas}</td>
          <td>${d.status}</td>
          <td>${d.observacao}</td>
        </tr>
      `;
    });
  }

  renderizarDocumentos();
}
