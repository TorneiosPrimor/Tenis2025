// Função para gerar tabela de jogos (um contra um)
function gerarTabelaJogos(jogadores, jogos, containerId) {
  let html = '';

  // Ordena os jogos: os com resultado vão para o topo
  const jogosOrdenados = [...jogos].sort((a, b) => b.sets.length - a.sets.length);

  jogosOrdenados.forEach((jogo, index) => {
    const sets = jogo.sets;
    const hasResultado = sets.length > 0;
    const isUltimoJogo = index === jogosOrdenados.length - 1;

    // Classe extra se for o último jogo (permite destaque ou controle por CSS/JS)
    const divClass = isUltimoJogo ? 'resultado ultimoJogo' : 'resultado';

    html += `<div class="${divClass}">`;
    html += '<table style="border: none; border-collapse: collapse;">';

    html += `
      <tr>
        <td></td>
        <td></td>
        <td>Resultado</td>
        <td>1º Set</td>
        <td>2º Set</td>
        <td>Tiebreak</td>
      </tr>
    `;

    if (hasResultado) {
      const setsJ1 = sets.filter(s => s[0] > s[1]).length;
      const setsJ2 = sets.filter(s => s[1] > s[0]).length;

      html += `
        <tr>
          <td><img src="assets/icons/user-solid.svg" alt=""></td>
          <td style="text-align: start; min-width: 3rem;">${jogo.jogador1}</td>
          <td style="font-weight: bold;">${setsJ1}</td>
          <td style="font-weight: lighter; color: gray;">${sets[0]?.[0] ?? ''}</td>
          <td style="font-weight: lighter; color: gray;">${sets[1]?.[0] ?? ''}</td>
          <td style="font-weight: lighter; color: gray;">${sets[2]?.[0] ?? ''}</td>
        </tr>
        <tr>
          <td><img src="assets/icons/user-solid.svg" alt=""></td>
          <td style="text-align: start; min-width: 3rem;">${jogo.jogador2}</td>
          <td style="font-weight: bold;">${setsJ2}</td>
          <td style="font-weight: lighter; color: gray;">${sets[0]?.[1] ?? ''}</td>
          <td style="font-weight: lighter; color: gray;">${sets[1]?.[1] ?? ''}</td>
          <td style="font-weight: lighter; color: gray;">${sets[2]?.[1] ?? ''}</td>
        </tr>
      `;
    } else {
      html += `
        <tr>
          <td><img src="assets/icons/user-solid.svg" alt=""></td>
          <td style="text-align: start; min-width: 6rem;">${jogo.jogador1}</td>
          <td colspan="4" style="color: gray; font-style: italic;">Aguardando resultado</td>
        </tr>
        <tr>
          <td><img src="assets/icons/user-solid.svg" alt=""></td>
          <td style="text-align: start; min-width: 6rem;">${jogo.jogador2}</td>
          <td colspan="4"></td>
        </tr>
      `;
    }

    html += '</table>';
    html += '</div>';
  });

  document.getElementById(containerId).innerHTML = html;
}

// Função para gerar tabela de classificação com critérios
function gerarTabelaClassificacao(jogadores, jogos, containerId) {
  const stats = {};
  jogadores.forEach(j => {
    stats[j] = {
      pontos: 0,
      jogos: 0,
      vitorias: 0,
      derrotas: 0,
      setsPro: 0,
      setsContra: 0,
      pontosPro: 0,
      pontosContra: 0,
    };
  });

  jogos.forEach(jogo => {
    const j1 = jogo.jogador1;
    const j2 = jogo.jogador2;
    const sets = jogo.sets || [];

    // Só processa se o jogo tiver sets preenchidos
    if (sets.length === 0) return;

    let setsJ1 = 0;
    let setsJ2 = 0;
    let pontosJ1 = 0;
    let pontosJ2 = 0;

    sets.forEach(s => {
        pontosJ1 += s[0];
        pontosJ2 += s[1];
        if (s[0] > s[1]) setsJ1++;
        else if (s[1] > s[0]) setsJ2++;
    });

    stats[j1].jogos++;
    stats[j2].jogos++;

    stats[j1].setsPro += setsJ1;
    stats[j1].setsContra += setsJ2;
    stats[j2].setsPro += setsJ2;
    stats[j2].setsContra += setsJ1;

    stats[j1].pontosPro += pontosJ1;
    stats[j1].pontosContra += pontosJ2;
    stats[j2].pontosPro += pontosJ2;
    stats[j2].pontosContra += pontosJ1;

    if (setsJ1 > setsJ2) {
        stats[j1].vitorias++;
        stats[j1].pontos += 3;
        stats[j2].derrotas++;
    } else if (setsJ2 > setsJ1) {
        stats[j2].vitorias++;
        stats[j2].pontos += 3;
        stats[j1].derrotas++;
    }
    });

  const ranking = Object.entries(stats).map(([nome, s]) => ({
    nome,
    pontos: s.pontos,
    jogos: s.jogos,
    vitorias: s.vitorias,
    derrotas: s.derrotas,
    setsPro: s.setsPro,
    setsContra: s.setsContra,
    saldoSet: s.setsPro - s.setsContra,
    pontosPro: s.pontosPro,
    pontosContra: s.pontosContra,
    saldoPontos: s.pontosPro - s.pontosContra,
  }));

  ranking.sort((a, b) => {
    if (b.pontos !== a.pontos) return b.pontos - a.pontos;
    if (b.saldoSet !== a.saldoSet) return b.saldoSet - a.saldoSet;
    if (b.saldoPontos !== a.saldoPontos) return b.saldoPontos - a.saldoPontos;
    return b.setsPro - a.setsPro;
  });
  
  
  let html = '<table border="1" cellspacing="0" cellpadding="5"><thead><tr><th>#</th><th>Jogador</th><th>P</th><th>J</th><th>V</th><th>D</th><th>SP</th><th>SC</th><th>SS</th><th>PP</th><th>PC</th><th>SP</th></tr></thead><tbody>';
  html += '<div class="legenda"> <p>SP - Sets Pró</p> <p>SC - Sets Contra</p> <p>SS - Saldo Sets</p> <p>PP - Pontos Pró</p> <p>PC - Pontos Contra</p> <p>SP - Saldo Pontos</p> </div>';
  ranking.forEach((j, i) => {
    html += `<tr>
      <td>${i + 1}</td>
      <td>${j.nome}</td>
      <td>${j.pontos}</td>
      <td>${j.jogos}</td>
      <td>${j.vitorias}</td>
      <td>${j.derrotas}</td>
      <td>${j.setsPro}</td>
      <td>${j.setsContra}</td>
      <td>${j.saldoSet}</td>
      <td>${j.pontosPro}</td>
      <td>${j.pontosContra}</td>
      <td>${j.saldoPontos}</td>
    </tr>`;
  });

  html += '</tbody></table>';
  document.getElementById(containerId).innerHTML = html;
}

