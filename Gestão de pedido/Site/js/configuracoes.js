let sistema = sistemaAtual();
const $ = id => document.getElementById(id);

async function carregar() {
  const { data } = await supabaseClient.auth.getUser();
  const usuario = data.user;

  if (!usuario) {
    window.location.href = "login.html";
    return;
  }

  const nome = usuario.user_metadata?.nome || usuario.email?.split("@")[0] || "Administrador";

  $("profileName").value = nome;
  $("profileEmail").value = usuario.email || "";
  $("profileEmail").disabled = true;
  $("profileRole").value = "Administrador";
  $("profileAvatar").textContent = iniciais(nome);
  $("companyName").value = sistema.company.name || "";
  $("companyDoc").value = sistema.company.doc || "";
  $("companyEmail").value = sistema.company.email || "";
  $("companyPhone").value = sistema.company.phone || "";
  $("companyAddress").value = sistema.company.address || "";
  $("companyId").value = sistema.company.id || "";
  $("integration").value = sistema.company.integration || "off";

  document.querySelectorAll(".theme").forEach(tema => {
    tema.classList.toggle(
      "active",
      tema.dataset.theme === (localStorage.getItem("procyolTema") || "light")
    );
  });
}

$("saveProfile").onclick = async () => {
  const nome = $("profileName").value.trim();

  if (!nome) {
    mostrarToast("Informe seu nome.");
    return;
  }

  const { error } = await supabaseClient.auth.updateUser({
    data: { nome }
  });

  if (error) {
    mostrarToast("Não foi possível salvar o perfil.");
    return;
  }

  mostrarToast("Perfil salvo.");
  setTimeout(() => location.reload(), 500);
};

$("saveCompany").onclick = () => {
  sistema.company = {
    ...sistema.company,
    name: $("companyName").value.trim(),
    doc: $("companyDoc").value.trim(),
    email: $("companyEmail").value.trim(),
    phone: $("companyPhone").value.trim(),
    address: $("companyAddress").value.trim(),
    integration: $("integration").value
  };

  salvarSistema(sistema);
  mostrarToast("Empresa salva.");
};

document.querySelectorAll(".settings-menu button").forEach(botao => {
  botao.onclick = () => {
    document.querySelectorAll(".settings-menu button").forEach(item => {
      item.classList.toggle("active", item === botao);
    });

    document.querySelectorAll(".settings-card").forEach(card => {
      card.classList.toggle("active", card.id === "set-" + botao.dataset.setting);
    });
  };
});

document.querySelectorAll(".theme").forEach(tema => {
  tema.onclick = () => {
    localStorage.setItem("procyolTema", tema.dataset.theme);
    aplicarTema();
    carregar();
    mostrarToast("Tema atualizado.");
  };
});

carregar();
