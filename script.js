/* --- script.js (Versão com Clique para Pular) --- */

// --- Configurações de Tempo ---
const READING_TIME = 6000; // 6 Segundos para ler
const FADE_TIME = 1500;    // 1.5 Segundos para transição

// --- Banco de Frases ---
const funnyPhrases = [
    "Empenho não é dinheiro na conta, empenho é esperança documentada. 😅📄💸",
    "Pedir empenho sem saldo de dotação é a versão contábil de escrever carta pro Papai Noel. 🎅✉️🗑️",
    "Nota de Empenho é igual convite de casamento: cria expectativa, mas não garante que a festa vai ser boa. 💍😬🎭",
    "Liquidar despesa é a arte de achar erro na nota fiscal com amparo legal. 🔎📜😪",
    "Atesto de fiscal sem data não é documento, é prova de coragem. 🦸📅😤",
    "A liquidação é aquele momento que você vira o CSI da nota fiscal: procura evidência até onde não tem. 🕵️‍♂️🔦☕",
    "O fornecedor liga perguntando 'que horas cai'. Amigo, eu sou contador, não sou vidente do Banco Central. 📞🧮🔮",
    "Dia de pagamento é o único dia que o sistema cai. Isso não é TI, é karma. 💀💻😩",
    "Enviar remessa bancária sem erro de retorno é o meu conceito de milagre. ✨🏦🙏",
    "Restos a Pagar: a prova de que o passado condena... o orçamento deste ano. 👻💰😔",
    "Inscrição em Restos a Pagar é igual levar roupa suja pra lavar na casa da mãe: você resolveu o problema hoje, mas ele vai estar lá te esperando amanhã. 👚🧺😳",
    "O ano novo só começa depois que você fecha o balanço e cancela os Restos a Pagar prescritos. 🎉📒🔥",
    "Processo administrativo na prefeitura não tramita, ele peregrina. 🚶‍♂️⛪😑",
    "Dezembro na contabilidade pública não é clima de Natal, é Jogos Vorazes. 🎯🏹😰"
];

// --- Estado da Aplicação ---
let namesPool = []; 
let isAnimating = false;
let drawCounter = 0; 

// Variável para armazenar a função de cancelamento do timer
let skipCurrentWait = null; 

// --- Elementos do DOM ---
const drawPanel = document.querySelector('.draw-panel'); // Seleciona o painel inteiro
const fileInput = document.getElementById('file-upload');
const fileStatus = document.getElementById('file-status');
const countStatus = document.getElementById('count-status');
const btnDraw = document.getElementById('btn-draw');
const display = document.getElementById('current-display');
const winnersList = document.getElementById('winners-list');
const progressBar = document.getElementById('progress-bar');

// --- 1. Evento de Clique para Pular (Skip) ---
drawPanel.addEventListener('click', (e) => {
    // Só funciona se estiver animando e se o clique NÃO for no botão (para evitar conflito)
    if (isAnimating && e.target !== btnDraw && e.target !== fileInput) {
        if (skipCurrentWait) {
            skipCurrentWait(); // Chama a função que cancela o timer
        }
    }
});

// --- 2. Carregamento do Arquivo ---
fileInput.addEventListener('change', (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    
    reader.onload = (e) => {
        const text = e.target.result;
        namesPool = text.split('\n')
            .map(name => name.trim())
            .filter(name => name.length > 0);

        if (namesPool.length > 0) {
            fileStatus.textContent = `Arquivo carregado!`;
            fileStatus.style.color = 'var(--success)';
            drawCounter = 0; 
            resetUI();
            updateCount();
            btnDraw.disabled = false;
            
            display.textContent = "Pronto para Sortear";
            display.className = "mode-winner"; 
            display.style.opacity = "1";
            display.style.transform = "scale(1)";
        } else {
            fileStatus.textContent = "Arquivo vazio.";
            fileStatus.style.color = 'var(--danger)';
        }
    };
    reader.readAsText(file, 'UTF-8');
});

