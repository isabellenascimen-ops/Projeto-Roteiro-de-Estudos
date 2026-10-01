const CHAVE = "estudos-programacao";
const NIVEIS = ["Iniciante", "Básico", "Intermediário", "Avançado"];
const app = document.getElementById("app");

function ler() {
  try { return JSON.parse(localStorage.getItem(CHAVE)) || {}; } catch (e) { return {}; }
}
function gravar(d) {
  localStorage.setItem(CHAVE, JSON.stringify(d));
}
function esc(s) {
  return String(s).replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
}
function nivel(i, n) {
  return NIVEIS[Math.floor(i * 4 / n)];
}
function registro(d, l, i) {
  return (d[l] && d[l][i]) || { codigo: "", feito: false };
}
function contar(d, l) {
  const r = d[l] || {};
  return Object.values(r).filter(x => x.feito).length;
}
function primeiraPendente(d, l) {
  const n = ATIVIDADES[l].itens.length;
  for (let i = 0; i < n; i++) if (!registro(d, l, i).feito) return i;
  return 0;
}

function inicio() {
  const d = ler();
  let html = "<h1>Aprendizado de Programação</h1>";
  if (d._ultimo && ATIVIDADES[d._ultimo.l]) {
    const u = d._ultimo;
    html += `<p><a class="botao" href="#/a/${u.l}/${u.i}">Continuar de onde parei: ${esc(ATIVIDADES[u.l].nome)}, atividade ${u.i + 1}</a></p>`;
  }
  for (const l in ATIVIDADES) {
    const total = ATIVIDADES[l].itens.length;
    const f = contar(d, l);
    const p = Math.round(f * 100 / total);
    html += `<div class="card">
<div class="linha"><h3><a href="#/l/${l}">${esc(ATIVIDADES[l].nome)}</a></h3><span>${f}/${total} atividades</span></div>
<div class="estado">${f} concluídas, ${total - f} pendentes</div>
<div>${f} de ${total} concluídas - ${p}%</div>
<progress value="${f}" max="${total}"></progress>
</div>`;
  }
  app.innerHTML = html;
}

function linguagem(l) {
  if (!ATIVIDADES[l]) return inicio();
  const d = ler();
  const itens = ATIVIDADES[l].itens;
  const f = contar(d, l);
  let html = `<h1>${esc(ATIVIDADES[l].nome)}</h1>
<p>${f} de ${itens.length} concluídas - ${Math.round(f * 100 / itens.length)}%</p>
<progress value="${f}" max="${itens.length}"></progress>
<p><a class="botao" href="#/a/${l}/${primeiraPendente(d, l)}">Ir para a próxima pendente</a></p>`;
  let atual = "";
  itens.forEach((it, i) => {
    const nv = nivel(i, itens.length);
    if (nv !== atual) {
      if (atual) html += "</div>";
      html += `<h2>${nv}</h2><div class="lista">`;
      atual = nv;
    }
    const r = registro(d, l, i);
    const est = r.feito ? "Concluída" : (r.codigo ? "Com resposta" : "Pendente");
    html += `<a href="#/a/${l}/${i}" class="${r.feito ? "feita" : ""}"><span>${i + 1}. ${esc(it[0])}</span><span class="estado">${est}</span></a>`;
  });
  html += "</div>";
  app.innerHTML = html;
}

function atividade(l, i) {
  if (!ATIVIDADES[l] || !ATIVIDADES[l].itens[i]) return inicio();
  const d = ler();
  d._ultimo = { l, i };
  gravar(d);
  const itens = ATIVIDADES[l].itens;
  const it = itens[i];
  const r = registro(d, l, i);
  const num = String(i + 1).padStart(2, "0");
  app.innerHTML = `<p><a href="#/l/${l}">Voltar para ${esc(ATIVIDADES[l].nome)}</a></p>
<h1>Atividade ${num} - ${esc(it[0])}</h1>
<p class="meta">Linguagem: ${esc(ATIVIDADES[l].nome)} | Dificuldade: ${nivel(i, itens.length)} | Conceito: ${esc(it[1])}</p>
<h2>Descrição</h2><p>${esc(it[2])}</p>
<h2>O que preciso fazer</h2><p>${esc(it[3])}</p>
<h2>Dicas</h2><p>${esc(it[4])}</p>
<h2>Minha solução</h2>
<textarea id="codigo" spellcheck="false">${esc(r.codigo)}</textarea>
<div>
<button id="salvar">Salvar</button>
<button id="concluir"></button>
<span class="aviso" id="aviso"></span>
</div>
<div class="nav-ativ">
<span>${i > 0 ? `<a href="#/a/${l}/${i - 1}">Anterior</a>` : ""}</span>
<span>${i < itens.length - 1 ? `<a href="#/a/${l}/${i + 1}">Próxima</a>` : ""}</span>
</div>`;
  const campo = document.getElementById("codigo");
  const botao = document.getElementById("concluir");
  const aviso = document.getElementById("aviso");
  function rotulo() {
    botao.textContent = registro(ler(), l, i).feito ? "Desmarcar conclusão" : "Marcar como concluída";
  }
  function guardar(feito) {
    const dados = ler();
    if (!dados[l]) dados[l] = {};
    const atual = registro(dados, l, i);
    dados[l][i] = { codigo: campo.value, feito: feito === undefined ? atual.feito : feito };
    gravar(dados);
    rotulo();
  }
  document.getElementById("salvar").onclick = () => {
    guardar();
    aviso.textContent = "Salvo.";
  };
  botao.onclick = () => {
    const novo = !registro(ler(), l, i).feito;
    guardar(novo);
    aviso.textContent = novo ? "Atividade marcada como concluída." : "Conclusão desmarcada.";
  };
  rotulo();
}

function solucoes() {
  const d = ler();
  let html = "<h1>Minhas soluções</h1>";
  let achou = false;
  for (const l in ATIVIDADES) {
    const blocos = [];
    ATIVIDADES[l].itens.forEach((it, i) => {
      const r = registro(d, l, i);
      if (!r.codigo && !r.feito) return;
      blocos.push(`<div class="card">
<div class="linha"><strong>${i + 1}. ${esc(it[0])}</strong><span class="estado">${r.feito ? "Concluída" : "Não concluída"}</span></div>
<pre>${r.codigo ? esc(r.codigo) : "Sem resposta salva."}</pre>
<a class="botao" href="#/a/${l}/${i}">Abrir e editar</a>
</div>`);
    });
    if (blocos.length) {
      achou = true;
      html += `<h2>${esc(ATIVIDADES[l].nome)}</h2>` + blocos.join("");
    }
  }
  if (!achou) html += "<p>Nenhuma solução salva ainda.</p>";
  app.innerHTML = html;
}

function rotear() {
  const p = location.hash.replace(/^#\/?/, "").split("/");
  if (p[0] === "l") return linguagem(p[1]);
  if (p[0] === "a") return atividade(p[1], parseInt(p[2], 10));
  if (p[0] === "solucoes") return solucoes();
  inicio();
  window.scrollTo(0, 0);
}
window.addEventListener("hashchange", rotear);
rotear();
