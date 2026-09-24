const sistema = sistemaAtual();

const pedidos = sistema.orders || [];

const entregues = pedidos.filter(pedido => pedido.status === "Entregue");

// ==========================================
// DATA ATUAL
// ==========================================

const hoje = new Date();
const mesAtual = hoje.getMonth();
const anoAtual = hoje.getFullYear();
let mesAnterior = mesAtual - 1;
let anoAnterior = anoAtual;

if (mesAnterior < 0) {
    mesAnterior = 11;
    anoAnterior--;
}

// ==========================================
// TOTAL DE VENDAS POR MÊS
// ==========================================

function totalMes(mes, ano) {

    return entregues
        .filter(pedido => {

            const dataPedido =
                new Date(pedido.date);

            return (
                dataPedido.getMonth() === mes &&
                dataPedido.getFullYear() === ano
            );
        })
        .reduce((total, pedido) => {

            return (
                total +
                Number(pedido.value)
            );

        }, 0);
}

// ==========================================
// CARDS DOS RELATÓRIOS
// ==========================================

const vendasMesAtual =
    totalMes(
        mesAtual,
        anoAtual
    );


const vendasMesAnterior =
    totalMes(
        mesAnterior,
        anoAnterior
    );


const ticketMedio =
    entregues.length
        ? entregues.reduce(
            (total, pedido) => {
                return (
                    total +
                    Number(pedido.value)
                );
            },
            0
        ) / entregues.length
        : 0;


document
    .getElementById("salesCurrent")
    .textContent =
        dinheiro(vendasMesAtual);


document
    .getElementById("salesPrevious")
    .textContent =
        dinheiro(vendasMesAnterior);


document
    .getElementById("deliveredOrders")
    .textContent =
        entregues.length;


document
    .getElementById("averageTicket")
    .textContent =
        dinheiro(ticketMedio);

// ==========================================
// ÚLTIMOS 6 MESES
// ==========================================

const meses = [];


for (let i = 5; i >= 0; i--) {

    const data =
        new Date(
            anoAtual,
            mesAtual - i,
            1
        );


    meses.push({
        mes:
            data.getMonth(),

        ano:
            data.getFullYear(),

        label:
            data
                .toLocaleDateString(
                    "pt-BR",
                    {
                        month: "short"
                    }
                )
                .replace(".", "")
    });

}

const vendas =
    meses.map(mes => {

        return totalMes(
            mes.mes,
            mes.ano
        );

    });

// ==========================================
// CONFIGURAÇÃO DO CANVAS
// ==========================================

function canvasSetup(id) {

    const canvas =
        document.getElementById(id);

    const container =
        canvas.parentElement;

    const escala =
        window.devicePixelRatio || 1;

    const largura =
        container.clientWidth;

    const altura =
        container.clientHeight;


    canvas.width =
        largura * escala;

    canvas.height =
        altura * escala;


    canvas.style.width =
        largura + "px";

    canvas.style.height =
        altura + "px";


    const ctx =
        canvas.getContext("2d");


    ctx.scale(
        escala,
        escala
    );


    return {
        ctx,
        w: largura,
        h: altura
    };
}

// ==========================================
// GRÁFICO DE VENDAS
// ==========================================

function desenharVendas() {

    const {
        ctx,
        w,
        h
    } = canvasSetup(
        "salesChart"
    );


    ctx.clearRect(
        0,
        0,
        w,
        h
    );


    const padding = {
        l: 45,
        r: 15,
        t: 15,
        b: 35
    };


    const maiorValor =
        Math.max(
            ...vendas,
            100
        );


    const larguraGrafico =
        w -
        padding.l -
        padding.r;


    const alturaGrafico =
        h -
        padding.t -
        padding.b;


    const estilos =
        getComputedStyle(
            document.body
        );


    const corTexto =
        estilos.getPropertyValue(
            "--muted"
        );


    const corLinha =
        estilos.getPropertyValue(
            "--line"
        );


    ctx.font =
        "11px system-ui";

    ctx.fillStyle =
        corTexto;

    ctx.strokeStyle =
        corLinha;


    // Linhas horizontais
    for (let i = 0; i <= 4; i++) {

        const y =
            padding.t +
            alturaGrafico *
            i /
            4;


        ctx.beginPath();

        ctx.moveTo(
            padding.l,
            y
        );

        ctx.lineTo(
            w - padding.r,
            y
        );

        ctx.stroke();


        const valor =
            maiorValor *
            (4 - i) /
            4;


        ctx.fillText(
            dinheiro(valor)
                .replace(",00", ""),
            2,
            y + 4
        );
    }

    // Cor principal

    const corPrincipal =
        estilos
            .getPropertyValue(
                "--primary"
            )
            .trim();

    // Linha do gráfico

    ctx.strokeStyle =
        corPrincipal;

    ctx.lineWidth =
        3;

    ctx.beginPath();


    vendas.forEach(
        (valor, indice) => {

            const x =
                padding.l +
                larguraGrafico *
                (
                    indice /
                    (
                        vendas.length - 1 ||
                        1
                    )
                );


            const y =
                padding.t +
                alturaGrafico -
                (
                    valor /
                    maiorValor
                ) *
                alturaGrafico;


            if (indice === 0) {

                ctx.moveTo(
                    x,
                    y
                );

            } else {

                ctx.lineTo(
                    x,
                    y
                );

            }

        }
    );


    ctx.stroke();

    // Pontos e nomes dos meses

    vendas.forEach(
        (valor, indice) => {

            const x =
                padding.l +
                larguraGrafico *
                (
                    indice /
                    (
                        vendas.length - 1 ||
                        1
                    )
                );


            const y =
                padding.t +
                alturaGrafico -
                (
                    valor /
                    maiorValor
                ) *
                alturaGrafico;


            ctx.fillStyle =
                corPrincipal;


            ctx.beginPath();

            ctx.arc(
                x,
                y,
                4,
                0,
                Math.PI * 2
            );

            ctx.fill();


            ctx.fillStyle =
                corTexto;


            ctx.fillText(
                meses[indice].label,
                x - 12,
                h - 10
            );

        }
    );
}