// --- 3. Lógica de Sorteio ---
btnDraw.addEventListener('click', async () => {
    if (namesPool.length === 0 || isAnimating) return;

    isAnimating = true;
    btnDraw.disabled = true;
    btnDraw.textContent = "Clique na tela para pular..."; // Feedback visual
    
    const selectedPhrases = getRandomPhrases(2);
    display.className = "mode-phrase";
    
    // Variável de controle: Se pularmos, ela vira true
    let skipped = false;

    // --- FRASE 1 ---
    display.textContent = selectedPhrases[0];
    await simpleWait(50); 
    display.classList.add('visible'); 
    animateProgress(READING_TIME);
    
    // Espera leitura OU clique
    skipped = await waitWithSkip(READING_TIME);
    if (skipped) return finalizeDraw(); // Se clicou, vai direto pro final

    display.classList.remove('visible'); 
    
    // Espera Fade Out OU clique
    skipped = await waitWithSkip(FADE_TIME);
    if (skipped) return finalizeDraw();

    // --- FRASE 2 ---
    display.textContent = selectedPhrases[1];
    await simpleWait(50);
    display.classList.add('visible'); 
    animateProgress(READING_TIME);
    
    skipped = await waitWithSkip(READING_TIME);
    if (skipped) return finalizeDraw();
    
    display.classList.remove('visible'); 
    skipped = await waitWithSkip(FADE_TIME);
    
    // Finaliza normalmente se ninguém clicou
    finalizeDraw();
});

// --- Funções Auxiliares de Tempo ---

// Espera simples (não cancelável) para animações curtas
function simpleWait(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

// Espera inteligente que pode ser cancelada pelo clique
function waitWithSkip(ms) {
    return new Promise(resolve => {
        // 1. Define o timer normal
        const timer = setTimeout(() => {
            skipCurrentWait = null; // Limpa referência
            resolve(false); // Retorna false (não pulou, acabou o tempo)
        }, ms);

        // 2. Define a função de "abortar" que o clique vai chamar
        skipCurrentWait = () => {
            clearTimeout(timer); // Cancela o timer normal
            resolve(true); // Retorna true (sim, o usuário pulou)
        };
    });
}

function getRandomPhrases(count) {
    const shuffled = [...funnyPhrases].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, count);
}

function animateProgress(duration) {
    progressBar.style.transition = 'none';
    progressBar.style.width = '0%';
    void progressBar.offsetWidth; 
    progressBar.style.transition = `width ${duration}ms linear`;
    progressBar.style.width = '100%';
}

function finalizeDraw() {
    drawCounter++;
    progressBar.style.transition = 'width 0.2s ease'; // Transição rápida ao pular
    progressBar.style.width = '100%'; 

    const randomIndex = Math.floor(Math.random() * namesPool.length);
    const winnerName = namesPool.splice(randomIndex, 1)[0];
    const remaining = namesPool.length;

    const isFirst = (drawCounter === 1);
    const isLast = (remaining === 0);
    const showTrophy = isFirst || isLast;

    // Garante que o texto anterior sumiu e reseta classes
    display.className = "mode-winner"; 
    display.style.opacity = "0"; // Reseta opacidade para animar entrada
    display.style.transform = "scale(0.5)";

    // Pequeno delay para garantir a troca visual
    setTimeout(() => {
        display.textContent = winnerName;
        display.style.opacity = "1";
        display.style.transform = "scale(1)";
    }, 100);
    
    addToHistory(winnerName, showTrophy, isFirst, isLast);
    updateCount();
    
    isAnimating = false;
    skipCurrentWait = null; // Reseta limpador

    if (remaining > 0) {
        btnDraw.disabled = false;
        btnDraw.textContent = "SORTEAR NOME";
    } else {
        btnDraw.textContent = "Sorteio Finalizado";
        btnDraw.style.background = "#7f8c8d";
        countStatus.textContent = "Fim da lista!";
    }
}

// --- Funções UI (History, Count, Reset) permanecem iguais ---
function addToHistory(name, hasTrophy, isFirst, isLast) {
    const li = document.createElement('li');
    li.className = 'winner-item';
    if (hasTrophy) {
        li.classList.add('has-trophy');
        let suffix = '';
        if(isFirst) suffix = ' ';
        if(isLast) suffix = ' ';
        li.innerHTML = `<span>${name}</span> <small style="margin-left:auto; font-size:0.7em; color:#999">${suffix}</small>`;
    } else {
        li.textContent = name;
    }
    winnersList.prepend(li);
}

function updateCount() {
    countStatus.textContent = `${namesPool.length} nomes na fila.`;
}

function resetUI() {
    winnersList.innerHTML = '';
    progressBar.style.width = '0%';
    btnDraw.textContent = "SORTEAR NOME";
    btnDraw.style.background = ""; 
}