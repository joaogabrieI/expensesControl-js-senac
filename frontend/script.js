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

function formatarMoeda(valor) {
  return valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

function formatarData(data) {
  return data.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' });
}

const CATEGORIA_CORES = {
  'Alimentação': '#F5C542',
  'Transporte': '#5CC8FF',
  'Salário': '#29E58C',
  'Lazer': '#C792EA',
  'Moradia': '#FF8A5C',
  'Saúde': '#6EE7E0',
  'Outros': '#8B928C',
};

function renderizarLancamentos() {
  const cabecalho = document.getElementById('lista-lancamentos-cabecalho');
  const linhasExistentes = listaLancamentos.querySelectorAll('.row');
  linhasExistentes.forEach((linha) => linha.remove());

  if (lancamentos.length === 0) {
    cabecalho.classList.add('hidden');
    return;
  }

  cabecalho.classList.remove('hidden');

  lancamentos.forEach((lancamento, index) => {
    const cor = CATEGORIA_CORES[lancamento.category] || '#8B928C';
    const ehUltimo = index === lancamentos.length - 1;
    const ehReceita = lancamento.type === TIPOS.RECEITA;
    const sinal = ehReceita ? '+' : '−';
    const corValor = ehReceita ? 'var(--positive)' : 'var(--negative)';
    const borda = ehUltimo ? '' : 'border-bottom: 1px solid var(--border);';

    const div = document.createElement('div');
    div.className = 'row grid grid-cols-[1fr_auto_auto_auto] items-center gap-4 px-5 py-3.5 hover:bg-[var(--surface-hover)]';
    div.style.cssText = borda;
    div.dataset.id = lancamento.id;

    div.innerHTML = `
      <div class="flex items-center gap-3 min-w-0">
        <span class="w-2.5 h-2.5 rounded-full cat-dot shrink-0" style="background:${cor};"></span>
        <div class="min-w-0">
          <p class="font-medium truncate">${lancamento.description}</p>
          <p class="text-sm text-[var(--text-muted)]">${lancamento.category}</p>
        </div>
      </div>
      <span class="hidden sm:block w-24 text-right text-sm text-[var(--text-muted)]">${formatarData(new Date())}</span>
      <span class="w-32 text-right font-display font-semibold" style="color: ${corValor};">${sinal} ${formatarMoeda(lancamento.amount)}</span>
      <button class="row-actions w-8 h-8 flex items-center justify-center rounded-full hover:bg-[var(--border)] text-[var(--text-muted)] hover:text-[var(--negative)] justify-self-end">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
      </button>
    `;

    listaLancamentos.appendChild(div);
  });
}

function limparFormulario() {
  inputDescricao.value = '';
  inputValor.value = '';
  selectCategoria.selectedIndex = 0;
  radioReceita.checked = true;
}

function adicionarLancamento(evento) {
  evento.preventDefault();

  const descricao = inputDescricao.value.trim();
  const valor = Number(inputValor.value.replace(',', '.'));
  const tipo = radioReceita.checked ? TIPOS.RECEITA : TIPOS.DESPESA;
  const categoria = selectCategoria.value;

  if (!descricao) {
    inputDescricao.focus();
    return;
  }

  if (!valor || valor <= 0) {
    inputValor.focus();
    return;
  }

  if (!categoria) {
    selectCategoria.focus();
    return;
  }

  const lancamento = criarLancamento(descricao, valor, tipo, categoria);
  lancamentos.push(lancamento);

  limparFormulario();
  renderizarLancamentos();

  modalToggle.checked = false;
}

formNovoLancamento.addEventListener('submit', adicionarLancamento);