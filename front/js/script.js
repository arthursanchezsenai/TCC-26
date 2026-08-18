/* ============================================================
   PARTITURA — script.js
   Módulos: Loader | Header | Hero | Cards | Editor Canvas |
            Stats | Filtros | Modal | Formulário | Toast
   ============================================================ */

'use strict';

/* ── Utilitários ── */
const $ = (sel, ctx = document) => ctx.querySelector(sel);
const $$ = (sel, ctx = document) => [...ctx.querySelectorAll(sel)];

/* ============================================================
   1. LOADER
   ============================================================ */
window.addEventListener('load', () => {
  const loader = $('#loader');
  setTimeout(() => loader.classList.add('hidden'), 1200);
});

/* ============================================================
   2. HEADER — scroll + hamburger
   ============================================================ */
const header = $('#header');
const hamburger = $('#hamburger');
const nav = $('#nav');

window.addEventListener('scroll', () => {
  header.classList.toggle('scrolled', window.scrollY > 40);
});

hamburger.addEventListener('click', () => {
  hamburger.classList.toggle('open');
  nav.classList.toggle('open');
});

// Fecha o nav ao clicar em um link
$$('.nav__link').forEach(link => {
  link.addEventListener('click', () => {
    hamburger.classList.remove('open');
    nav.classList.remove('open');
  });
});

/* ============================================================
   3. HERO — notas flutuantes
   ============================================================ */
const heroNotes = $('#heroNotes');
const noteSymbols = ['♩', '♪', '♫', '♬', '𝄞', '𝄢', '♭', '♯'];

function createNote() {
  const el = document.createElement('span');
  el.classList.add('floating-note');
  el.textContent = noteSymbols[Math.floor(Math.random() * noteSymbols.length)];
  el.style.left = Math.random() * 100 + '%';
  el.style.top = Math.random() * 80 + 20 + '%';
  const duration = 6 + Math.random() * 6;
  const delay = Math.random() * 4;
  el.style.animationDuration = duration + 's';
  el.style.animationDelay = delay + 's';
  el.style.fontSize = (1.2 + Math.random() * 1.5) + 'rem';
  heroNotes.appendChild(el);
  setTimeout(() => el.remove(), (duration + delay) * 1000 + 200);
}

setInterval(createNote, 700);

/* ============================================================
   4. CONTADOR DE ESTATÍSTICAS (scroll trigger)
   ============================================================ */
function animateCounter(el) {
  const target = parseInt(el.dataset.target, 10);
  const duration = 1800;
  const step = 16;
  const steps = Math.floor(duration / step);
  let current = 0;
  const increment = target / steps;

  const timer = setInterval(() => {
    current += increment;
    if (current >= target) {
      el.textContent = target.toLocaleString('pt-BR');
      clearInterval(timer);
    } else {
      el.textContent = Math.floor(current).toLocaleString('pt-BR');
    }
  }, step);
}

const statsObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      animateCounter(entry.target);
      statsObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.5 });

$$('.stat__number').forEach(el => statsObserver.observe(el));

/* ============================================================
   5. DADOS MOCK DAS PARTITURAS
   ============================================================ */
const partiturasMock = [
  { id: 1, titulo: 'Noturno em Dó menor', compositor: 'Ana Beatriz Silva', genero: 'classico', likes: 247, clef: '𝄞' },
  { id: 2, titulo: 'Blues da Madrugada',   compositor: 'Rodrigo Santos',    genero: 'jazz',    likes: 183, clef: '𝄢' },
  { id: 3, titulo: 'Bossa de Outono',       compositor: 'Mariana Costa',    genero: 'mpb',     likes: 312, clef: '𝄞' },
  { id: 4, titulo: 'Sonata para Violino',   compositor: 'Lucas Ferreira',   genero: 'classico', likes: 98,  clef: '𝄞' },
  { id: 5, titulo: 'Improviso nº 7',        compositor: 'Fernanda Lima',    genero: 'jazz',    likes: 156, clef: '𝄢' },
  { id: 6, titulo: 'Ciclo das Águas',       compositor: 'Paulo Mendes',     genero: 'contemporaneo', likes: 74, clef: '𝄞' },
  { id: 7, titulo: 'Valsa dos Ventos',      compositor: 'Carla Duarte',     genero: 'popular', likes: 421, clef: '𝄞' },
  { id: 8, titulo: 'Chorinho de Domingo',   compositor: 'Tiago Barbosa',    genero: 'popular', likes: 289, clef: '𝄞' },
  { id: 9, titulo: 'Elegia Moderna',        compositor: 'Sofia Ramos',      genero: 'contemporaneo', likes: 63, clef: '𝄢' },
];

