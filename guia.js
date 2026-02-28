 (cd "$(git rev-parse --show-toplevel)" && git apply --3way <<'EOF' 
diff --git a/guia.js b/guia.js
index 5194c36f0f1623a96a5c26de35a251d8ffcb1bfe..ccd857a5e66920007315ec27d8c335291f5dcd4b 100644
--- a/guia.js
+++ b/guia.js
@@ -1,30 +1,49 @@
 import { db } from "./firebase.js";
 import { collection, addDoc, serverTimestamp } 
 from "https://www.gstatic.com/firebasejs/12.9.0/firebase-firestore.js";
 
+const horaEntradaInput = document.getElementById("horaEntrada");
+
+function preencherHoraEntradaAtual() {
+    if (!horaEntradaInput) return;
+
+    const agora = new Date();
+    horaEntradaInput.value = agora.toLocaleTimeString("pt-BR", {
+        hour: "2-digit",
+        minute: "2-digit"
+    });
+}
+
 window.salvarGuia = async function () {
 
+    preencherHoraEntradaAtual();
+
     const numeroGuia = document.getElementById("numeroGuia").value.trim();
+    const horaEntrada = horaEntradaInput?.value || "";
     const unidade = document.getElementById("unidade").value.trim();
     const dataRecebimento = document.getElementById("dataRecebimento").value;
 
     if (!numeroGuia || !unidade || !dataRecebimento) {
         alert("Preencha todos os campos.");
         return;
     }
 
     await addDoc(collection(db, "guias"), {
         numeroGuia,
+        horaEntrada,
         unidade,
         dataRecebimento,
         status: "RECEBIDA",
         criadoEm: serverTimestamp()
     });
 
     alert("Guia salva com sucesso!");
     document.querySelector("form").reset();
+    preencherHoraEntradaAtual();
 };
 
 window.voltar = function () {
     window.location.href = "index.html";
 };
+
+preencherHoraEntradaAtual();
 
EOF
)