// ==========================================
// GRÁFICO DE STATUS
// ==========================================

function desenharStatus() {

    const {
        ctx,
        w,
        h
    } = canvasSetup(
        "statusChart"
    );


    const statusPedidos = [
        "Novo",
        "Em preparo",
        "Pronto",
        "Entregue",
        "Cancelado"
    ];


    const dados =
        statusPedidos.map(status => {

            return pedidos.filter(
                pedido =>
                    pedido.status === status
            ).length;

        });


    const somaPedidos =
        dados.reduce(
            (total, quantidade) => {

                return (
                    total +
                    quantidade
                );

            },
            0
        );


    const total =
        Math.max(
            somaPedidos,
            1
        );


    const cores = [
        "#4c5ab2",
        "#d4a62a",
        "#2f9e72",
        "#58b58e",
        "#d84b4b"
    ];


    let anguloInicial =
        -Math.PI / 2;


    dados.forEach(
        (quantidade, indice) => {

            const angulo =
                (
                    quantidade /
                    total
                ) *
                Math.PI *
                2;


            ctx.beginPath();

            ctx.moveTo(
                w / 2,
                h / 2
            );


            ctx.arc(
                w / 2,
                h / 2,
                Math.min(w, h) * 0.32,
                anguloInicial,
                anguloInicial + angulo
            );


            ctx.closePath();


            ctx.fillStyle =
                cores[indice];


            ctx.fill();


            anguloInicial +=
                angulo;

        }
    );

    // Buraco central do gráfico

    ctx.beginPath();

    ctx.arc(
        w / 2,
        h / 2,
        Math.min(w, h) * 0.18,
        0,
        Math.PI * 2
    );


    const estilos =
        getComputedStyle(
            document.body
        );


    ctx.fillStyle =
        estilos.getPropertyValue(
            "--card"
        );


    ctx.fill();


    // Total no centro
    ctx.textAlign =
        "center";


    ctx.fillStyle =
        estilos.getPropertyValue(
            "--text"
        );


    ctx.font =
        "700 20px system-ui";


    ctx.fillText(
        total,
        w / 2,
        h / 2 + 5
    );


    ctx.font =
        "10px system-ui";


    ctx.fillStyle =
        estilos.getPropertyValue(
            "--muted"
        );


    ctx.fillText(
        "pedidos",
        w / 2,
        h / 2 + 21
    );
}

// ==========================================
// LISTA DE STATUS
// ==========================================

const statusBox =
    document.getElementById(
        "statusList"
    );


const statusPedidos = [
    "Novo",
    "Em preparo",
    "Pronto",
    "Entregue",
    "Cancelado"
];


statusBox.innerHTML =
    statusPedidos
        .map(status => {

            const quantidade =
                pedidos.filter(
                    pedido =>
                        pedido.status === status
                ).length;


            return `
                <div class="status-row">

                    <span>
                        ${status}
                    </span>

                    <b>
                        ${quantidade}
                    </b>

                </div>
            `;

        })
        .join("");

// ==========================================
// TABELA MENSAL
// ==========================================

const mesesTabela =
    [...meses].reverse();


document
    .getElementById(
        "monthlyBody"
    )
    .innerHTML =
        mesesTabela
            .map(mes => {

                const pedidosMes =
                    entregues.filter(
                        pedido => {

                            const data =
                                new Date(
                                    pedido.date
                                );


                            return (
                                data.getMonth() === mes.mes &&
                                data.getFullYear() === mes.ano
                            );

                        }
                    );


                const totalVendas =
                    pedidosMes.reduce(
                        (total, pedido) => {

                            return (
                                total +
                                Number(
                                    pedido.value
                                )
                            );

                        },
                        0
                    );


                const nomeMes =
                    new Date(
                        mes.ano,
                        mes.mes,
                        1
                    )
                        .toLocaleDateString(
                            "pt-BR",
                            {
                                month: "long",
                                year: "numeric"
                            }
                        );


                return `
                    <tr>

                        <td>
                            ${nomeMes}
                        </td>

                        <td>
                            ${pedidosMes.length}
                        </td>

                        <td>
                            ${dinheiro(totalVendas)}
                        </td>

                    </tr>
                `;

            })
            .join("");

// ==========================================
// DESENHAR GRÁFICOS
// ==========================================

function desenhar() {

    desenharVendas();

    desenharStatus();
}


desenhar();

// ==========================================
// REDESENHAR AO ALTERAR TAMANHO
// ==========================================

window.addEventListener(
    "resize",
    function () {

        clearTimeout(
            window.__rt
        );


        window.__rt =
            setTimeout(
                desenhar,
                120
            );

    }
);

// ==========================================
// REDESENHAR AO TROCAR O TEMA
// ==========================================

document
    .getElementById("themeQuick")
    .addEventListener(
        "click",
        function () {

            setTimeout(
                desenhar,
                30
            );

        }
    );