// Função para ativar tabs
function ativarTabs() {
  const tabButtons = document.querySelectorAll('.tab-button');
  const tabContents = document.querySelectorAll('.tab-content');

  tabButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      // Remove active de todas tabs principais
      tabButtons.forEach(b => b.classList.remove('active'));
      tabContents.forEach(tc => tc.classList.remove('active'));

      // Ativa tab principal clicada
      btn.classList.add('active');
      const tabId = btn.dataset.tab;
      document.getElementById(tabId).classList.add('active');

      // Ativar automaticamente o grupo A dentro da tab ativa, se houver subtabs
      const subtabsContainer = document.getElementById(tabId).querySelector('.sub-tabs');
      if (subtabsContainer) {
        const subTabButtons = subtabsContainer.querySelectorAll('.sub-tab-button');
        const groupContents = document.getElementById(tabId).querySelectorAll('.group-content');

        // Remove active de todas subtabs e conteúdos dentro da tab ativa
        subTabButtons.forEach(b => b.classList.remove('active'));
        groupContents.forEach(gc => gc.classList.remove('active'));

        // Ativa a primeira subtab (Grupo A) automaticamente
        if (subTabButtons.length > 0) {
          subTabButtons[0].classList.add('active');
          const firstGroupId = subTabButtons[0].dataset.group;
          document.getElementById(firstGroupId).classList.add('active');
        }
      }
    });
  });

  // Subtabs (grupos) - ativar ao clicar normalmente
  const subTabButtons = document.querySelectorAll('.sub-tab-button');
  const groupContents = document.querySelectorAll('.group-content');

  subTabButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      // Remove active de todas subtabs e grupos
      subTabButtons.forEach(b => b.classList.remove('active'));
      groupContents.forEach(gc => gc.classList.remove('active'));

      // Ativa a subtab clicada e seu grupo correspondente
      btn.classList.add('active');
      document.getElementById(btn.dataset.group).classList.add('active');
    });
  });
}


// Inicializa a página
function inicializar() {
  // Intermediário Grupo A
  gerarTabelaJogos(dadosCampeonato.intermediario.grupoA.jogadores, dadosCampeonato.intermediario.grupoA.jogos, 'jogos-grupo-a-int');
  gerarTabelaClassificacao(dadosCampeonato.intermediario.grupoA.jogadores, dadosCampeonato.intermediario.grupoA.jogos, 'classificacao-grupo-a-int');

  // Intermediário Grupo B
  gerarTabelaJogos(dadosCampeonato.intermediario.grupoB.jogadores, dadosCampeonato.intermediario.grupoB.jogos, 'jogos-grupo-b-int');
  gerarTabelaClassificacao(dadosCampeonato.intermediario.grupoB.jogadores, dadosCampeonato.intermediario.grupoB.jogos, 'classificacao-grupo-b-int');

  // Feminino/Kids Grupo A
  gerarTabelaJogos(dadosCampeonato.femininoKids.grupoA.jogadores, dadosCampeonato.femininoKids.grupoA.jogos, 'jogos-grupo-a-fk');
  gerarTabelaClassificacao(dadosCampeonato.femininoKids.grupoA.jogadores, dadosCampeonato.femininoKids.grupoA.jogos, 'classificacao-grupo-a-fk');

  // Feminino/Kids Grupo B
  gerarTabelaJogos(dadosCampeonato.femininoKids.grupoB.jogadores, dadosCampeonato.femininoKids.grupoB.jogos, 'jogos-grupo-b-fk');
  gerarTabelaClassificacao(dadosCampeonato.femininoKids.grupoB.jogadores, dadosCampeonato.femininoKids.grupoB.jogos, 'classificacao-grupo-b-fk');

  // Avançado (grupo único)
  gerarTabelaJogos(dadosCampeonato.avancado.jogadores, dadosCampeonato.avancado.jogos, 'jogos-avancado');
  gerarTabelaClassificacao(dadosCampeonato.avancado.jogadores, dadosCampeonato.avancado.jogos, 'classificacao-avancado');

  ativarTabs();
}

// Executa a inicialização ao carregar a página
window.addEventListener('DOMContentLoaded', inicializar);
