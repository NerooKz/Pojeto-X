let sistema = sistemaAtual();

const body = document.getElementById("clientsBody");
const search = document.getElementById("clientSearch");
const modal = document.getElementById("clientModal");

// ==========================================
// RENDERIZAR CLIENTES
// ==========================================

function render() {
    const textoBusca =
        search.value.toLowerCase();

    const lista =
        sistema.clients.filter(cliente => {

            const nome =
                cliente.name.toLowerCase();

            const email =
                cliente.email.toLowerCase();

            const telefone =
                cliente.phone;


            return (
                !textoBusca ||
                nome.includes(textoBusca) ||
                email.includes(textoBusca) ||
                telefone.includes(textoBusca)
            );
        });


    if (!lista.length) {

        body.innerHTML = `
            <tr>
                <td colspan="6" class="empty">
                    Nenhum cliente encontrado.
                </td>
            </tr>
        `;

        return;
    }


    body.innerHTML = lista
        .map(cliente => {

            const pedidosCliente =
                sistema.orders
                    .filter(
                        pedido =>
                            pedido.clientId === cliente.id
                    )
                    .sort((a, b) => {
                        return (
                            new Date(b.date) -
                            new Date(a.date)
                        );
                    });


            const ultimoPedido =
                pedidosCliente[0];


            return `
                <tr>

                    <td>
                        <b>
                            ${cliente.name}
                        </b>
                    </td>

                    <td>
                        ${cliente.phone || "—"}
                    </td>

                    <td>
                        ${cliente.email || "—"}
                    </td>

                    <td>
                        ${pedidosCliente.length}
                    </td>

                    <td>
                        ${formatarData(ultimoPedido?.date)}
                    </td>

                    <td>
                        <div class="actions">

                            <a
                                class="small"
                                href="pedidos.html?cliente=${cliente.id}"
                            >
                                Novo pedido
                            </a>

                            <button
                                class="small red"
                                onclick="excluirCliente(${cliente.id})"
                            >
                                Excluir
                            </button>

                        </div>
                    </td>

                </tr>
            `;
        })
        .join("");
}

// ==========================================
// EXCLUIR CLIENTE
// ==========================================

window.excluirCliente = function (id) {

    const possuiPedidoAtivo =
        sistema.orders.some(pedido => {

            const mesmoCliente =
                pedido.clientId === id;

            const statusAtivo = [
                "Novo",
                "Em preparo",
                "Pronto"
            ].includes(pedido.status);

            return (
                mesmoCliente &&
                statusAtivo
            );
        });


    if (possuiPedidoAtivo) {

        mostrarToast(
            "Este cliente possui pedidos ativos."
        );

        return;
    }


    const confirmou =
        confirm("Excluir este cliente?");


    if (!confirmou) {
        return;
    }


    const cliente =
        sistema.clients.find(
            item => item.id === id
        );


    // Guarda o nome do cliente
    // nos pedidos antigos

    if (cliente) {

        sistema.orders.forEach(pedido => {

            if (
                pedido.clientId === id &&
                !pedido.clientName
            ) {
                pedido.clientName =
                    cliente.name;
            }

        });
    }


    // Remove o cliente da lista

    sistema.clients =
        sistema.clients.filter(
            item => item.id !== id
        );


    salvarSistema(sistema);

    render();

    mostrarToast(
        "Cliente excluído."
    );
};

// ==========================================
// ABRIR MODAL
// ==========================================

function abrirModal() {
    modal.classList.add("show");
}

// ==========================================
// FECHAR MODAL
// ==========================================

function fecharModal() {
    modal.classList.remove("show");
}

// ==========================================
// BOTÕES DO MODAL
// ==========================================

document
    .getElementById("newClientBtn")
    .addEventListener(
        "click",
        abrirModal
    );


document
    .querySelectorAll(
        '[data-close="clientModal"]'
    )
    .forEach(botao => {

        botao.addEventListener(
            "click",
            fecharModal
        );

    });


modal.addEventListener(
    "click",
    event => {

        if (event.target === modal) {
            fecharModal();
        }

    }
);

// ==========================================
// SALVAR NOVO CLIENTE
// ==========================================

document
    .getElementById("saveClient")
    .addEventListener(
        "click",
        function () {

            const nome =
                document
                    .getElementById("clientName")
                    .value
                    .trim();


            const telefone =
                document
                    .getElementById("clientPhone")
                    .value;


            const email =
                document
                    .getElementById("clientEmail")
                    .value;


            if (!nome) {

                mostrarToast(
                    "Informe o nome."
                );

                return;
            }


            const novoCliente = {
                id: Date.now(),

                name:
                    nome,

                phone:
                    telefone,

                email:
                    email
            };


            sistema.clients.push(
                novoCliente
            );


            salvarSistema(sistema);

            limparFormulario();

            fecharModal();

            render();

            mostrarToast(
                "Cliente cadastrado."
            );

        }
    );

// ==========================================
// LIMPAR FORMULÁRIO
// ==========================================

function limparFormulario() {

    const campos = [
        "clientName",
        "clientPhone",
        "clientEmail"
    ];


    campos.forEach(id => {

        document
            .getElementById(id)
            .value = "";

    });
}

// ==========================================
// PESQUISA
// ==========================================

search.addEventListener(
    "input",
    render
);

// ==========================================
// INICIALIZAÇÃO
// ==========================================

render();