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
const modalLancamentoTitulo = document.getElementById('modal-lancamento-titulo');
const modalLancamentoSubtitulo = document.getElementById('modal-lancamento-subtitulo');

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
const resumoPeriodo = document.getElementById('resumo-periodo');
const rotuloMes = document.getElementById('rotulo-mes');
const btnMesAnterior = document.getElementById('btn-mes-anterior');
const btnMesProximo = document.getElementById('btn-mes-proximo');
const btnTodosMeses = document.getElementById('btn-todos-meses');
const inputBusca = document.getElementById('busca');
const selectOrdenacao = document.getElementById('ordenacao');
const graficoMensal = document.getElementById('grafico-mensal');
const graficoMensalSubtitulo = document.getElementById('grafico-mensal-subtitulo');
const graficoMensalDica = document.getElementById('grafico-mensal-dica');
const graficoCategorias = document.getElementById('grafico-categorias');
const graficoCategoriasSubtitulo = document.getElementById('grafico-categorias-subtitulo');
const btnAbrirOrcamentos = document.getElementById('btn-abrir-orcamentos');
const modalOrcamentos = document.getElementById('modal-orcamentos');
const modalOrcamentosOverlay = document.getElementById('modal-orcamentos-overlay');
const formOrcamentos = document.getElementById('form-orcamentos');
const listaCamposOrcamento = document.getElementById('lista-campos-orcamento');
const erroOrcamentos = document.getElementById('erro-orcamentos');
const btnCancelarOrcamentos = document.getElementById('btn-cancelar-orcamentos');

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

// Versão curta para eixos de gráfico: 1500 → "R$ 1,5 mil"
function formatarMoedaCompacta(valor) {
  return valor.toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    notation: 'compact',
    maximumFractionDigits: 1,
  });
}

// Número sem "R$", no formato aceito pelos campos de valor: 1234.5 → "1.234,50"
function formatarNumero(valor) {
  return valor.toLocaleString('pt-BR', { minimumFractionDigits: 2 });
}

function capitalizar(texto) {
  return texto[0].toUpperCase() + texto.slice(1);
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

// Meses são representados como "AAAA-MM", o mesmo prefixo das datas salvas
function deslocarMes(mesIso, quantidade) {
  const [ano, mes] = mesIso.split('-').map(Number);
  const novaData = new Date(ano, mes - 1 + quantidade, 1);
  return `${novaData.getFullYear()}-${String(novaData.getMonth() + 1).padStart(2, '0')}`;
}

// "2026-10" → "outubro de 2026"
function formatarMes(mesIso) {
  const [ano, mes] = mesIso.split('-').map(Number);
  return new Date(ano, mes - 1, 1).toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });
}