const generoNomes = {
  classico: 'Clássico',
  jazz: 'Jazz',
  mpb: 'MPB',
  popular: 'Popular',
  contemporaneo: 'Contemporâneo',
};

let filtroAtivo = 'todos';
let partiturasVisiveis = 6;

/* ── Renderiza os cards ── */
function renderCards() {
  const grid = $('#cardsGrid');
  grid.innerHTML = '';

  const filtradas = filtroAtivo === 'todos'
    ? partiturasMock
    : partiturasMock.filter(p => p.genero === filtroAtivo);

  const exibir = filtradas.slice(0, partiturasVisiveis);

  if (exibir.length === 0) {
    grid.innerHTML = '<p style="color:var(--text-muted);text-align:center;grid-column:1/-1;padding:3rem;">Nenhuma partitura encontrada.</p>';
    return;
  }

  exibir.forEach((p, i) => {
    const card = document.createElement('div');
    card.classList.add('card');
    card.style.animationDelay = (i * 0.07) + 's';
    card.dataset.id = p.id;
    card.innerHTML = `
      <div class="card__thumb">
        <div class="card__thumb-staff">
          <span></span><span></span><span></span><span></span><span></span>
        </div>
        <span class="card__clef">${p.clef}</span>
      </div>
      <div class="card__body">
        <p class="card__genre">${generoNomes[p.genero] || p.genero}</p>
        <h3 class="card__title">${p.titulo}</h3>
        <p class="card__composer">${p.compositor}</p>
      </div>
      <div class="card__footer">
        <span class="card__likes">♥ ${p.likes}</span>
        <button class="card__dl-btn" data-id="${p.id}">Baixar</button>
      </div>
    `;
    grid.appendChild(card);
  });

  // Botão "ver mais"
  const btnVerMais = $('#btnVerMais');
  btnVerMais.style.display = filtradas.length > partiturasVisiveis ? '' : 'none';
}

renderCards();

/* ── Filtros ── */
$$('.filtro').forEach(btn => {
  btn.addEventListener('click', () => {
    $$('.filtro').forEach(b => b.classList.remove('filtro--active'));
    btn.classList.add('filtro--active');
    filtroAtivo = btn.dataset.genre;
    partiturasVisiveis = 6;
    renderCards();
  });
});

/* ── Ver mais ── */
$('#btnVerMais').addEventListener('click', () => {
  partiturasVisiveis += 3;
  renderCards();
});

/* ── Download (simulado) ── */
$('#cardsGrid').addEventListener('click', e => {
  if (e.target.classList.contains('card__dl-btn')) {
    const id = e.target.dataset.id;
    const p = partiturasMock.find(x => x.id == id);
    if (p) showToast(`Download iniciado: "${p.titulo}"`);
  }
});

/* ============================================================
   6. EDITOR — CANVAS
   ============================================================ */
const canvas = $('#staffCanvas');
const ctx = canvas.getContext('2d');

let toolAtivo = 'semibreve';
let notasCanvas = []; // { x, y, simbolo, acidente }
let acidendeAtivo = null;

// Reescala o canvas
function resizeCanvas() {
  const w = canvas.parentElement.offsetWidth - (32 * 2); // padding
  canvas.width = Math.max(w, 300);
  canvas.height = 220;
  drawStaff();
}

// Desenha o pentagrama
function drawStaff() {
  const w = canvas.width;
  const h = canvas.height;

  ctx.clearRect(0, 0, w, h);
  ctx.fillStyle = '#faf8f2';
  ctx.fillRect(0, 0, w, h);

  // Margem vertical para o pentagrama
  const staffTop = 50;
  const staffBottom = 170;
  const lineGap = (staffBottom - staffTop) / 4;

  // 5 linhas
  ctx.strokeStyle = '#3a2f1e';
  ctx.lineWidth = 1;
  for (let i = 0; i < 5; i++) {
    const y = staffTop + i * lineGap;
    ctx.beginPath();
    ctx.moveTo(50, y);
    ctx.lineTo(w - 20, y);
    ctx.stroke();
  }

  // Clave de Sol (texto)
  ctx.font = '72px serif';
  ctx.fillStyle = '#3a2f1e';
  ctx.fillText('𝄞', 8, staffBottom + 16);

  // Redesenha notas
  notasCanvas.forEach(n => desenharNota(n));
}

const simbolosNota = {
  semibreve: '𝅝',
  minima:    '𝅗𝅥',
  seminima:  '♩',
  colcheia:  '♪',
  pausa:     '𝄽',
};

