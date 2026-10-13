// Referências do DOM
const modalToggle = document.getElementById('modal-toggle');
const formNovoLancamento = document.getElementById('form-novo-lancamento');
const inputDescricao = document.getElementById('descricao');
const inputValor = document.getElementById('valor');
const inputData = document.getElementById('data');
const selectCategoria = document.getElementById('categoria');
const radioReceita = document.getElementById('tipo-receita');
const radioDespesa = document.getElementById('tipo-despesa');
const btnSalvar = document.getElementById('btn-salvar-lancamento');
const erroFormulario = document.getElementById('erro-formulario');

const listaLancamentos = document.getElementById('lista-lancamentos');
const cabecalhoListaLancamentos = document.getElementById('lista-lancamentos-cabecalho');
const listaLancamentosVazia = document.getElementById('lista-lancamentos-vazia');
const listaLancamentosVaziaTitulo = document.getElementById('lista-lancamentos-vazia-titulo');
const listaLancamentosVaziaTexto = document.getElementById('lista-lancamentos-vazia-texto');
const listaCategoriasSidebar = document.getElementById('lista-categorias-sidebar');
const listaChipsFiltro = document.getElementById('lista-chips-filtro');
const navVisualizar = document.getElementById('nav-visualizar');
const contadorTodos = document.getElementById('contador-todos');
const contadorReceitas = document.getElementById('contador-receitas');
const contadorDespesas = document.getElementById('contador-despesas');
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

function criarLancamento(descricao, valor, tipo, categoria, data) {
  return {
    id: crypto.randomUUID(),
    description: descricao,
    amount: Number(valor),
    type: tipo,
    category: categoria,
    date: data,
  };
}

