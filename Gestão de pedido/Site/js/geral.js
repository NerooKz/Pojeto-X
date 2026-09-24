const SUPABASE_URL = "https://ocvhxujoztpeyiogwnbb.supabase.co";
const SUPABASE_KEY = "sb_publishable_CUIy8YK9lZjM38takFPGnw_q3IfWETY";

window.supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

function iniciais(nome) {
  return (nome || "A")
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map(parte => parte[0])
    .join("")
    .toUpperCase();
}

function dinheiro(valor) {
  return Number(valor || 0).toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL"
  });
}

function sistemaAtual() {
  return JSON.parse(localStorage.getItem("procyolSistema")) || {
    company: {},
    clients: [],
    orders: []
  };
}

function salvarSistema(sistema) {
  localStorage.setItem("procyolSistema", JSON.stringify(sistema));
}

function mostrarToast(texto) {
  const toast = document.getElementById("toast");
  if (!toast) return;

  toast.textContent = texto;
  toast.classList.add("show");
  setTimeout(() => toast.classList.remove("show"), 1800);
}

function classeStatus(status) {
  if (status === "Novo") return "novo";
  if (status === "Em preparo") return "preparo";
  if (status === "Pronto") return "pronto";
  if (status === "Cancelado") return "cancelado";
  return "entregue";
}

function formatarData(iso) {
  if (!iso) return "—";

  const data = new Date(iso);
  if (Number.isNaN(data.getTime())) return iso;

  return data.toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "2-digit"
  });
}

async function verificarSessao() {
  if (SUPABASE_URL.startsWith("COLE_") || SUPABASE_KEY.startsWith("COLE_")) {
    alert("Configure a URL e a chave do Supabase em js/geral.js e js/login.js.");
    window.location.href = "login.html";
    return;
  }

  const { data, error } = await supabaseClient.auth.getSession();

  if (error || !data.session) {
    window.location.href = "login.html";
    return;
  }

  const usuario = data.session.user;
  window.usuarioSupabase = usuario;

  const nome = usuario.user_metadata?.nome || usuario.email?.split("@")[0] || "Administrador";
  const sideName = document.getElementById("sideName");
  const sideRole = document.getElementById("sideRole");
  const sideAvatar = document.getElementById("sideAvatar");

  if (sideName) sideName.textContent = nome;
  if (sideRole) sideRole.textContent = "Administrador";
  if (sideAvatar) sideAvatar.textContent = iniciais(nome);
}

verificarSessao();

function aplicarTema(tema = localStorage.getItem("procyolTema") || "light") {
  let temaFinal = tema;

  if (tema === "system") {
    temaFinal = window.matchMedia("(prefers-color-scheme: dark)").matches
      ? "dark"
      : "light";
  }

  const escuro = temaFinal === "dark";

  document.documentElement.classList.toggle("dark", escuro);
  document.body.classList.toggle("dark", escuro);
}

aplicarTema();

const temaRapido = document.getElementById("themeQuick");

if (temaRapido) {
  temaRapido.addEventListener("click", () => {
    const estaEscuro = document.documentElement.classList.contains("dark");
    const novoTema = estaEscuro ? "light" : "dark";

    localStorage.setItem("procyolTema", novoTema);
    aplicarTema(novoTema);
  });
}

const sair = document.getElementById("logoutBtn");
if (sair) {
  sair.addEventListener("click", async () => {
    await supabaseClient.auth.signOut();
    window.location.href = "login.html";
  });
}

const buscaMenu = document.getElementById("sideSearch");
if (buscaMenu) {
  buscaMenu.addEventListener("keydown", event => {
    if (event.key !== "Enter") return;

    const busca = buscaMenu.value.trim().toLowerCase();
    const rotas = {
      pedido: "pedidos.html",
      pedidos: "pedidos.html",
      cliente: "clientes.html",
      clientes: "clientes.html",
      relatorio: "relatorios.html",
      relatórios: "relatorios.html",
      relatorios: "relatorios.html",
      configuracao: "configuracoes.html",
      configurações: "configuracoes.html",
      configuracoes: "configuracoes.html",
      dashboard: "dashboard.html",
      inicio: "dashboard.html"
    };

    if (rotas[busca]) window.location.href = rotas[busca];
  });
}
