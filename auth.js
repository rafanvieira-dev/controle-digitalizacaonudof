// Inicialização
const auth = firebase.auth();
const provider = new firebase.auth.GoogleAuthProvider();

// Login com Google
function loginGoogle() {
    auth.signInWithPopup(provider)
        .then((result) => {

            const user = result.user;

            // Permitir apenas email institucional
            if (!user.email.endsWith("@defensoria.rj.def.br")) {
                alert("Acesso permitido apenas com e-mail institucional.");
                auth.signOut();
                return;
            }

            window.location.href = "index.html";

        })
        .catch((error) => {
            console.error("Erro no login:", error);
        });
}

// Logout
function logout() {
    auth.signOut().then(() => {
        window.location.href = "login.html";
    });
}

// Proteção de páginas internas
auth.onAuthStateChanged((user) => {

    if (window.location.pathname.includes("login.html")) return;

    if (!user) {
        window.location.href = "login.html";
        return;
    }

    if (!user.email.endsWith("@defensoria.rj.def.br")) {
        auth.signOut();
        window.location.href = "login.html";
    }

});
