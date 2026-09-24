let sistema = sistemaAtual();
let produtos = [];

// ==========================================
// ELEMENTOS
// ==========================================

const body = document.getElementById("ordersBody");
const search = document.getElementById("orderSearch");
const statusFilter = document.getElementById("orderStatus");
const originFilter = document.getElementById("orderOrigin");
const modal = document.getElementById("orderModal");
const clientSelect = document.getElementById("orderClient");
const categorySelect = document.getElementById("orderCategory");
const productSelect = document.getElementById("orderProduct");
const quantityInput = document.getElementById("orderQuantity");
const valueInput = document.getElementById("orderValue");
const statusInput = document.getElementById("orderInitial");

// ==========================================
// CARREGAR PRODUTOS DO SUPABASE
// ==========================================

async function carregarProdutos() {

    const { data, error } =
        await supabaseClient
            .from("produtos")
            .select("*")
            .eq("ativo", true)
            .gt("estoque", 0)
            .order("nome");


    if (error) {

        console.error(
            "Erro ao carregar produtos:",
            error
        );

        mostrarToast(
            "Erro ao carregar produtos."
        );

        return;
    }


    produtos = data || [];

    preencherCategorias();

    resetarProduto();
}


// ==========================================
// CATEGORIAS
// ==========================================

function preencherCategorias() {

    const categorias = [
        ...new Set(
            produtos
                .map(produto => produto.categoria)
                .filter(Boolean)
        )
    ];


    categorias.sort(
        (a, b) =>
            a.localeCompare(
                b,
                "pt-BR"
            )
    );


    categorySelect.innerHTML =
        '<option value="">Selecione...</option>' +
        categorias
            .map(categoria => {

                return `
                    <option value="${categoria}">
                        ${categoria}
                    </option>
                `;

            })
            .join("");
}


// ==========================================
// PRODUTOS DA CATEGORIA
// ==========================================

function preencherProdutosCategoria() {

    const categoria =
        categorySelect.value;


    if (!categoria) {

        resetarProduto();

        return;
    }


    const lista =
        produtos.filter(
            produto =>
                produto.categoria ===
                categoria
        );


    productSelect.disabled =
        false;


    productSelect.innerHTML =
        '<option value="">Selecione...</option>' +
        lista
            .map(produto => {

                return `
                    <option value="${produto.id}">
                        ${produto.nome}
                    </option>
                `;

            })
            .join("");


    valueInput.value = "";
}


// ==========================================
// RESETAR PRODUTO
// ==========================================

function resetarProduto() {

    productSelect.innerHTML = `
        <option value="">
            Selecione uma categoria primeiro
        </option>
    `;


    productSelect.disabled =
        true;


    quantityInput.value =
        1;


    valueInput.value =
        "";
}


// ==========================================
// CALCULAR VALOR
// ==========================================

function calcularTotal() {

    const produtoId =
        Number(
            productSelect.value
        );


    const quantidade =
        Number(
            quantityInput.value || 1
        );


    const produto =
        produtos.find(
            item =>
                item.id ===
                produtoId
        );


    if (
        !produto ||
        quantidade < 1
    ) {

        valueInput.value = "";

        return;
    }


    const total =
        Number(produto.preco) *
        quantidade;


    valueInput.value =
        total.toFixed(2);
}


// ==========================================
// CLIENTES
// ==========================================

function preencherClientes() {

    clientSelect.innerHTML =
        '<option value="">Selecione...</option>' +
        sistema.clients
            .map(cliente => {

                return `
                    <option value="${cliente.id}">
                        ${cliente.name}
                    </option>
                `;

            })
            .join("");


    const clienteURL =
        new URLSearchParams(
            location.search
        ).get("cliente");


    if (clienteURL) {

        clientSelect.value =
            clienteURL;

    }
}


// ==========================================
// RENDERIZAR PEDIDOS
// ==========================================