function desenharNota(n) {
  ctx.font = '28px serif';
  ctx.fillStyle = '#1a0f00';

  if (n.acidente) {
    ctx.font = '16px serif';
    ctx.fillStyle = '#8a4a00';
    const acidendeSimbolos = { sustenido: '♯', bemol: '♭', natural: '♮' };
    ctx.fillText(acidendeSimbolos[n.acidente] || '', n.x - 14, n.y + 8);
    ctx.font = '28px serif';
    ctx.fillStyle = '#1a0f00';
  }

  const simbolo = simbolosNota[n.tipo] || '♩';
  ctx.fillText(simbolo, n.x, n.y + 8);
}

// Clique no canvas para inserir nota
canvas.addEventListener('click', (e) => {
  const rect = canvas.getBoundingClientRect();
  // Ajuste de escala para canvas vs display
  const scaleX = canvas.width / rect.width;
  const scaleY = canvas.height / rect.height;
  const x = (e.clientX - rect.left) * scaleX;
  const y = (e.clientY - rect.top) * scaleY;

  // Não inserir fora do pentagrama
  if (x < 60 || x > canvas.width - 25) return;

  const novaNota = {
    x: Math.round(x - 8),
    y: Math.round(y - 4),
    tipo: toolAtivo,
    acidente: acidendeAtivo,
  };

  // Não inserir acidentes como nota
  if (['sustenido', 'bemol', 'natural'].includes(toolAtivo)) {
    acidendeAtivo = toolAtivo;
    showToast(`Acidente selecionado: ${toolAtivo}. Agora clique para inserir uma nota.`);
    return;
  }

  // Pausa: colocar no centro do pentagrama
  if (toolAtivo === 'pausa') {
    novaNota.y = 95;
  }

  notasCanvas.push(novaNota);
  acidendeAtivo = null; // reseta acidente após uso
  drawStaff();
});

// Toolbar: seleção de ferramenta
$$('.tool-btn[data-tool]').forEach(btn => {
  btn.addEventListener('click', () => {
    // Remove active de notas e clave
    $$('.tool-btn[data-tool]').forEach(b => {
      const t = b.dataset.tool;
      if (!['sustenido','bemol','natural'].includes(t)) b.classList.remove('active');
    });

    const t = btn.dataset.tool;
    if (['sustenido', 'bemol', 'natural'].includes(t)) {
      acidendeAtivo = t;
      btn.classList.add('active');
      setTimeout(() => btn.classList.remove('active'), 2000);
      showToast(`Acidente ativo: ${t}. Clique em uma nota ou no pentagrama.`);
      return;
    }

    toolAtivo = t;
    btn.classList.add('active');
  });
});

// Desfazer
$('#btnDesfazer').addEventListener('click', () => {
  notasCanvas.pop();
  drawStaff();
  showToast('Última nota removida.');
});

// Limpar
$('#btnLimpar').addEventListener('click', () => {
  if (notasCanvas.length === 0) return;
  if (confirm('Limpar todas as notas do pentagrama?')) {
    notasCanvas = [];
    drawStaff();
    showToast('Pentagrama limpo.');
  }
});

// Inicializa canvas
window.addEventListener('resize', resizeCanvas);
setTimeout(resizeCanvas, 100);

/* ── Ações do editor ── */
$('#btnPublicar').addEventListener('click', () => {
  const titulo = $('#tituloPartitura').value.trim();
  if (!titulo) {
    showToast('Por favor, insira um título para a partitura.', true);
    $('#tituloPartitura').focus();
    return;
  }
  $('#modalPublicar').classList.add('open');
});

$('#btnPreview').addEventListener('click', () => {
  showToast('Pré-visualização em tela cheia em breve!');
});

$('#btnExportar').addEventListener('click', () => {
  showToast('Exportação para PDF disponível na versão final do TCC.');
});

/* ── CTA Hero ── */
$('#btnCriarHero').addEventListener('click', () => {
  document.querySelector('#criar').scrollIntoView({ behavior: 'smooth' });
});

$('#btnExplorarHero').addEventListener('click', () => {
  document.querySelector('#explorar').scrollIntoView({ behavior: 'smooth' });
});

/* ============================================================
   7. MODAL PUBLICAR
   ============================================================ */
$('#modalClose').addEventListener('click', fecharModal);
$('#modalOverlay').addEventListener('click', fecharModal);

function fecharModal() {
  $('#modalPublicar').classList.remove('open');
}

