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

// BOTÃO VOLTAR
window.voltar = function() {
  window.location.href = "index.html";
};
