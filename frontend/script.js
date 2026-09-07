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
const cabecalhoListaLancamentos = document.getElementById('lista-lancamentos-cabecalho');
const listaCategoriasSidebar = document.getElementById('lista-categorias-sidebar');
const listaChipsFiltro = document.getElementById('lista-chips-filtro');
const modalConfirmarRemocao = document.getElementById('modal-confirmar-remocao');
const modalConfirmarRemocaoOverlay = document.getElementById('modal-confirmar-remocao-overlay');
const formConfirmarRemocao = document.getElementById('form-confirmar-remocao');
const btnCancelarRemocao = document.getElementById('btn-cancelar-remocao');
const textoLancamentoRemover = document.getElementById('texto-lancamento-remover');
const resumoSaldo = document.getElementById('resumo-saldo');
const resumoTotalReceitas = document.getElementById('resumo-total-receitas');
const resumoTotalDespesas = document.getElementById('resumo-total-despesas');
const resumoTotalSaldo = document.getElementById('resumo-total-saldo');

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

const CHAVE_ESTADO = 'lancamentos';

let filtroTipo = 'todos';
let filtroCategoria = null;
let idParaRemover = null;

function obterLancamentosFiltrados() {
  return lancamentos.filter((lancamento) => {
    const tipoCorresponde = filtroTipo === 'todos' || lancamento.type === filtroTipo;
    const categoriaCorresponde = !filtroCategoria || lancamento.category === filtroCategoria;
    return tipoCorresponde && categoriaCorresponde;
  });
}

function criarChipsCategorias() {
  Object.keys(CATEGORIA_CORES).forEach((categoria) => {
    const botao = document.createElement('button');
    botao.type = 'button';
    botao.className = 'chip-filtro px-4 py-1.5 rounded-full text-sm font-medium border';
    botao.style.cssText = 'border-color: var(--border); color: var(--text-muted);';
    botao.dataset.filtroCategoria = categoria;
    botao.textContent = categoria;
    listaChipsFiltro.appendChild(botao);
  });
}

function atualizarEstilosChips() {
  listaChipsFiltro.querySelectorAll('.chip-filtro').forEach((chip) => {
    const ehAtivo =
      (chip.dataset.filtroTipo && chip.dataset.filtroTipo === filtroTipo) ||
      (chip.dataset.filtroCategoria && chip.dataset.filtroCategoria === filtroCategoria);

    if (ehAtivo) {
      chip.style.background = 'var(--text)';
      chip.style.color = 'var(--bg)';
      chip.style.borderColor = 'transparent';
    } else {
      chip.style.background = 'transparent';
      chip.style.color = 'var(--text-muted)';
      chip.style.borderColor = 'var(--border)';
    }
  });
}

function abrirConfirmacaoRemocao(id) {
  const lancamento = lancamentos.find((item) => item.id === id);
  if (!lancamento) return;

  idParaRemover = id;
  textoLancamentoRemover.textContent = `"${lancamento.description}"`;
  modalConfirmarRemocao.classList.remove('hidden');
}

function fecharConfirmacaoRemocao() {
  idParaRemover = null;
  modalConfirmarRemocao.classList.add('hidden');
}

function salvarEstado() {
  localStorage.setItem(CHAVE_ESTADO, JSON.stringify(lancamentos));
}

function atualizarResumo() {
  const totalReceitas = lancamentos
    .filter((lancamento) => lancamento.type === TIPOS.RECEITA)
    .reduce((soma, lancamento) => soma + lancamento.amount, 0);
  const totalDespesas = lancamentos
    .filter((lancamento) => lancamento.type === TIPOS.DESPESA)
    .reduce((soma, lancamento) => soma + lancamento.amount, 0);
  const saldo = totalReceitas - totalDespesas;

  resumoSaldo.textContent = formatarMoeda(saldo);
  resumoTotalReceitas.textContent = formatarMoeda(totalReceitas);
  resumoTotalDespesas.textContent = formatarMoeda(totalDespesas);
  resumoTotalSaldo.textContent = formatarMoeda(saldo);
}

function removerLancamento(id) {
  const indice = lancamentos.findIndex((lancamento) => lancamento.id === id);
  if (indice === -1) return;

  lancamentos.splice(indice, 1);
  renderizarLancamentos();
  atualizarResumo();
  salvarEstado();
}

function renderizarLancamentos() {
  const linhasExistentes = listaLancamentos.querySelectorAll('.row');
  linhasExistentes.forEach((linha) => linha.remove());

  const lancamentosFiltrados = obterLancamentosFiltrados();

  if (lancamentosFiltrados.length === 0) {
    cabecalhoListaLancamentos.classList.add('hidden');
    return;
  }

  cabecalhoListaLancamentos.classList.remove('hidden');

  lancamentosFiltrados.forEach((lancamento, index) => {
    const cor = CATEGORIA_CORES[lancamento.category] || '#8B928C';
    const ehUltimo = index === lancamentosFiltrados.length - 1;
    const ehReceita = lancamento.type === TIPOS.RECEITA;
    const sinal = ehReceita ? '+' : '−';
    const corValor = ehReceita ? 'var(--positive)' : 'var(--negative)';
    const rotuloTipo = ehReceita ? 'Receita' : 'Despesa';
    const corTipo = ehReceita ? 'var(--positive)' : 'var(--negative)';
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
          <div class="flex items-center gap-2">
            <span class="text-sm text-[var(--text-muted)]">${lancamento.category}</span>
            <span class="text-xs font-semibold px-1.5 py-0.5 rounded" style="color: ${corTipo}; background: ${ehReceita ? 'var(--positive-dim)' : 'var(--negative-dim)'};">${rotuloTipo}</span>
          </div>
        </div>
      </div>
      <span class="hidden sm:block w-24 text-right text-sm text-[var(--text-muted)]">${formatarData(new Date())}</span>
      <span class="w-32 text-right font-display font-semibold" style="color: ${corValor};">${sinal} ${formatarMoeda(lancamento.amount)}</span>
      <button class="row-actions w-8 h-8 flex items-center justify-center rounded-full hover:bg-[var(--border)] text-[var(--text-muted)] hover:text-[var(--negative)] justify-self-end btn-remover">
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
  atualizarResumo();

  modalToggle.checked = false;
}

formNovoLancamento.addEventListener('submit', adicionarLancamento);

btnSalvar.addEventListener('click', adicionarLancamento);

listaLancamentos.addEventListener('click', (evento) => {
  const botao = evento.target.closest('.btn-remover');
  if (!botao) return;

  const linha = botao.closest('.row');
  abrirConfirmacaoRemocao(linha.dataset.id);
});

formConfirmarRemocao.addEventListener('submit', (evento) => {
  evento.preventDefault();
  if (idParaRemover) {
    removerLancamento(idParaRemover);
  }
  fecharConfirmacaoRemocao();
});

btnCancelarRemocao.addEventListener('click', fecharConfirmacaoRemocao);

modalConfirmarRemocaoOverlay.addEventListener('click', fecharConfirmacaoRemocao);

listaChipsFiltro.addEventListener('click', (evento) => {
  const chip = evento.target.closest('.chip-filtro');
  if (!chip) return;

  if (chip.dataset.filtroTipo) {
    filtroTipo = chip.dataset.filtroTipo;
    filtroCategoria = null;
  } else if (chip.dataset.filtroCategoria) {
    filtroCategoria = chip.dataset.filtroCategoria;
    filtroTipo = 'todos';
  }

  renderizarLancamentos();
  atualizarEstilosChips();
});

criarChipsCategorias();
renderizarLancamentos();
atualizarResumo();
atualizarEstilosChips();