$('#btnConfirmarPublicar').addEventListener('click', () => {
  fecharModal();

  const titulo = $('#tituloPartitura').value.trim() || 'Nova Partitura';
  const compositor = $('#compositorPartitura').value.trim() || 'Anônimo';
  const genero = $('#generoPublicar').value.toLowerCase().replace('â', 'a').replace('ê', 'e');

  // Adiciona ao mock
  const nova = {
    id: Date.now(),
    titulo,
    compositor,
    genero: genero.toLowerCase().includes('jazz') ? 'jazz'
          : genero.toLowerCase().includes('cl')   ? 'classico'
          : genero.toLowerCase().includes('mpb')  ? 'mpb'
          : genero.toLowerCase().includes('pop')  ? 'popular'
          : 'contemporaneo',
    likes: 0,
    clef: '𝄞',
  };

  // Exemplo: buscar partituras
const res = await fetch('http://localhost:3000/api/partituras?genero=jazz');
const data = await res.json();
console.log(data.partituras);

// Exemplo: login
const res = await fetch('http://localhost:3000/api/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ email: 'ana@partitura.com', senha: 'senha123' })
});
const { token, usuario } = await res.json();
localStorage.setItem('token', token);

// Exemplo: criar partitura (autenticado)
const token = localStorage.getItem('token');
const res = await fetch('http://localhost:3000/api/partituras', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  },
  body: JSON.stringify({ titulo: 'Nova Peça', compositor: 'Eu', genero: 'mpb' })
});

  // Volta o filtro para todos e rerenderiza
  filtroAtivo = 'todos';
  $$('.filtro').forEach(b => b.classList.remove('filtro--active'));
  $('.filtro[data-genre="todos"]').classList.add('filtro--active');
  partiturasVisiveis = 6;
  renderCards();

  // Rola até o acervo
  document.querySelector('#explorar').scrollIntoView({ behavior: 'smooth' });

  showToast(`🎼 "${titulo}" publicada com sucesso!`);

  // Limpa editor
  notasCanvas = [];
  drawStaff();
  $('#tituloPartitura').value = '';
  $('#compositorPartitura').value = '';
});

/* ============================================================
   8. FORMULÁRIO DE CONTATO
   ============================================================ */
$('#btnEnviar').addEventListener('click', () => {
  const nome = $('#nome').value.trim();
  const email = $('#email').value.trim();
  const mensagem = $('#mensagem').value.trim();

  if (!nome || !email || !mensagem) {
    showToast('Preencha todos os campos obrigatórios.', true);
    return;
  }

  if (!email.includes('@') || !email.includes('.')) {
    showToast('Insira um e-mail válido.', true);
    return;
  }

  showToast(`✉️ Mensagem enviada com sucesso, ${nome}!`);
  $('#nome').value = '';
  $('#email').value = '';
  $('#assunto').value = '';
  $('#mensagem').value = '';
});

/* ============================================================
   9. HEADER — botões Login / Cadastro
   ============================================================ */
$('#btnLogin').addEventListener('click', () => showToast('Login em breve! Funcionalidade no roadmap.'));
$('#btnCadastro').addEventListener('click', () => showToast('Cadastro em breve! Funcionalidade no roadmap.'));

/* ============================================================
   10. TOAST
   ============================================================ */
let toastTimer;

function showToast(msg, isError = false) {
  const toast = $('#toast');
  toast.textContent = msg;
  toast.style.borderColor = isError ? '#c94c4c' : 'var(--gold)';
  toast.style.color = isError ? '#e8c0c0' : 'var(--text)';
  toast.classList.add('show');

  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove('show'), 3200);
}

/* ============================================================
   11. PREVIEW ANIMADO — seção Sobre
   ============================================================ */
const scoreDisplay = $('#scoreNotesDisplay');
const notesList = ['♩', '♪', '♫', '♬'];

let noteIndex = 0;
function addAnimatedNote() {
  if (!scoreDisplay) return;
  const span = document.createElement('span');
  span.textContent = notesList[noteIndex % notesList.length];
  span.style.cssText = `
    font-size: 1.8rem;
    color: #3a2f1e;
    opacity: 0;
    animation: fadeUp 2.5s ease forwards;
  `;
  scoreDisplay.appendChild(span);
  noteIndex++;
  if (scoreDisplay.children.length > 6) {
    scoreDisplay.removeChild(scoreDisplay.firstChild);
  }
}

setInterval(addAnimatedNote, 900);

/* ============================================================
   12. INTERSECTION OBSERVER — animações de entrada
   ============================================================ */
const observerOptions = { threshold: 0.12 };

const sectionObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.style.opacity = '1';
      entry.target.style.transform = 'translateY(0)';
    }
  });
}, observerOptions);

$$('.step, .form-card, .about-text, .about-visual, .score-preview').forEach(el => {
  el.style.opacity = '0';
  el.style.transform = 'translateY(24px)';
  el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
  sectionObserver.observe(el);
});
