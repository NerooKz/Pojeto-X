const SUPABASE_URL = "https://ocvhxujoztpeyiogwnbb.supabase.co";
const SUPABASE_KEY = "sb_publishable_CUIy8YK9lZjM38takFPGnw_q3IfWETY";

const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

const form = document.getElementById("loginForm");
const emailInput = document.getElementById("user");
const passwordInput = document.getElementById("password");
const togglePassword = document.getElementById("togglePassword");
const errorBox = document.getElementById("error");

function iniciarDadosDoSistema() {
  if (localStorage.getItem("procyolSistema")) return;

  localStorage.setItem("procyolSistema", JSON.stringify({
    company: {
      id: "EMP-0027",
      name: "Hamburgueria Central",
      doc: "12.345.678/0001-90",
      email: "contato@empresa.com",
      phone: "(11) 99999-9999",
      address: "São Paulo - SP",
      integration: "off"
    },
    clients: [
      { id: 1, name: "João Silva", phone: "(11) 91234-5678", email: "joao@email.com" },
      { id: 2, name: "Ana Souza", phone: "(11) 92345-6789", email: "ana@email.com" },
      { id: 3, name: "Pedro Lima", phone: "(11) 93456-7890", email: "pedro@email.com" },
      { id: 4, name: "Camila Martins", phone: "(11) 94567-8901", email: "camila@email.com" }
    ],
    orders: [
      { id: 1052, clientId: 4, clientName: "Camila Martins", items: "2x Combo Clássico", value: 89.8, status: "Novo", origin: "Automático", date: "2026-09-13T14:20:00" },
      { id: 1051, clientId: 2, clientName: "Ana Souza", items: "1x Combo Bacon", value: 52.9, status: "Em preparo", origin: "Manual", date: "2026-09-12T20:10:00" },
      { id: 1050, clientId: 1, clientName: "João Silva", items: "2x Smash + fritas", value: 96.5, status: "Pronto", origin: "Automático", date: "2026-09-11T19:40:00" },
      { id: 1049, clientId: 3, clientName: "Pedro Lima", items: "1x Combo Duplo", value: 61.9, status: "Entregue", origin: "Automático", date: "2026-09-08T21:15:00" },
      { id: 1048, clientId: 1, clientName: "João Silva", items: "1x Smash", value: 34.9, status: "Entregue", origin: "Manual", date: "2026-09-03T18:30:00" },
      { id: 1047, clientId: 2, clientName: "Ana Souza", items: "2x Combo Bacon", value: 105.8, status: "Entregue", origin: "Automático", date: "2026-08-27T20:05:00" },
      { id: 1046, clientId: 4, clientName: "Camila Martins", items: "1x Combo Clássico", value: 44.9, status: "Entregue", origin: "Manual", date: "2026-08-18T19:10:00" },
      { id: 1045, clientId: 3, clientName: "Pedro Lima", items: "1x Smash + bebida", value: 42.5, status: "Cancelado", origin: "Automático", date: "2026-08-12T17:30:00" },
      { id: 1044, clientId: 1, clientName: "João Silva", items: "3x Smash", value: 104.7, status: "Entregue", origin: "Automático", date: "2026-07-29T21:40:00" },
      { id: 1043, clientId: 2, clientName: "Ana Souza", items: "1x Combo Duplo", value: 61.9, status: "Entregue", origin: "Manual", date: "2026-06-14T20:10:00" }
    ]
  }));
}

iniciarDadosDoSistema();

// Se já existir sessão válida, não precisa fazer login de novo.
(async function verificarSessaoExistente() {
  if (SUPABASE_URL.startsWith("COLE_") || SUPABASE_KEY.startsWith("COLE_")) return;

  const { data } = await supabaseClient.auth.getSession();
  if (data.session) window.location.href = "dashboard.html";
})();

if (togglePassword) {
  togglePassword.addEventListener("click", () => {
    passwordInput.type = passwordInput.type === "password" ? "text" : "password";
  });
}

form.addEventListener("submit", async (event) => {
  event.preventDefault();
  errorBox.style.display = "none";

  const email = emailInput.value.trim();
  const senha = passwordInput.value;

  if (!email || !senha) {
    mostrarErro("Preencha e-mail e senha.");
    return;
  }

  if (SUPABASE_URL.startsWith("COLE_") || SUPABASE_KEY.startsWith("COLE_")) {
    mostrarErro("Configure a URL e a chave do Supabase no arquivo js/login.js.");
    return;
  }

  const { error } = await supabaseClient.auth.signInWithPassword({
    email,
    password: senha
  });

  if (error) {
    mostrarErro("E-mail ou senha inválidos.");
    return;
  }

  window.location.href = "dashboard.html";
});

function mostrarErro(mensagem) {
  errorBox.textContent = mensagem;
  errorBox.style.display = "block";
}