function render() {

    const textoBusca =
        search.value
            .trim()
            .toLowerCase();


    const statusSelecionado =
        statusFilter.value;


    const origemSelecionada =
        originFilter.value;


    const lista =
        [...sistema.orders]

            .sort(
                (a, b) =>
                    new Date(b.date) -
                    new Date(a.date)
            )

            .filter(pedido => {

                const cliente =
                    sistema.clients.find(
                        item =>
                            item.id ===
                            pedido.clientId
                    );


                const nomeCliente =
                    cliente?.name ||
                    pedido.clientName ||
                    "";


                const encontrouBusca =
                    !textoBusca ||
                    String(pedido.id)
                        .includes(
                            textoBusca
                        ) ||
                    nomeCliente
                        .toLowerCase()
                        .includes(
                            textoBusca
                        );


                const encontrouStatus =
                    !statusSelecionado ||
                    pedido.status ===
                    statusSelecionado;


                const encontrouOrigem =
                    !origemSelecionada ||
                    pedido.origin ===
                    origemSelecionada;


                return (
                    encontrouBusca &&
                    encontrouStatus &&
                    encontrouOrigem
                );

            });


    if (!lista.length) {

        body.innerHTML = `
            <tr>
                <td
                    colspan="8"
                    class="empty"
                >
                    Nenhum pedido encontrado.
                </td>
            </tr>
        `;

        return;
    }


    body.innerHTML =
        lista
            .map(pedido => {

                const cliente =
                    sistema.clients.find(
                        item =>
                            item.id ===
                            pedido.clientId
                    );


                const nomeCliente =
                    cliente?.name ||
                    pedido.clientName ||
                    "Cliente removido";


                return `
                    <tr>

                        <td>
                            <b>
                                #${pedido.id}
                            </b>
                        </td>

                        <td>
                            ${nomeCliente}
                        </td>

                        <td>
                            ${pedido.items}
                        </td>

                        <td>
                            ${dinheiro(pedido.value)}
                        </td>

                        <td>
                            ${formatarData(pedido.date)}
                        </td>

                        <td>
                            ${pedido.origin}
                        </td>

                        <td>
                            <span
                                class="status ${classeStatus(pedido.status)}"
                            >
                                ${pedido.status}
                            </span>
                        </td>

                        <td>
                            <div class="actions">
                                ${criarAcoes(pedido)}
                            </div>
                        </td>

                    </tr>
                `;

            })
            .join("");
}


// ==========================================
// AÇÕES DOS PEDIDOS
// ==========================================

function criarAcoes(pedido) {

    let acoes = "";


    if (pedido.status === "Novo") {

        acoes += `
            <button
                class="small"
                onclick="mudarStatus(${pedido.id}, 'Em preparo')"
            >
                Iniciar
            </button>
        `;

    }


    if (pedido.status === "Em preparo") {

        acoes += `
            <button
                class="small"
                onclick="mudarStatus(${pedido.id}, 'Pronto')"
            >
                Pronto
            </button>
        `;

    }


    if (pedido.status === "Pronto") {

        acoes += `
            <button
                class="small"
                onclick="mudarStatus(${pedido.id}, 'Entregue')"
            >
                Entregue
            </button>
        `;

    }


    const finalizado = [
        "Entregue",
        "Cancelado"
    ].includes(
        pedido.status
    );


    if (!finalizado) {

        acoes += `
            <button
                class="small red"
                onclick="mudarStatus(${pedido.id}, 'Cancelado')"
            >
                Cancelar
            </button>
        `;

    }


    return acoes;
}


// ==========================================
// ALTERAR STATUS
// ==========================================

window.mudarStatus =
    function (
        id,
        status
    ) {

        const pedido =
            sistema.orders.find(
                item =>
                    item.id === id
            );


        if (!pedido) {
            return;
        }


        pedido.status =
            status;


        salvarSistema(
            sistema
        );


        render();


        mostrarToast(
            "Status atualizado."
        );

    };


// ==========================================
// MODAL
// ==========================================

function abrirModal() {

    preencherClientes();

    modal.classList.add(
        "show"
    );
}


