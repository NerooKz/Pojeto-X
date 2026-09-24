let produtoEditandoId = null;

// ==========================================
// ELEMENTOS DA PÁGINA
// ==========================================

const body = document.getElementById("productsBody");
const modal = document.getElementById("productModal");
const botaoNovo = document.getElementById("newProductBtn");
const botaoSalvar = document.getElementById("saveProduct");
const tituloModal = document.getElementById("productModalTitle");

// ==========================================
// CARREGAR PRODUTOS DO SUPABASE
// ==========================================

async function carregarProdutos() {
    const {data: sessao} = await supabaseClient.auth.getSession();

    if (!sessao.session) {
        window.location.href = "login.html";

        return;
    }

    const {data, error} = await supabaseClient.from("produtos").select("*").order("id",{ascending: false});

    if (error) {
        console.error("Erro ao carregar produtos:", error);
        mostrarToast("Erro ao carregar produtos.");
        
        return;
    }

    renderizarProdutos(data || []);
}

// ==========================================
// MOSTRAR PRODUTOS NA TABELA
// ==========================================

function renderizarProdutos(produtos) {
    if (!produtos.length) {
        body.innerHTML = `<tr><td colspan="5" class="empty">Nenhum produto cadastrado.</td></tr>`;

        return;
    }

    body.innerHTML = produtos.map(produto => {
        const semEstoque = Number(produto.estoque) <= 0; 
        
        return `
                    <tr>
                        <td>
                            <b>
                                ${produto.nome}
                            </b>
                        </td>
                        <td>
                            ${produto.categoria || "—"}
                        </td>
                        <td>
                            ${dinheiro(produto.preco)}
                        </td>
                        <td>
                            ${
                                semEstoque
                                    ? `
                                        <span class="status cancelado">
                                            Sem estoque
                                        </span>
                                    `
                                    : produto.estoque
                            }
                        </td>

                        <td>

                            <div class="actions">

                                <button
                                    class="small"
                                    onclick="editarProduto(${produto.id})"
                                >
                                    Editar
                                </button>

                                <button
                                    class="small red"
                                    onclick="excluirProduto(${produto.id})"
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
// ABRIR MODAL NOVO PRODUTO
// ==========================================

function abrirModal() {

    produtoEditandoId =
        null;


    limparFormulario();


    if (tituloModal) {

        tituloModal.textContent =
            "Novo produto";

    }


    botaoSalvar.textContent =
        "Salvar produto";


    modal.classList.add(
        "show"
    );
}


// ==========================================
// FECHAR MODAL
// ==========================================

function fecharModal() {

    modal.classList.remove(
        "show"
    );


    produtoEditandoId =
        null;


    limparFormulario();


    if (tituloModal) {

        tituloModal.textContent =
            "Novo produto";

    }


    botaoSalvar.textContent =
        "Salvar produto";
}


// ==========================================
// LIMPAR FORMULÁRIO
// ==========================================

function limparFormulario() {

    document
        .getElementById(
            "produtoNome"
        )
        .value = "";


    document
        .getElementById(
            "produtoCategoria"
        )
        .value = "";


    document
        .getElementById(
            "produtoPreco"
        )
        .value = "";


    document
        .getElementById(
            "produtoEstoque"
        )
        .value = "";
}


// ==========================================
// EDITAR PRODUTO
// ==========================================

window.editarProduto =
    async function (id) {

        const {
            data,
            error
        } = await supabaseClient
            .from("produtos")
            .select("*")
            .eq(
                "id",
                id
            )
            .single();


        if (error) {

            console.error(
                "Erro ao carregar produto:",
                error
            );

            mostrarToast(
                "Erro ao carregar produto."
            );

            return;
        }


        produtoEditandoId =
            data.id;


        document
            .getElementById(
                "produtoNome"
            )
            .value =
            data.nome;


        document
            .getElementById(
                "produtoCategoria"
            )
            .value =
            data.categoria || "";


        document
            .getElementById(
                "produtoPreco"
            )
            .value =
            data.preco;


        document
            .getElementById(
                "produtoEstoque"
            )
            .value =
            data.estoque;


        if (tituloModal) {

            tituloModal.textContent =
                "Editar produto";

        }


        botaoSalvar.textContent =
            "Salvar alterações";


        modal.classList.add(
            "show"
        );
    };


// ==========================================
// CADASTRAR / EDITAR PRODUTO
// ==========================================

botaoSalvar.addEventListener(
    "click",
    async function () {

        const nome =
            document
                .getElementById(
                    "produtoNome"
                )
                .value
                .trim();


        const categoria =
            document
                .getElementById(
                    "produtoCategoria"
                )
                .value
                .trim();


        const preco =
            Number(
                document
                    .getElementById(
                        "produtoPreco"
                    )
                    .value
            );


        const estoque =
            Number(
                document
                    .getElementById(
                        "produtoEstoque"
                    )
                    .value
            );


        // ==================================
        // VALIDAÇÕES
        // ==================================

        if (!nome) {
            mostrarToast("Informe o nome do produto.");

            return;
        }

        if (Number.isNaN(preco) ||preco <= 0) {
            mostrarToast("Informe um preço válido.");

            return;
        }


        if (
            Number.isNaN(estoque) ||
            estoque < 0
        ) {

            mostrarToast(
                "Informe um estoque válido."
            );

            return;
        }


        let error;


        // ==================================
        // EDITAR PRODUTO
        // ==================================

        if (produtoEditandoId) {

            const resultado =
                await supabaseClient
                    .from("produtos")
                    .update({
                        nome:
                            nome,

                        categoria:
                            categoria,

                        preco:
                            preco,

                        estoque:
                            estoque
                    })
                    .eq(
                        "id",
                        produtoEditandoId
                    );


            error =
                resultado.error;

        }

        // ==================================
        // CADASTRAR NOVO PRODUTO
        // ==================================

        else {
            const resultado = await supabaseClient.from("produtos")
            .insert ({
                nome: nome,
                categoria: categoria,
                preco: preco,
                estoque: estoque,
                ativo: true
            });

            error = resultado.error;
        }

        if (error) {

            console.error(
                "Erro ao salvar produto:",
                error
            );

            mostrarToast(
                "Erro ao salvar produto."
            );

            return;
        }

        const mensagem = produtoEditandoId ? "Produto atualizado.": "Produto cadastrado.";

        produtoEditandoId = null;

        limparFormulario();
        fecharModal();
        await carregarProdutos();

        mostrarToast(mensagem);
    }
);

// ==========================================
// EXCLUIR PRODUTO
// ==========================================

window.excluirProduto =
    async function (id) {

        const confirmou =
            confirm(
                "Deseja excluir este produto?"
            );


        if (!confirmou) {
            return;
        }


        const {
            error
        } = await supabaseClient
            .from("produtos")
            .delete()
            .eq(
                "id",
                id
            );


        if (error) {

            console.error(
                "Erro ao excluir produto:",
                error
            );

            mostrarToast(
                "Erro ao excluir produto."
            );

            return;
        }


        await carregarProdutos();


        mostrarToast(
            "Produto excluído."
        );

    };


// ==========================================
// EVENTOS DO MODAL
// ==========================================

botaoNovo.addEventListener(
    "click",
    abrirModal
);


document
    .querySelectorAll(
        '[data-close="productModal"]'
    )
    .forEach(botao => {

        botao.addEventListener(
            "click",
            fecharModal
        );

    });


modal.addEventListener(
    "click",
    function (event) {

        if (
            event.target === modal
        ) {

            fecharModal();

        }

    }
);


// ==========================================
// INICIALIZAÇÃO
// ==========================================

carregarProdutos();