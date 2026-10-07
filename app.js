// ===== Dados (valores por 100 g, aproximados da tabela TACO) =====
const ALIMENTOS = [
  {n:"Arroz branco cozido",k:128,c:28.1,p:2.5,g:0.2},
  {n:"Feijão cozido",k:76,c:13.6,p:4.8,g:0.5},
  {n:"Frango grelhado",k:159,c:0,p:32,g:2.5},
  {n:"Carne bovina grelhada",k:219,c:0,p:35.9,g:7.3},
  {n:"Ovo cozido",k:146,c:0.6,p:13.3,g:9.5},
  {n:"Batata-doce cozida",k:77,c:18.4,p:0.6,g:0.1},
  {n:"Macarrão cozido",k:158,c:30.7,p:5.8,g:0.9},
  {n:"Pão francês",k:300,c:58.6,p:8,g:3.1},
  {n:"Aveia em flocos",k:394,c:66.6,p:13.9,g:8.5},
  {n:"Leite integral",k:61,c:4.7,p:3.2,g:3.3},
  {n:"Queijo mussarela",k:330,c:3,p:22.6,g:25.2},
  {n:"Banana",k:89,c:22.8,p:1.1,g:0.3},
  {n:"Maçã",k:56,c:15.2,p:0.3,g:0.4},
  {n:"Alface",k:15,c:2.9,p:1.4,g:0.2},
  {n:"Tomate",k:15,c:3.1,p:1.1,g:0.2}
];
const TREINO = [
  ["Segunda","Peito e tríceps"],["Terça","Costas e bíceps"],["Quarta","Descanso ou caminhada leve"],
  ["Quinta","Pernas"],["Sexta","Ombros e abdômen"],["Sábado","Cardio 30 min"],["Domingo","Descanso"]
];
const SUPLES = [
  {t:"Creatina (monohidratada)",tag:"Mais estudado",d:"É o suplemento com mais evidência para ganho de força e massa muscular. Dose usual: 3 a 5 g por dia, todos os dias, sem precisar de fase de saturação. Pode ser tomada em qualquer horário, com água ou suco. Beba água ao longo do dia. Quem tem doença renal deve falar com o médico antes."},
  {t:"Whey protein",tag:"Praticidade",d:"É só proteína de leite concentrada: serve para completar a meta diária quando a comida não alcança. Não é obrigatório. Uma dose costuma ter 20 a 30 g de proteína. Quem tem intolerância à lactose pode preferir a versão isolada ou outra fonte."},
  {t:"Cafeína",tag:"Desempenho",d:"Pode melhorar o rendimento e reduzir a sensação de cansaço. Em adultos saudáveis, até 400 mg por dia é considerado seguro, e cerca de 3 mg por kg antes do treino costuma bastar. Evite à noite, pois atrapalha o sono. Gestantes e hipertensos devem pedir orientação."},
  {t:"Ômega-3",tag:"Se comer pouco peixe",d:"Ajuda quem raramente come peixes como sardinha e salmão. Escolha produtos com EPA e DHA descritos no rótulo e tome junto de uma refeição."},
  {t:"Vitamina D",tag:"Só com exame",d:"Muita gente tem pouco, mas a dose certa depende do exame de sangue. Tome apenas com indicação profissional, porque o excesso também faz mal.",med:1},
  {t:"Multivitamínico",tag:"Nem sempre precisa",d:"Uma alimentação variada com frutas, verduras e proteínas normalmente já cobre as necessidades. Pode ajudar em dietas restritivas, mas converse com um nutricionista.",med:1}
];

// ===== Utilidades =====
const $ = s => document.querySelector(s);
const hoje = () => new Date().toISOString().slice(0,10);
const ler = (k,d) => { try { return JSON.parse(localStorage.getItem(k)) ?? d; } catch { return d; } };
const gravar = (k,v) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch {} };
const r = n => Math.round(n*10)/10;

let prato = [];
let diario = ler("np_diario", []);
let metas = ler("np_metas", {k:2000,p:100});
let feitos = ler("np_treino", {});

// ===== Abas =====
document.querySelectorAll("#tabs button").forEach(b => b.onclick = () => {
  document.querySelectorAll("#tabs button").forEach(x => x.classList.toggle("on", x === b));
  document.querySelectorAll(".panel").forEach(p => p.classList.toggle("on", p.id === b.dataset.tab));
  if (b.dataset.tab === "diario") renderDiario();
});

// ===== Foto =====
$("#foto").onchange = e => {
  const f = e.target.files[0];
  if (!f) return;
  const img = $("#preview");
  img.src = URL.createObjectURL(f);
  img.hidden = false;
  $("#dropTxt").hidden = true;
};