function formatarMoeda(valor) {
  return valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

// Recebe a data no formato "AAAA-MM-DD" (valor do input date)
function formatarData(dataIso) {
  if (!dataIso) return '—';
  // Monta a data no fuso local; new Date('AAAA-MM-DD') seria interpretado em UTC
  const [ano, mes, dia] = dataIso.split('-').map(Number);
  return new Date(ano, mes - 1, dia).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' });
}

// Converte o texto digitado em número, aceitando o formato brasileiro
// Ex.: "1.234,56" → 1234.56 | "150,90" → 150.9 | "1.500" → 1500 | "12.5" → 12.5
function converterValor(texto) {
  const valor = texto.trim();

  // Com vírgula, os pontos são separadores de milhar
  if (valor.includes(',')) {
    return Number(valor.replace(/\./g, '').replace(',', '.'));
  }

  // Sem vírgula, o ponto só é milhar se vier seguido de grupos de 3 dígitos
  if (/^\d{1,3}(\.\d{3})+$/.test(valor)) {
    return Number(valor.replace(/\./g, ''));
  }

  return Number(valor);
}

function obterDataHoje() {
  const hoje = new Date();
  const mes = String(hoje.getMonth() + 1).padStart(2, '0');
  const dia = String(hoje.getDate()).padStart(2, '0');
  return `${hoje.getFullYear()}-${mes}-${dia}`;
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
  const chips = Object.keys(CATEGORIA_CORES).map((categoria) => {
    const botao = document.createElement('button');
    botao.type = 'button';
    botao.className = 'chip-filtro px-4 py-1.5 rounded-full text-sm font-medium border';
    botao.style.cssText = 'border-color: var(--border); color: var(--text-muted);';
    botao.dataset.filtroCategoria = categoria;
    botao.textContent = categoria;
    return botao;
  });

  chips.forEach((botao) => listaChipsFiltro.appendChild(botao));
}

function criarCategoriasSidebar() {
  const itens = Object.entries(CATEGORIA_CORES).map(([categoria, cor]) => {
    const botao = document.createElement('button');
    botao.type = 'button';
    botao.className = 'nav-item flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-left text-[var(--text-muted)] hover:bg-[var(--surface)] hover:text-[var(--text)]';
    botao.dataset.filtroCategoria = categoria;

    const ponto = document.createElement('span');
    ponto.className = 'w-2.5 h-2.5 rounded-full cat-dot shrink-0';
    ponto.style.background = cor;

    botao.append(ponto, categoria);
    return botao;
  });

  itens.forEach((botao) => listaCategoriasSidebar.appendChild(botao));
}

function atualizarEstilosChips() {
  listaChipsFiltro.querySelectorAll('.chip-filtro').forEach((chip) => {
    const ehAtivo =
      (chip.dataset.filtroTipo && !filtroCategoria && chip.dataset.filtroTipo === filtroTipo) ||
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

function atualizarContadoresSidebar() {
  contadorTodos.textContent = lancamentos.length;
  contadorReceitas.textContent = lancamentos.filter(
    (lancamento) => lancamento.type === TIPOS.RECEITA
  ).length;
  contadorDespesas.textContent = lancamentos.filter(
    (lancamento) => lancamento.type === TIPOS.DESPESA
  ).length;
}

function atualizarEstilosSidebar() {
  navVisualizar.querySelectorAll('.nav-item[data-filtro-tipo]').forEach((item) => {
    item.classList.toggle('nav-item-ativo', !filtroCategoria && item.dataset.filtroTipo === filtroTipo);
  });
  listaCategoriasSidebar.querySelectorAll('.nav-item[data-filtro-categoria]').forEach((item) => {
    item.classList.toggle('nav-item-ativo', item.dataset.filtroCategoria === filtroCategoria);
  });
}

function aplicarFiltroTipo(tipo) {
  filtroTipo = tipo;
  filtroCategoria = null;
  renderizarLancamentos();
  atualizarEstilosChips();
  atualizarEstilosSidebar();
}

function aplicarFiltroCategoria(categoria) {
  filtroCategoria = categoria;
  filtroTipo = 'todos';
  renderizarLancamentos();
  atualizarEstilosChips();
  atualizarEstilosSidebar();
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

function carregarEstado() {
  try {
    const dadosSalvos = JSON.parse(localStorage.getItem(CHAVE_ESTADO));
    if (Array.isArray(dadosSalvos)) {
      lancamentos.push(...dadosSalvos);
    }
  } catch (erro) {
    console.warn('Não foi possível carregar os lançamentos salvos.', erro);
  }
}

function atualizarResumo() {
  const totalReceitas = lancamentos
    .filter((lancamento) => lancamento.type === TIPOS.RECEITA)
    .reduce((soma, lancamento) => soma + lancamento.amount, 0);
  const totalDespesas = lancamentos
    .filter((lancamento) => lancamento.type === TIPOS.DESPESA)
    .reduce((soma, lancamento) => soma + lancamento.amount, 0);
  const saldo = totalReceitas - totalDespesas;
  const corSaldo = saldo < 0 ? 'var(--negative)' : 'var(--positive)';

  resumoSaldo.textContent = formatarMoeda(saldo);
  resumoSaldo.style.color = corSaldo;
  resumoTotalSaldo.style.color = saldo < 0 ? 'var(--negative)' : 'var(--text)';
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
  atualizarContadoresSidebar();
  salvarEstado();
}

function mostrarListaVazia() {
  if (lancamentos.length === 0) {
    listaLancamentosVaziaTitulo.textContent = 'Nenhum lançamento ainda';
    listaLancamentosVaziaTexto.textContent = 'Clique em "Novo lançamento" para registrar sua primeira receita ou despesa.';
  } else {
    listaLancamentosVaziaTitulo.textContent = 'Nada por aqui';
    listaLancamentosVaziaTexto.textContent = 'Nenhum lançamento corresponde ao filtro selecionado.';
  }
  listaLancamentosVazia.classList.remove('hidden');
}

function renderizarLancamentos() {
  const linhasExistentes = listaLancamentos.querySelectorAll('.row');
  linhasExistentes.forEach((linha) => linha.remove());

  const lancamentosFiltrados = obterLancamentosFiltrados();

  if (lancamentosFiltrados.length === 0) {
    cabecalhoListaLancamentos.classList.add('hidden');
    mostrarListaVazia();
    return;
  }

  listaLancamentosVazia.classList.add('hidden');
  cabecalhoListaLancamentos.classList.remove('hidden');

  const linhas = lancamentosFiltrados.map((lancamento, index) => {
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
          <p class="linha-descricao font-medium truncate"></p>
          <div class="flex items-center gap-2">
            <span class="linha-categoria text-sm text-[var(--text-muted)]"></span>
            <span class="text-xs font-semibold px-1.5 py-0.5 rounded" style="color: ${corTipo}; background: ${ehReceita ? 'var(--positive-dim)' : 'var(--negative-dim)'};">${rotuloTipo}</span>
          </div>
        </div>
      </div>
      <span class="hidden sm:block w-24 text-right text-sm text-[var(--text-muted)]">${formatarData(lancamento.date)}</span>
      <span class="w-32 text-right font-display font-semibold" style="color: ${corValor};">${sinal} ${formatarMoeda(lancamento.amount)}</span>
      <button class="row-actions w-8 h-8 flex items-center justify-center rounded-full hover:bg-[var(--border)] text-[var(--text-muted)] hover:text-[var(--negative)] justify-self-end btn-remover">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
      </button>
    `;

    // Texto digitado pelo usuário entra via textContent para não ser interpretado como HTML
    div.querySelector('.linha-descricao').textContent = lancamento.description;
    div.querySelector('.linha-categoria').textContent = lancamento.category;

    return div;
  });

  const fragmento = document.createDocumentFragment();
  linhas.forEach((linha) => fragmento.appendChild(linha));
  listaLancamentos.appendChild(fragmento);
}

function limparFormulario() {
  inputDescricao.value = '';
  inputValor.value = '';
  inputData.value = obterDataHoje();
  selectCategoria.selectedIndex = 0;
  radioReceita.checked = true;
  esconderErroFormulario();
}

function mostrarErroFormulario(campo, mensagem) {
  erroFormulario.textContent = mensagem;
  erroFormulario.classList.remove('hidden');
  campo.focus();
}

function esconderErroFormulario() {
  erroFormulario.textContent = '';
  erroFormulario.classList.add('hidden');
}

function adicionarLancamento(evento) {
  evento.preventDefault();

  const descricao = inputDescricao.value.trim();
  const valor = converterValor(inputValor.value);
  const tipo = radioReceita.checked ? TIPOS.RECEITA : TIPOS.DESPESA;
  const categoria = selectCategoria.value;
  const data = inputData.value;

  if (!descricao) {
    mostrarErroFormulario(inputDescricao, 'Informe uma descrição.');
    return;
  }

  if (!valor || valor <= 0) {
    mostrarErroFormulario(inputValor, 'Informe um valor maior que zero (ex.: 150,90).');
    return;
  }

  if (!data) {
    mostrarErroFormulario(inputData, 'Informe a data do lançamento.');
    return;
  }

  if (!categoria) {
    mostrarErroFormulario(selectCategoria, 'Selecione uma categoria.');
    return;
  }

  const lancamento = criarLancamento(descricao, valor, tipo, categoria, data);
  lancamentos.push(lancamento);
  salvarEstado();

  limparFormulario();
  renderizarLancamentos();
  atualizarResumo();
  atualizarContadoresSidebar();

  modalToggle.checked = false;
}

formNovoLancamento.addEventListener('submit', adicionarLancamento);

btnSalvar.addEventListener('click', adicionarLancamento);

// Ao abrir o modal, não exibe erro que sobrou de uma tentativa anterior
modalToggle.addEventListener('change', esconderErroFormulario);

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

navVisualizar.addEventListener('click', (evento) => {
  const botao = evento.target.closest('[data-filtro-tipo]');
  if (!botao) return;

  aplicarFiltroTipo(botao.dataset.filtroTipo);
});

listaChipsFiltro.addEventListener('click', (evento) => {
  const chip = evento.target.closest('.chip-filtro');
  if (!chip) return;

  if (chip.dataset.filtroTipo) {
    aplicarFiltroTipo(chip.dataset.filtroTipo);
  } else if (chip.dataset.filtroCategoria) {
    aplicarFiltroCategoria(chip.dataset.filtroCategoria);
  }
});

listaCategoriasSidebar.addEventListener('click', (evento) => {
  const botao = evento.target.closest('[data-filtro-categoria]');
  if (!botao) return;

  aplicarFiltroCategoria(botao.dataset.filtroCategoria);
});

carregarEstado();
criarChipsCategorias();
criarCategoriasSidebar();
inputData.value = obterDataHoje();
renderizarLancamentos();
atualizarResumo();
atualizarContadoresSidebar();
atualizarEstilosChips();
atualizarEstilosSidebar();