function fecharModal() {

    modal.classList.remove(
        "show"
    );
}


document
    .getElementById(
        "newOrderBtn"
    )
    .addEventListener(
        "click",
        abrirModal
    );


document
    .querySelectorAll(
        '[data-close="orderModal"]'
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

        if (
            event.target ===
            modal
        ) {

            fecharModal();

        }

    }
);


// ==========================================
// GERAR ID
// ==========================================

function gerarProximoIdPedido() {

    if (
        !sistema.orders.length
    ) {

        return 1001;

    }


    const ids =
        sistema.orders.map(
            pedido =>
                Number(
                    pedido.id
                )
        );


    return (
        Math.max(...ids) + 1
    );
}


// ==========================================
// CRIAR CLIENTE PELO PEDIDO
// ==========================================

function criarClienteSeNecessario() {

    let clientId =
        Number(
            clientSelect.value || 0
        );


    if (clientId) {

        return clientId;

    }


    const nome =
        document
            .getElementById(
                "orderNewName"
            )
            .value
            .trim();


    if (!nome) {

        return 0;

    }


    const novoCliente = {

        id:
            Date.now(),

        name:
            nome,

        phone:
            document
                .getElementById(
                    "orderNewPhone"
                )
                .value
                .trim(),

        email:
            document
                .getElementById(
                    "orderNewEmail"
                )
                .value
                .trim()

    };


    sistema.clients.push(
        novoCliente
    );


    return novoCliente.id;
}


// ==========================================
// LIMPAR FORMULÁRIO
// ==========================================

function limparFormulario() {

    const campos = [
        "orderNewName",
        "orderNewPhone",
        "orderNewEmail"
    ];


    campos.forEach(id => {

        document
            .getElementById(id)
            .value = "";

    });


    clientSelect.value =
        "";


    categorySelect.value =
        "";


    statusInput.value =
        "Novo";


    resetarProduto();
}

// ==========================================
// CRIAR PEDIDO
// ==========================================

document.getElementById("saveOrder").addEventListener("click", async function () {
    const clientId = criarClienteSeNecessario();
            if (!clientId) {
                mostrarToast("Selecione ou cadastre um cliente.");

                return;
            }

            const produtoId = Number(productSelect.value);

            const quantidade =
                Number(
                    quantityInput.value
                );


            const produto =
                produtos.find(
                    item =>
                        item.id ===
                        produtoId
                );


            if (!produto) {

                mostrarToast(
                    "Selecione um produto."
                );

                return;
            }


            if (
                !quantidade ||
                quantidade < 1
            ) {

                mostrarToast(
                    "Informe uma quantidade válida."
                );

                return;
            }


            if (
                quantidade >
                produto.estoque
            ) {

                mostrarToast(
                    "Estoque insuficiente."
                );

                return;
            }


            const valorTotal =
                Number(
                    produto.preco
                ) *
                quantidade;


            const novoEstoque =
                produto.estoque -
                quantidade;


            // ==================================
            // ATUALIZA ESTOQUE NO SUPABASE
            // ==================================

            const { error } =
                await supabaseClient
                    .from("produtos")
                    .update({
                        estoque:
                            novoEstoque
                    })
                    .eq(
                        "id",
                        produto.id
                    );


            if (error) {

                console.error(
                    "Erro ao atualizar estoque:",
                    error
                );


                mostrarToast(
                    "Não foi possível atualizar o estoque."
                );


                return;
            }


            // ==================================
            // CRIA PEDIDO
            // ==================================

            sistema.orders.push({

                id:
                    gerarProximoIdPedido(),

                clientId:
                    clientId,

                items:
                    `${quantidade}x ${produto.nome}`,

                value:
                    valorTotal,

                status:
                    statusInput.value,

                origin:
                    "Manual",

                date:
                    new Date()
                        .toISOString(),

                productId:
                    produto.id,

                quantity:
                    quantidade

            });


            produto.estoque =
                novoEstoque;


            salvarSistema(
                sistema
            );


            limparFormulario();

            fecharModal();

            render();


            await carregarProdutos();


            mostrarToast(
                "Pedido criado."
            );

        }
    );