// ===== Prato =====
$("#alimento").innerHTML = ALIMENTOS.map((a,i) => `<option value="${i}">${a.n}</option>`).join("");

$("#addBtn").onclick = () => {
  const g = Number($("#gramas").value);
  if (!(g > 0)) return;
  prato.push({i: Number($("#alimento").value), g});
  renderPrato();
};

function totais(itens) {
  return itens.reduce((t,it) => {
    const a = ALIMENTOS[it.i], f = it.g/100;
    t.k += a.k*f; t.c += a.c*f; t.p += a.p*f; t.g += a.g*f;
    return t;
  }, {k:0,c:0,p:0,g:0});
}

function renderPrato() {
  $("#itens").innerHTML = prato.map((it,n) =>
    `<li><span>${ALIMENTOS[it.i].n} · ${it.g} g</span><button aria-label="Remover" data-n="${n}">×</button></li>`).join("");
  document.querySelectorAll("#itens button").forEach(b => b.onclick = () => { prato.splice(b.dataset.n,1); renderPrato(); });
  const t = totais(prato);
  $("#kcal").textContent = Math.round(t.k);
  $("#mc").textContent = r(t.c) + " g";
  $("#mp").textContent = r(t.p) + " g";
  $("#mg").textContent = r(t.g) + " g";
}

$("#salvar").onclick = () => {
  if (!prato.length) { $("#msg").textContent = "Adicione pelo menos um alimento."; return; }
  const t = totais(prato);
  diario.push({d: hoje(), ref: document.querySelector("input[name=ref]:checked").value, k: t.k, c: t.c, p: t.p, g: t.g,
    nome: prato.map(x => ALIMENTOS[x.i].n).join(", ")});
  gravar("np_diario", diario);
  prato = []; renderPrato();
  $("#msg").textContent = "Refeição salva no diário de hoje.";
};

// ===== Diário =====
function renderDiario() {
  $("#metaK").value = metas.k; $("#metaP").value = metas.p;
  const hj = diario.map((e,i) => ({...e,i})).filter(e => e.d === hoje());
  const k = hj.reduce((s,e) => s+e.k, 0), p = hj.reduce((s,e) => s+e.p, 0);
  $("#tk").textContent = `${Math.round(k)} / ${metas.k} kcal`;
  $("#tp").textContent = `${Math.round(p)} / ${metas.p} g`;
  $("#pk").value = Math.min(100, k/metas.k*100);
  $("#pp").value = Math.min(100, p/metas.p*100);
  $("#lista").innerHTML = hj.length ? hj.map(e =>
    `<li><span><b>${e.ref}</b> · ${Math.round(e.k)} kcal · ${r(e.p)} g prot<br><small>${e.nome}</small></span><button aria-label="Apagar" data-i="${e.i}">×</button></li>`).join("")
    : `<li>Nada salvo hoje. Monte seu prato na primeira aba.</li>`;
  document.querySelectorAll("#lista button").forEach(b => b.onclick = () => { diario.splice(b.dataset.i,1); gravar("np_diario",diario); renderDiario(); });
}
["#metaK","#metaP"].forEach(s => $(s).onchange = () => {
  metas = {k: Number($("#metaK").value) || 2000, p: Number($("#metaP").value) || 100};
  gravar("np_metas", metas); renderDiario();
});

// ===== Treino =====
function renderTreino() {
  $("#semana").innerHTML = TREINO.map(([dia,txt]) =>
    `<li class="${feitos[dia]?'feito':''}"><label><input type="checkbox" data-d="${dia}" ${feitos[dia]?'checked':''}><span><b>${dia}</b>: ${txt}</span></label></li>`).join("");
  document.querySelectorAll("#semana input").forEach(c => c.onchange = () => {
    feitos[c.dataset.d] = c.checked; gravar("np_treino", feitos); renderTreino();
  });
}

// ===== Suplementos =====
$("#cards").innerHTML = SUPLES.map(s =>
  `<details><summary>${s.t}<span class="tag ${s.med?'med':''}">${s.tag}</span></summary><p>${s.d}</p></details>`).join("");

$("#calcBtn").onclick = () => {
  const kg = Number($("#peso").value);
  $("#calcOut").textContent = kg >= 30
    ? `Para ${kg} kg, a faixa usual é de 3 a 5 g de creatina por dia. Meta de proteína para quem treina: cerca de ${Math.round(kg*1.6)} a ${Math.round(kg*2.2)} g por dia.`
    : "Informe um peso válido em kg.";
};

renderPrato(); renderTreino(); renderDiario();