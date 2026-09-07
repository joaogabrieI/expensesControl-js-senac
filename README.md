# Meus Gastos — Controle de despesas

## Objetivo do projeto

Aplicação web de controle financeiro pessoal desenvolvida em JavaScript puro. O usuário cadastra lançamentos de receitas e despesas, organizados por categoria, e acompanha o resumo financeiro em tempo real. O projeto demonstra na prática conceitos fundamentais de JavaScript no navegador, como manipulação do DOM, eventos, arrays e persistência de dados.

## Funcionalidades

- **Cadastro de lançamentos**: registro de descrição, valor, tipo (receita/despesa) e categoria via formulário.
- **Validação de formulário**: descrição vazia e valores menores ou iguais a zero são rejeitados.
- **Listagem dinâmica**: os lançamentos são renderizados no container sem recarregar a página, com receitas e despesas visualmente distintas (cor, sinal e badge de tipo).
- **Filtros**: visualização de subconjuntos por tipo (todos, receitas, despesas) e por categoria, sem alterar os dados armazenados.
- **Remoção de lançamentos**: com modal de confirmação antes de excluir.
- **Resumo financeiro**: totais de receitas, despesas e saldo calculados automaticamente a cada adição ou remoção.
- **Formatação de moeda**: valores exibidos no padrão brasileiro (R$).
- **Persistência local**: os lançamentos permanecem salvos após atualizar ou fechar a página.

## Tecnologias utilizadas

- **HTML5** — estrutura semântica das páginas.
- **CSS3** — estilos customizados em `frontend/style.css` (variáveis, responsividade, transições).
- **Tailwind CSS** — estilização utilitária via CDN.
- **JavaScript (ES6+)** — toda a lógica da aplicação em `frontend/script.js`.
- **localStorage** — persistência de dados no navegador.

## Como executar

Abrir o `index.html` direto pelo sistema de arquivos.

## Estrutura do projeto

```
frontend/
├── index.html   # estrutura da aplicação
├── style.css    # estilos customizados
└── script.js    # lógica e interações
```

## Principais conceitos JavaScript aplicados

- **Manipulação do DOM**: `getElementById`, `createElement`, `querySelectorAll`, `closest`, `innerHTML`.
- **Eventos**: `addEventListener` para `submit` e `click`, uso de **delegação de eventos** para evitar registro repetido de listeners a cada renderização.
- **Arrays e métodos de iteração**: `push`, `filter`, `splice`, `findIndex`, `includes`, `reduce`, `forEach`.
- **Objetos e imutabilidade**: criação de objetos de lançamento e `Object.freeze` para constantes de tipos (receita/despesa).
- **`crypto.randomUUID()`**: geração de identificadores únicos para cada lançamento.
- **Validação e conversão de tipos**: `Number()` e tratamento do separador decimal brasileiro (`,` → `.`).
- **Formatação de dados**: `toLocaleString` / `toLocaleDateString` para moeda e data em pt-BR.
- **Persistência**: `localStorage.setItem/getItem` com `JSON.stringify`/`JSON.parse` e tratamento de erros ao carregar dados.