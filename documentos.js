 (cd "$(git rev-parse --show-toplevel)" && git apply --3way <<'EOF' 
diff --git a/documentos.js b/documentos.js
index 0053693ff431c1507ac73afdf83ea0a80fb1b1b2..00783bea54156645b8eabc9f73d1d7c0cce276ec 100644
--- a/documentos.js
+++ b/documentos.js
@@ -1,41 +1,45 @@
 import { db } from "./firebase.js";
 import { 
   collection, 
   getDocs, 
   addDoc,
   query,
   where,
   serverTimestamp
 } from "https://www.gstatic.com/firebasejs/12.9.0/firebase-firestore.js";
 
 const listaGuias = document.getElementById("listaGuias");
 const areaDocumentos = document.getElementById("areaDocumentos");
 const tituloGuia = document.getElementById("tituloGuia");
 const form = document.getElementById("formDocumento");
 const listaDocumentos = document.getElementById("listaDocumentos");
 const contador = document.getElementById("contadorDocs");
+const nomeDocumentoInput = document.getElementById("nomeDocumento");
+const numeroProcessoInput = document.getElementById("numeroProcesso");
+const dataRecebimentoInput = document.getElementById("dataRecebimento");
+const guiaRemessaInput = document.getElementById("guiaRemessa");
 
 let guiaSelecionada = null;
 
 async function carregarGuias() {
 
     const q = query(
         collection(db, "guias"),
         where("status", "==", "RECEBIDA")
     );
 
     const snapshot = await getDocs(q);
     listaGuias.innerHTML = "";
 
     snapshot.forEach(docSnap => {
         const dados = docSnap.data();
 
         listaGuias.innerHTML += `
             <li>
                 <strong>${dados.numeroGuia}</strong>
                 - <a href="#" data-id="${docSnap.id}" data-numero="${dados.numeroGuia}">
                     Inserir Documentos
                 </a>
             </li>
         `;
     });
@@ -60,50 +64,55 @@ async function carregarDocumentos() {
     );
 
     listaDocumentos.innerHTML = "";
 
     snapshot.forEach(docSnap => {
         const d = docSnap.data();
 
         listaDocumentos.innerHTML += `
             <li>
                 <strong>${d.nomeDocumento}</strong><br>
                 Processo SEI: ${d.numeroProcesso}<br>
                 Data: ${d.dataRecebimento}<br>
                 Guia Remessa: ${d.guiaRemessa}
                 <hr>
             </li>
         `;
     });
 
     contador.innerText = `${snapshot.size} / 7 documentos`;
     form.style.display = snapshot.size >= 7 ? "none" : "block";
 }
 
 form.addEventListener("submit", async (e) => {
     e.preventDefault();
 
+    if (!guiaSelecionada) {
+        alert("Selecione uma guia antes de adicionar documentos.");
+        return;
+    }
+
     const snapshot = await getDocs(
         collection(db, "guias", guiaSelecionada, "documentos")
     );
 
     if (snapshot.size >= 7) {
         alert("Limite máximo atingido.");
         return;
     }
 
     await addDoc(
         collection(db, "guias", guiaSelecionada, "documentos"),
         {
-            nomeDocumento: nomeDocumento.value,
-            numeroProcesso: numeroProcesso.value,
-            dataRecebimento: dataRecebimento.value,
-            guiaRemessa: guiaRemessa.value,
+            nomeDocumento: nomeDocumentoInput.value,
+            numeroProcesso: numeroProcessoInput.value,
+            dataRecebimento: dataRecebimentoInput.value,
+            guiaRemessa: guiaRemessaInput.value,
             criadoEm: serverTimestamp()
         }
     );
 
     form.reset();
     carregarDocumentos();
 });
 
 carregarGuias();
 
EOF
)