// ==========================================
// SIMULAR PEDIDO AUTOMÁTICO
// ==========================================

const simulateBtn =
    document.getElementById("simulateBtn");


if (simulateBtn) {

    simulateBtn.addEventListener(
        "click",
        async function () {

            // Produtos que ainda possuem estoque
            const disponiveis =
                produtos.filter(
                    produto =>
                        Number(produto.estoque) > 0
                );


            if (!disponiveis.length) {

                mostrarToast(
                    "Nenhum produto possui estoque."
                );

                return;
            }


            // Escolhe um produto aleatório
            const produto =
                disponiveis[
                    Math.floor(
                        Math.random() *
                        disponiveis.length
                    )
                ];


            // Quantidade aleatória de 1 até 3,
            // respeitando o estoque disponível
            const quantidadeMaxima =
                Math.min(
                    3,
                    Number(produto.estoque)
                );


            const quantidade =
                Math.floor(
                    Math.random() *
                    quantidadeMaxima
                ) + 1;


            // Cliente automático
            const clientesAutomaticos = [

                {
                    name: "Marcos Lima",
                    phone: "(31) 99999-1111",
                    email: "marcos@email.com"
                },

                {
                    name: "Larissa Melo",
                    phone: "(31) 99999-2222",
                    email: "larissa@email.com"
                },

                {
                    name: "Carlos Souza",
                    phone: "(31) 99999-3333",
                    email: "carlos@email.com"
                }

            ];


            const clienteAutomatico =
                clientesAutomaticos[
                    Math.floor(
                        Math.random() *
                        clientesAutomaticos.length
                    )
                ];


            // Procura se esse cliente já existe
            let cliente =
                sistema.clients.find(
                    item =>
                        item.email ===
                        clienteAutomatico.email
                );


            // Se não existir, cria
            if (!cliente) {

                cliente = {

                    id:
                        Date.now(),

                    name:
                        clienteAutomatico.name,

                    phone:
                        clienteAutomatico.phone,

                    email:
                        clienteAutomatico.email

                };


                sistema.clients.push(
                    cliente
                );
            }


            const novoEstoque =
                Number(produto.estoque) -
                quantidade;


            // Atualiza estoque no Supabase
            const { error } =
                await supabaseClient
                    .from("produtos")
                    .update({
                        estoque:
                            novoEstoque
                    })
                    .eq(
                        "id",
                        produto.id
                    );


            if (error) {

                console.error(
                    "Erro ao atualizar estoque:",
                    error
                );


                mostrarToast(
                    "Erro ao atualizar estoque."
                );

                return;
            }


            const valorTotal =
                Number(produto.preco) *
                quantidade;


            // Cria o pedido automático
            sistema.orders.push({

                id:
                    gerarProximoIdPedido(),

                clientId:
                    cliente.id,

                items:
                    `${quantidade}x ${produto.nome}`,

                value:
                    valorTotal,

                status:
                    "Novo",

                origin:
                    "Automático",

                date:
                    new Date()
                        .toISOString(),

                productId:
                    produto.id,

                quantity:
                    quantidade

            });


            salvarSistema(
                sistema
            );


            produto.estoque =
                novoEstoque;


            render();


            await carregarProdutos();


            mostrarToast(
                `Pedido automático: ${quantidade}x ${produto.nome}`
            );

        }
    );
}

// ==========================================
// EVENTOS
// ==========================================

categorySelect.addEventListener(
    "change",
    preencherProdutosCategoria
);


productSelect.addEventListener(
    "change",
    calcularTotal
);


quantityInput.addEventListener(
    "input",
    calcularTotal
);


search.addEventListener(
    "input",
    render
);


statusFilter.addEventListener(
    "change",
    render
);


originFilter.addEventListener(
    "change",
    render
);


// ==========================================
// INICIALIZAÇÃO
// ==========================================

preencherClientes();

render();

carregarProdutos();