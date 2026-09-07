// Referências do DOM
const modalToggle = document.getElementById('modal-toggle');
const formNovoLancamento = document.getElementById('form-novo-lancamento');
const inputDescricao = document.getElementById('descricao');
const inputValor = document.getElementById('valor');
const selectCategoria = document.getElementById('categoria');
const radioReceita = document.getElementById('tipo-receita');
const radioDespesa = document.getElementById('tipo-despesa');
const btnSalvar = document.getElementById('btn-salvar-lancamento');

const listaLancamentos = document.getElementById('lista-lancamentos');
const listaCategoriasSidebar = document.getElementById('lista-categorias-sidebar');
const listaChipsFiltro = document.getElementById('lista-chips-filtro');

// Tipos previsíveis de lançamento
const TIPOS = Object.freeze({
  RECEITA: 'income',
  DESPESA: 'expense',
});

// Armazenamento dos lançamentos
const lancamentos = [];

function criarLancamento(descricao, valor, tipo, categoria) {
  return {
    id: crypto.randomUUID(),
    description: descricao,
    amount: Number(valor),
    type: tipo,
    category: categoria,
  };
}