const sistema = sistemaAtual();

const pedidos = sistema.orders || [];
const clientes = sistema.clients || [];

// ==========================================
// CARDS DO DASHBOARD
// ==========================================

const pedidosNovos = pedidos.filter(
    pedido => pedido.status === "Novo"
).length;

const pedidosEmPreparo = pedidos.filter(
    pedido => pedido.status === "Em preparo"
).length;

const pedidosProntos = pedidos.filter(
    pedido => pedido.status === "Pronto"
).length;


document.getElementById("sNew").textContent =
    pedidosNovos;

document.getElementById("sPrep").textContent =
    pedidosEmPreparo;

document.getElementById("sReady").textContent =
    pedidosProntos;

document.getElementById("sClients").textContent =
    clientes.length;

// ==========================================
// PEDIDOS RECENTES
// ==========================================

const recentes = [...pedidos]
    .sort((a, b) => {
        return new Date(b.date) - new Date(a.date);
    })
    .slice(0, 6);

// ==========================================
// TABELA DO DASHBOARD
// ==========================================

const body =
    document.getElementById("dashBody");

if (!recentes.length) {

    body.innerHTML = `
        <tr>
            <td colspan="5" class="empty">
                Nenhum pedido cadastrado.
            </td>
        </tr>
    `;

} else {

    body.innerHTML = recentes
        .map(pedido => {

            const cliente = clientes.find(
                item => item.id === pedido.clientId
            );

            const nomeCliente =
                cliente?.name ||
                pedido.clientName ||
                "Cliente removido";

            return `
                <tr>

                    <td class="order-id">
                        #${pedido.id}
                    </td>

                    <td>
                        ${nomeCliente}
                    </td>

                    <td>
                        ${dinheiro(pedido.value)}
                    </td>

                    <td>
                        ${pedido.origin}
                    </td>

                    <td>
                        <span class="status ${classeStatus(pedido.status)}">
                            ${pedido.status}
                        </span>
                    </td>

                </tr>
            `;
        })
        .join("");
}