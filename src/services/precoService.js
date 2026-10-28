// Todos os multiplicadores ficam aqui, em um único lugar
const MULTIPLICADORES = {
  tipoIngresso: { INTEIRA: 1, MEIA: 0.5 },
  tipoSala: { PADRAO: 1, VIP: 1.5 },
  tipoCliente: { PADRAO: 1, ESTUDANTE: 1, IDOSO: 1, VIP: 0.95, CINEFILO: 0.9 },
};

const MEIA_PERMITIDA_PARA = ['ESTUDANTE', 'IDOSO'];

// Calcula o preço de um ingresso, dado a sessão, sala, cliente e tipo de ingresso
function calcularPreco(sessao, sala, cliente, tipoIngresso) {
  const m = MULTIPLICADORES;
  const preco =
    Number(sessao.precoBase) *
    m.tipoIngresso[tipoIngresso] *
    m.tipoSala[sala.tipo] *
    m.tipoCliente[cliente.tipo];
  return Math.round(preco * 100) / 100;
}

module.exports = { calcularPreco, MEIA_PERMITIDA_PARA };
