import { auth } from "./firebase.js";
import { 
  GoogleAuthProvider, 
  signInWithPopup, 
  signOut, 
  onAuthStateChanged 
} from "https://www.gstatic.com/firebasejs/12.9.0/firebase-auth.js";

const provider = new GoogleAuthProvider();

window.loginGoogle = async function () {
  try {
    await signInWithPopup(auth, provider);
  } catch (error) {
    alert("Erro ao fazer login: " + error.message);
  }
};

window.logout = async function () {
  await signOut(auth);
};

onAuthStateChanged(auth, (user) => {
  const loginArea = document.getElementById("loginArea");
  const menuSistema = document.getElementById("menuSistema");

  if (!loginArea || !menuSistema) return;

  if (user) {
    loginArea.style.display = "none";
    menuSistema.style.display = "flex";
  } else {
    loginArea.style.display = "flex";
    menuSistema.style.display = "none";
  }
};

firebase.auth().onAuthStateChanged(user => {

    if (user) {

        if (!user.email.endsWith("@defensoria.rj.def.br")) {
            firebase.auth().signOut();
            window.location.href = "login.html";
        }

    } else {
        window.location.href = "login.html";
    }

});