// Deixa o texto em minúsculas e sem acentos, para a busca ignorar essas diferenças
function normalizarTexto(texto) {
  return texto.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
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
const CHAVE_ORCAMENTOS = 'orcamentos';

// Salário só aparece como receita, então não faz sentido ter orçamento de gasto
const CATEGORIAS_ORCAMENTO = Object.keys(CATEGORIA_CORES).filter((categoria) => categoria !== 'Salário');

const MESES_NO_GRAFICO = 6;
const ALTURA_GRAFICO = 160;

// Limite mensal por categoria, ex.: { 'Alimentação': 800 }
let orcamentos = {};

let filtroTipo = 'todos';
let filtroCategoria = null;
let idParaRemover = null;
let idEmEdicao = null;
let mesSelecionado = obterDataHoje().slice(0, 7);
let verTodosMeses = false;
let termoBusca = '';
let ordenacao = 'data-desc';

// Lançamentos do período escolhido; base do resumo, dos contadores e da lista
function obterLancamentosDoPeriodo() {
  if (verTodosMeses) return lancamentos;
  return lancamentos.filter((lancamento) => lancamento.date?.startsWith(mesSelecionado));
}

function ordenarLancamentos(lista) {
  // Posição de cadastro, usada para desempatar (ex.: dois lançamentos no mesmo dia)
  const posicao = new Map(lancamentos.map((lancamento, indice) => [lancamento.id, indice]));
  const maisNovoPrimeiro = (a, b) => posicao.get(b.id) - posicao.get(a.id);
  const maisAntigoPrimeiro = (a, b) => posicao.get(a.id) - posicao.get(b.id);

  // Lançamentos sem data ('') ficam por último nas datas decrescentes e primeiro nas crescentes
  const comparadores = {
    'data-desc': (a, b) => (b.date || '').localeCompare(a.date || '') || maisNovoPrimeiro(a, b),
    'data-asc': (a, b) => (a.date || '').localeCompare(b.date || '') || maisAntigoPrimeiro(a, b),
    'valor-desc': (a, b) => b.amount - a.amount || maisNovoPrimeiro(a, b),
    'valor-asc': (a, b) => a.amount - b.amount || maisNovoPrimeiro(a, b),
    'descricao-asc': (a, b) =>
      a.description.localeCompare(b.description, 'pt-BR', { sensitivity: 'base' }) || maisNovoPrimeiro(a, b),
  };

  return [...lista].sort(comparadores[ordenacao]);
}

function obterLancamentosFiltrados() {
  const busca = normalizarTexto(termoBusca.trim());

  const filtrados = obterLancamentosDoPeriodo().filter((lancamento) => {
    const tipoCorresponde = filtroTipo === 'todos' || lancamento.type === filtroTipo;
    const categoriaCorresponde = !filtroCategoria || lancamento.category === filtroCategoria;
    const buscaCorresponde = !busca || normalizarTexto(lancamento.description).includes(busca);
    return tipoCorresponde && categoriaCorresponde && buscaCorresponde;
  });

  return ordenarLancamentos(filtrados);
}

function atualizarPeriodo() {
  const nomeMes = formatarMes(mesSelecionado);

  rotuloMes.textContent = verTodosMeses ? 'Todos os meses' : capitalizar(nomeMes);
  resumoPeriodo.textContent = verTodosMeses ? 'Resumo geral' : `Resumo de ${nomeMes}`;
  btnMesAnterior.disabled = verTodosMeses;
  btnMesProximo.disabled = verTodosMeses;

  btnTodosMeses.setAttribute('aria-pressed', String(verTodosMeses));
  btnTodosMeses.style.background = verTodosMeses ? 'var(--text)' : 'transparent';
  btnTodosMeses.style.color = verTodosMeses ? 'var(--bg)' : 'var(--text-muted)';
  btnTodosMeses.style.borderColor = verTodosMeses ? 'transparent' : 'var(--border)';
}

function atualizarTela() {
  atualizarPeriodo();
  renderizarLancamentos();
  atualizarResumo();
  atualizarContadoresSidebar();
  renderizarGraficoMensal();
  renderizarGraficoCategorias();
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
  const lancamentosDoPeriodo = obterLancamentosDoPeriodo();

  contadorTodos.textContent = lancamentosDoPeriodo.length;
  contadorReceitas.textContent = lancamentosDoPeriodo.filter(
    (lancamento) => lancamento.type === TIPOS.RECEITA
  ).length;
  contadorDespesas.textContent = lancamentosDoPeriodo.filter(
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

function salvarOrcamentos() {
  localStorage.setItem(CHAVE_ORCAMENTOS, JSON.stringify(orcamentos));
}

function carregarOrcamentos() {
  try {
    const dadosSalvos = JSON.parse(localStorage.getItem(CHAVE_ORCAMENTOS));
    if (dadosSalvos && typeof dadosSalvos === 'object' && !Array.isArray(dadosSalvos)) {
      orcamentos = dadosSalvos;
    }
  } catch (erro) {
    console.warn('Não foi possível carregar os orçamentos salvos.', erro);
  }
}

function somarValores(lista, tipo) {
  return lista
    .filter((lancamento) => lancamento.type === tipo)
    .reduce((soma, lancamento) => soma + lancamento.amount, 0);
}

function atualizarResumo() {
  const lancamentosDoPeriodo = obterLancamentosDoPeriodo();

  const totalReceitas = somarValores(lancamentosDoPeriodo, TIPOS.RECEITA);
  const totalDespesas = somarValores(lancamentosDoPeriodo, TIPOS.DESPESA);
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
  atualizarTela();
  salvarEstado();
}

function mostrarListaVazia() {
  if (lancamentos.length === 0) {
    listaLancamentosVaziaTitulo.textContent = 'Nenhum lançamento ainda';
    listaLancamentosVaziaTexto.textContent = 'Clique em "Novo lançamento" para registrar sua primeira receita ou despesa.';
  } else if (obterLancamentosDoPeriodo().length === 0) {
    listaLancamentosVaziaTitulo.textContent = `Nenhum lançamento em ${formatarMes(mesSelecionado)}`;
    listaLancamentosVaziaTexto.textContent = 'Navegue para outro mês ou clique em "Todos os meses".';
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
    // O cabeçalho fica sempre escondido no celular (hidden); sm:grid só o mostra em telas maiores
    cabecalhoListaLancamentos.classList.remove('sm:grid');
    mostrarListaVazia();
    return;
  }

  listaLancamentosVazia.classList.add('hidden');
  cabecalhoListaLancamentos.classList.add('sm:grid');

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
    div.className = 'row grid grid-cols-[1fr_auto_auto_auto] items-center gap-3 sm:gap-4 px-5 py-3.5 hover:bg-[var(--surface-hover)]';
    div.style.cssText = borda;
    div.dataset.id = lancamento.id;

    div.innerHTML = `
      <div class="flex items-center gap-3 min-w-0">
        <span class="w-2.5 h-2.5 rounded-full cat-dot shrink-0" style="background:${cor};"></span>
        <div class="min-w-0">
          <p class="linha-descricao font-medium truncate"></p>
          <div class="flex items-center gap-2 min-w-0">
            <span class="linha-categoria text-sm text-[var(--text-muted)] truncate"></span>
            <span class="hidden sm:inline shrink-0 text-xs font-semibold px-1.5 py-0.5 rounded" style="color: ${corTipo}; background: ${ehReceita ? 'var(--positive-dim)' : 'var(--negative-dim)'};">${rotuloTipo}</span>
          </div>
        </div>
      </div>
      <span class="hidden sm:block w-24 text-right text-sm text-[var(--text-muted)]">${formatarData(lancamento.date)}</span>
      <span class="sm:w-32 text-right whitespace-nowrap font-display font-semibold" style="color: ${corValor};">${sinal} ${formatarMoeda(lancamento.amount)}</span>
      <div class="row-actions w-16 flex items-center justify-end">
        <button type="button" title="Editar" aria-label="Editar lançamento" class="w-8 h-8 flex items-center justify-center rounded-full hover:bg-[var(--border)] text-[var(--text-muted)] hover:text-[var(--text)] btn-editar">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 20h9"></path><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path></svg>
        </button>
        <button type="button" title="Remover" aria-label="Remover lançamento" class="w-8 h-8 flex items-center justify-center rounded-full hover:bg-[var(--border)] text-[var(--text-muted)] hover:text-[var(--negative)] btn-remover">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
        </button>
      </div>
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

// Arredonda o topo do eixo para um valor "redondo": 4.380 → 5.000, 1.270 → 2.000
function arredondarEscala(valor) {
  if (valor <= 0) return 0;
  const potencia = 10 ** Math.floor(Math.log10(valor));
  const passo = [1, 2, 2.5, 5, 10].find((multiplo) => multiplo * potencia >= valor);
  return passo * potencia;
}

const ICONE_ALERTA = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.25" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>';
const ICONE_EXCEDIDO = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.25" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>';

// Colunas de receitas × despesas dos últimos meses, terminando no mês selecionado
function renderizarGraficoMensal() {
  esconderDicaGrafico();

  const mesFinal = verTodosMeses ? obterDataHoje().slice(0, 7) : mesSelecionado;
  const meses = Array.from({ length: MESES_NO_GRAFICO }, (_, indice) =>
    deslocarMes(mesFinal, indice - (MESES_NO_GRAFICO - 1))
  );

  const dados = meses.map((mes) => {
    const lancamentosDoMes = lancamentos.filter((lancamento) => lancamento.date?.startsWith(mes));
    return {
      mes,
      receitas: somarValores(lancamentosDoMes, TIPOS.RECEITA),
      despesas: somarValores(lancamentosDoMes, TIPOS.DESPESA),
    };
  });

  graficoMensalSubtitulo.textContent = `${MESES_NO_GRAFICO} meses até ${formatarMes(mesFinal)}`;

  const escala = arredondarEscala(Math.max(...dados.flatMap((dado) => [dado.receitas, dado.despesas])));
  if (escala === 0) {
    graficoMensal.innerHTML = `<p class="py-16 text-center text-sm text-[var(--text-muted)]">Sem lançamentos nestes ${MESES_NO_GRAFICO} meses.</p>`;
    return;
  }

  // Barras com valor muito pequeno ainda ganham 2px para não sumirem
  const alturaBarra = (valor) => (valor > 0 ? Math.max(2, (valor / escala) * ALTURA_GRAFICO) : 0);

  const linhasGrade = [1, 0.5, 0].map((fracao) => `
    <div class="absolute left-0 right-0 flex items-center gap-2" style="top: ${(1 - fracao) * ALTURA_GRAFICO}px; transform: translateY(-50%);">
      <span class="w-14 shrink-0 text-right text-xs text-[var(--text-muted)]" style="font-variant-numeric: tabular-nums;">${formatarMoedaCompacta(escala * fracao)}</span>
      <span class="flex-1 h-px" style="background: var(--border);"></span>
    </div>
  `);

  const grupos = dados.map(({ mes, receitas, despesas }) => {
    const ehSelecionado = !verTodosMeses && mes === mesSelecionado;
    // Destaca o mês escolhido e deixa os outros como contexto
    const opacidade = verTodosMeses || ehSelecionado ? 1 : 0.45;
    const [ano, numeroMes] = mes.split('-').map(Number);
    const rotulo = new Date(ano, numeroMes - 1, 1).toLocaleDateString('pt-BR', { month: 'short' }).replace('.', '');
    const descricao = `${formatarMes(mes)}: receitas ${formatarMoeda(receitas)}, despesas ${formatarMoeda(despesas)}`;

    return `
      <button type="button" class="grafico-grupo flex-1 flex flex-col items-center rounded-md outline-none focus-visible:ring-2 focus-visible:ring-[var(--text-muted)]"
        style="opacity: ${opacidade};" data-mes="${mes}" data-receitas="${receitas}" data-despesas="${despesas}"
        aria-label="${descricao}. Ver este mês.">
        <span class="flex items-end justify-center gap-[2px] w-full" style="height: ${ALTURA_GRAFICO}px;">
          <span class="grafico-barra w-3 sm:w-4 rounded-t" style="height: ${alturaBarra(receitas)}px; background: var(--positive);"></span>
          <span class="grafico-barra w-3 sm:w-4 rounded-t" style="height: ${alturaBarra(despesas)}px; background: var(--negative);"></span>
        </span>
        <span class="mt-2 text-xs ${ehSelecionado ? 'font-semibold text-[var(--text)]' : 'text-[var(--text-muted)]'}">${rotulo}</span>
      </button>
    `;
  });

  graficoMensal.innerHTML = `
    <div class="relative">
      <div class="absolute inset-x-0 top-0 pointer-events-none" style="height: ${ALTURA_GRAFICO}px;">${linhasGrade.join('')}</div>
      <div class="relative flex pl-16">${grupos.join('')}</div>
    </div>
  `;
}

function mostrarDicaGrafico(grupo) {
  const receitas = Number(grupo.dataset.receitas);
  const despesas = Number(grupo.dataset.despesas);
  const saldo = receitas - despesas;

  graficoMensalDica.innerHTML = `
    <p class="font-medium mb-1">${capitalizar(formatarMes(grupo.dataset.mes))}</p>
    <p class="flex items-center justify-between gap-4"><span class="flex items-center gap-2 text-[var(--text-muted)]"><span class="w-2 h-2 rounded-sm" style="background: var(--positive);"></span>Receitas</span>${formatarMoeda(receitas)}</p>
    <p class="flex items-center justify-between gap-4"><span class="flex items-center gap-2 text-[var(--text-muted)]"><span class="w-2 h-2 rounded-sm" style="background: var(--negative);"></span>Despesas</span>${formatarMoeda(despesas)}</p>
    <p class="flex items-center justify-between gap-4 mt-1 pt-1 font-medium" style="border-top: 1px solid var(--border);"><span class="text-[var(--text-muted)]">Saldo</span>${formatarMoeda(saldo)}</p>
  `;
  graficoMensalDica.classList.remove('hidden');

  // Centraliza a dica acima do grupo, sem deixá-la sair do card
  const card = graficoMensalDica.parentElement;
  const areaCard = card.getBoundingClientRect();
  const areaGrupo = grupo.getBoundingClientRect();
  const centro = areaGrupo.left - areaCard.left + areaGrupo.width / 2;
  const esquerdaMaxima = areaCard.width - graficoMensalDica.offsetWidth - 8;
  const esquerda = Math.min(Math.max(centro - graficoMensalDica.offsetWidth / 2, 8), esquerdaMaxima);

  graficoMensalDica.style.left = `${esquerda}px`;
  graficoMensalDica.style.top = `${areaGrupo.top - areaCard.top - graficoMensalDica.offsetHeight - 8}px`;
}

function esconderDicaGrafico() {
  graficoMensalDica.classList.add('hidden');
}

// Uma linha por categoria: barra de gasto ou, se houver orçamento, medidor do limite
function renderizarGraficoCategorias() {
  const despesasDoPeriodo = obterLancamentosDoPeriodo().filter((lancamento) => lancamento.type === TIPOS.DESPESA);
  const totalDespesas = somarValores(despesasDoPeriodo, TIPOS.DESPESA);
  // Orçamento é mensal; na visão de todos os meses só faz sentido mostrar os gastos
  const compararComOrcamento = !verTodosMeses;

  graficoCategoriasSubtitulo.textContent = verTodosMeses ? 'Todos os meses' : capitalizar(formatarMes(mesSelecionado));

  const itens = Object.keys(CATEGORIA_CORES)
    .map((categoria) => ({
      categoria,
      gasto: somarValores(despesasDoPeriodo.filter((lancamento) => lancamento.category === categoria), TIPOS.DESPESA),
      limite: compararComOrcamento ? orcamentos[categoria] || 0 : 0,
    }))
    .filter((item) => item.gasto > 0 || item.limite > 0)
    .sort((a, b) => b.gasto - a.gasto || b.limite - a.limite);

  const avisoMensal = verTodosMeses && Object.keys(orcamentos).length > 0
    ? '<p class="text-xs text-[var(--text-muted)]">Os orçamentos são mensais: escolha um mês para compará-los com os gastos.</p>'
    : '';

  if (itens.length === 0) {
    graficoCategorias.innerHTML = `
      <p class="py-12 text-center text-sm text-[var(--text-muted)]">Nenhuma despesa neste período.</p>
      ${avisoMensal}
    `;
    return;
  }

  const maiorGasto = Math.max(...itens.map((item) => item.gasto));

  const linhas = itens.map(({ categoria, gasto, limite }) => {
    let largura;
    let corBarra = CATEGORIA_CORES[categoria];
    let valores = `<span class="font-medium text-[var(--text)]">${formatarMoeda(gasto)}</span>`;
    let status;

    if (limite) {
      const proporcao = gasto / limite;
      const porcentagem = Math.round(proporcao * 100);
      largura = Math.min(proporcao, 1) * 100;
      valores += ` de ${formatarMoeda(limite)}`;

      if (proporcao >= 1) {
        corBarra = 'var(--negative)';
        status = `<span class="flex items-center gap-1.5 font-medium text-[var(--text)]"><span style="color: var(--negative);">${ICONE_EXCEDIDO}</span>Excedido em ${formatarMoeda(gasto - limite)}</span>`;
      } else if (proporcao >= 0.8) {
        corBarra = 'var(--warning)';
        status = `<span class="flex items-center gap-1.5 font-medium text-[var(--text)]"><span style="color: var(--warning);">${ICONE_ALERTA}</span>${porcentagem}% do orçamento · restam ${formatarMoeda(limite - gasto)}</span>`;
      } else {
        status = `<span class="text-[var(--text-muted)]">${porcentagem}% do orçamento · restam ${formatarMoeda(limite - gasto)}</span>`;
      }
    } else {
      // Sem orçamento, a barra compara com a categoria que mais gastou
      largura = (gasto / maiorGasto) * 100;
      status = `<span class="text-[var(--text-muted)]">${Math.round((gasto / totalDespesas) * 100)}% das despesas</span>`;
    }

    return `
      <div>
        <div class="flex items-center justify-between gap-3 text-sm mb-1.5">
          <span class="flex items-center gap-2 min-w-0">
            <span class="w-2.5 h-2.5 rounded-full cat-dot shrink-0" style="background: ${CATEGORIA_CORES[categoria]};"></span>
            <span class="truncate">${categoria}</span>
          </span>
          <span class="shrink-0 text-[var(--text-muted)]">${valores}</span>
        </div>
        <div class="h-2 rounded-full overflow-hidden" style="background: var(--surface-hover);" role="presentation">
          <div class="medidor-preenchimento h-full rounded-full" style="width: ${largura}%; background: ${corBarra};"></div>
        </div>
        <p class="text-xs mt-1.5">${status}</p>
      </div>
    `;
  });

  graficoCategorias.innerHTML = linhas.join('') + avisoMensal;
}

function abrirOrcamentos() {
  const campos = CATEGORIAS_ORCAMENTO.map((categoria) => {
    const linha = document.createElement('label');
    linha.className = 'flex items-center justify-between gap-3';
    linha.innerHTML = `
      <span class="flex items-center gap-2 text-sm font-medium">
        <span class="w-2.5 h-2.5 rounded-full cat-dot shrink-0" style="background: ${CATEGORIA_CORES[categoria]};"></span>
        ${categoria}
      </span>
      <span class="flex items-center w-40 rounded-lg" style="background: var(--bg); border: 1px solid var(--border);">
        <span class="pl-3 pr-1 text-sm text-[var(--text-muted)]">R$</span>
        <input type="text" inputmode="decimal" placeholder="Sem limite" class="campo-orcamento w-full pr-3 py-2 bg-transparent outline-none text-sm" style="color: var(--text);">
      </span>
    `;

    const campo = linha.querySelector('.campo-orcamento');
    campo.dataset.categoria = categoria;
    campo.value = orcamentos[categoria] ? formatarNumero(orcamentos[categoria]) : '';
    return linha;
  });

  listaCamposOrcamento.replaceChildren(...campos);
  erroOrcamentos.classList.add('hidden');
  modalOrcamentos.classList.remove('hidden');
  listaCamposOrcamento.querySelector('.campo-orcamento').focus();
}

function fecharOrcamentos() {
  modalOrcamentos.classList.add('hidden');
}

function salvarOrcamentosDoFormulario(evento) {
  evento.preventDefault();

  const novosOrcamentos = {};
  for (const campo of listaCamposOrcamento.querySelectorAll('.campo-orcamento')) {
    if (!campo.value.trim()) continue;

    const valor = converterValor(campo.value);
    if (!valor || valor <= 0) {
      erroOrcamentos.textContent = `Informe um valor maior que zero para ${campo.dataset.categoria} ou deixe em branco.`;
      erroOrcamentos.classList.remove('hidden');
      campo.focus();
      return;
    }
    novosOrcamentos[campo.dataset.categoria] = valor;
  }

  orcamentos = novosOrcamentos;
  salvarOrcamentos();
  fecharOrcamentos();
  renderizarGraficoCategorias();
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

function definirModoModal(editando) {
  modalLancamentoTitulo.textContent = editando ? 'Editar lançamento' : 'Novo lançamento';
  modalLancamentoSubtitulo.textContent = editando ? 'Altere os dados do lançamento' : 'Registre uma entrada ou saída';
  btnSalvar.textContent = editando ? 'Salvar alterações' : 'Salvar lançamento';
}

function abrirEdicao(id) {
  const lancamento = lancamentos.find((item) => item.id === id);
  if (!lancamento) return;

  idEmEdicao = id;
  inputDescricao.value = lancamento.description;
  inputValor.value = formatarNumero(lancamento.amount);
  inputData.value = lancamento.date || obterDataHoje();
  selectCategoria.value = lancamento.category;
  radioReceita.checked = lancamento.type === TIPOS.RECEITA;
  radioDespesa.checked = lancamento.type === TIPOS.DESPESA;
  esconderErroFormulario();
  definirModoModal(true);

  modalToggle.checked = true;
}

function sairDaEdicao() {
  idEmEdicao = null;
  limparFormulario();
  definirModoModal(false);
}

function salvarLancamento(evento) {
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

  const lancamentoEditado = lancamentos.find((item) => item.id === idEmEdicao);

  if (lancamentoEditado) {
    // Mantém o mesmo id e a mesma posição na lista; só os dados mudam
    Object.assign(lancamentoEditado, {
      description: descricao,
      amount: valor,
      type: tipo,
      category: categoria,
      date: data,
    });
  } else {
    lancamentos.push(criarLancamento(descricao, valor, tipo, categoria, data));
  }
  salvarEstado();

  // Mostra o mês do lançamento salvo, para ele não "sumir" da lista
  if (!verTodosMeses) {
    mesSelecionado = data.slice(0, 7);
  }

  sairDaEdicao();
  atualizarTela();

  modalToggle.checked = false;
}

formNovoLancamento.addEventListener('submit', salvarLancamento);

btnSalvar.addEventListener('click', salvarLancamento);

modalToggle.addEventListener('change', () => {
  // Ao abrir o modal, não exibe erro que sobrou de uma tentativa anterior
  esconderErroFormulario();

  // Ao fechar uma edição cancelada, o modal volta a ser de novo lançamento
  if (!modalToggle.checked && idEmEdicao) {
    sairDaEdicao();
  }
});

listaLancamentos.addEventListener('click', (evento) => {
  const botao = evento.target.closest('.btn-editar, .btn-remover');
  if (!botao) return;

  const id = botao.closest('.row').dataset.id;
  if (botao.classList.contains('btn-editar')) {
    abrirEdicao(id);
  } else {
    abrirConfirmacaoRemocao(id);
  }
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

btnMesAnterior.addEventListener('click', () => {
  mesSelecionado = deslocarMes(mesSelecionado, -1);
  atualizarTela();
});

btnMesProximo.addEventListener('click', () => {
  mesSelecionado = deslocarMes(mesSelecionado, 1);
  atualizarTela();
});

btnTodosMeses.addEventListener('click', () => {
  verTodosMeses = !verTodosMeses;
  atualizarTela();
});

inputBusca.addEventListener('input', () => {
  termoBusca = inputBusca.value;
  renderizarLancamentos();
});

selectOrdenacao.addEventListener('change', () => {
  ordenacao = selectOrdenacao.value;
  renderizarLancamentos();
});

graficoMensal.addEventListener('mouseover', (evento) => {
  const grupo = evento.target.closest('.grafico-grupo');
  if (grupo) mostrarDicaGrafico(grupo);
});

graficoMensal.addEventListener('focusin', (evento) => {
  const grupo = evento.target.closest('.grafico-grupo');
  if (grupo) mostrarDicaGrafico(grupo);
});

graficoMensal.addEventListener('mouseleave', esconderDicaGrafico);
graficoMensal.addEventListener('focusout', esconderDicaGrafico);

// Clicar em um mês do gráfico navega para ele
graficoMensal.addEventListener('click', (evento) => {
  const grupo = evento.target.closest('.grafico-grupo');
  if (!grupo) return;

  mesSelecionado = grupo.dataset.mes;
  verTodosMeses = false;
  atualizarTela();
});

btnAbrirOrcamentos.addEventListener('click', abrirOrcamentos);
formOrcamentos.addEventListener('submit', salvarOrcamentosDoFormulario);
btnCancelarOrcamentos.addEventListener('click', fecharOrcamentos);
modalOrcamentosOverlay.addEventListener('click', fecharOrcamentos);

carregarEstado();
carregarOrcamentos();
criarChipsCategorias();
criarCategoriasSidebar();
inputData.value = obterDataHoje();
atualizarTela();
atualizarEstilosChips();
atualizarEstilosSidebar();