import './style.css'

type QuickAction = {
  label: string
  description: string
  tone: 'primary' | 'accent' | 'neutral'
}

type Snapshot = {
  title: string
  value: string
  hint: string
}

const quickActions: QuickAction[] = [
  {
    label: 'Novo lançamento',
    description: 'Receita, despesa ou compra parcelada',
    tone: 'primary'
  },
  {
    label: 'Contas a pagar',
    description: 'Vencimentos da semana e próximos 30 dias',
    tone: 'accent'
  },
  {
    label: 'Projeção de saldo',
    description: 'Veja déficit, equilíbrio ou margem excedente',
    tone: 'neutral'
  }
]

const snapshots: Snapshot[] = [
  { title: 'Saldo hoje', value: 'R$ 0,00', hint: 'Inclua suas contas caixa e bancos' },
  { title: 'A pagar', value: 'R$ 0,00', hint: 'Nenhum título pendente' },
  { title: 'A receber', value: 'R$ 0,00', hint: 'Nenhum recebimento pendente' }
]

const nextSteps = [
  'Cadastrar pessoas (clientes/fornecedores) com PF/PJ',
  'Montar plano de contas básico',
  'Definir recorrências mensais'
]

const app = document.querySelector<HTMLDivElement>('#app')

if (!app) {
  throw new Error('Elemento raiz #app não encontrado')
}

const quickActionsHTML = quickActions
  .map(
    (action) => `
    <button class="action-card action-${action.tone}" type="button">
      <div class="action-header">
        <span class="pill">${action.tone === 'primary' ? 'Começar' : 'Próximo'}</span>
        <span aria-hidden="true" class="chevron">›</span>
      </div>
      <p class="action-title">${action.label}</p>
      <p class="action-desc">${action.description}</p>
    </button>
  `
  )
  .join('')

const snapshotHTML = snapshots
  .map(
    (item) => `
    <article class="snapshot-card">
      <p class="snapshot-title">${item.title}</p>
      <p class="snapshot-value">${item.value}</p>
      <p class="snapshot-hint">${item.hint}</p>
    </article>
  `
  )
  .join('')

const nextStepsHTML = nextSteps
  .map(
    (step, index) => `
    <li>
      <span class="step-number">${index + 1}</span>
      <span>${step}</span>
    </li>
  `
  )
  .join('')

app.innerHTML = `
  <main class="screen">
    <header class="topbar">
      <div class="brand">
        <span class="brand-dot" aria-hidden="true"></span>
        <div class="brand-text">
          <p class="eyebrow">FinApp2P</p>
          <h1>Saúde financeira no seu bolso</h1>
        </div>
      </div>
      <button class="ghost-button" type="button">Entrar</button>
    </header>

    <section class="hero">
      <div>
        <p class="eyebrow">Modo mobile-first</p>
        <h2>Veja saldos, contas e projeções em poucos toques.</h2>
        <p class="hero-desc">
          Interface simples para o básico e tela avançada para lançamentos compostos.
        </p>
      </div>
      <div class="hero-actions">
        <button class="primary-button" type="button">Criar lançamento</button>
        <button class="secondary-button" type="button">Ver projeção</button>
      </div>
    </section>

    <section class="section">
      <div class="section-header">
        <h3>Ações rápidas</h3>
        <p>Priorizado para toque único no celular.</p>
      </div>
      <div class="actions-grid">
        ${quickActionsHTML}
      </div>
    </section>

    <section class="section">
      <div class="section-header">
        <h3>Visão rápida</h3>
        <p>Saldos e títulos que alimentam a projeção.</p>
      </div>
      <div class="snapshot-grid">
        ${snapshotHTML}
      </div>
    </section>

    <section class="section">
      <div class="section-header">
        <h3>Próximos passos</h3>
        <p>Guia rápido para começar.</p>
      </div>
      <ol class="steps">
        ${nextStepsHTML}
      </ol>
    </section>
  </main>
`
