/* --- script.js (Versão Roleta de Nomes) --- */

// --- Configurações ---
const ROULETTE_DURATION = 4000; // A roleta roda por 4 segundos
const NAME_SPEED = 80;          // Troca de nome a cada 80ms

// --- Estado da Aplicação ---
let namesPool = []; 
let isAnimating = false;
let drawCounter = 0; 
let rouletteInterval = null;
let stopTimeout = null;

// --- Elementos do DOM ---
const drawPanel = document.querySelector('.draw-panel');
const fileInput = document.getElementById('file-upload');
const fileStatus = document.getElementById('file-status');
const countStatus = document.getElementById('count-status');
const btnDraw = document.getElementById('btn-draw');
const display = document.getElementById('current-display');
const winnersList = document.getElementById('winners-list');
const progressBar = document.getElementById('progress-bar');

// --- 1. Evento de Clique para Pular (Skip) ---
drawPanel.addEventListener('click', (e) => {
    // Se clicar durante a animação (e não for no botão), pula direto para o fim
    if (isAnimating && e.target !== btnDraw && e.target !== fileInput) {
        stopRouletteAndShowWinner();
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

// --- 3. Lógica de Sorteio (Roleta) ---
btnDraw.addEventListener('click', () => {
    if (namesPool.length === 0 || isAnimating) return;

    isAnimating = true;
    btnDraw.disabled = true;
    btnDraw.textContent = "Sorteando... (Clique para parar)";
    
    // Muda estilo para roleta
    display.className = "mode-roulette";
    display.style.opacity = "1";

    // Inicia a animação da barra de progresso
    animateProgress(ROULETTE_DURATION);

    // Inicia o loop visual de nomes (Efeito Matrix/Roleta)
    rouletteInterval = setInterval(() => {
        const randomName = namesPool[Math.floor(Math.random() * namesPool.length)];
        display.textContent = randomName;
    }, NAME_SPEED);

    // Programa a parada automática após X segundos
    stopTimeout = setTimeout(() => {
        stopRouletteAndShowWinner();
    }, ROULETTE_DURATION);
});

function stopRouletteAndShowWinner() {
    // Limpa os timers para parar a animação
    if (rouletteInterval) clearInterval(rouletteInterval);
    if (stopTimeout) clearTimeout(stopTimeout);
    
    finalizeDraw();
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
    progressBar.style.transition = 'width 0.2s ease'; // Enche rápido ao parar
    progressBar.style.width = '100%';

    // Lógica Matemática do Sorteio
    const randomIndex = Math.floor(Math.random() * namesPool.length);
    const winnerName = namesPool.splice(randomIndex, 1)[0];
    const remaining = namesPool.length;

    const isFirst = (drawCounter === 1);
    const isLast = (remaining === 0);
    const showTrophy = isFirst || isLast;

    // Efeito Visual de "Pop" do Ganhador
    display.className = "mode-winner"; 
    // Reseta momentaneamente para reativar animação CSS
    display.style.opacity = "0"; 
    display.style.transform = "scale(0.5)";

    setTimeout(() => {
        display.textContent = winnerName;
        display.style.opacity = "1";
        display.style.transform = "scale(1)";
    }, 50);
    
    addToHistory(winnerName, showTrophy, isFirst, isLast);
    updateCount();
    
    isAnimating = false;
    rouletteInterval = null;
    stopTimeout = null;

    if (remaining > 0) {
        btnDraw.disabled = false;
        btnDraw.textContent = "SORTEAR NOME";
    } else {
        btnDraw.textContent = "Sorteio Finalizado";
        btnDraw.style.background = "#7f8c8d";
        countStatus.textContent = "Fim da lista!";
    }
}

// --- Funções Auxiliares de UI ---
function addToHistory(name, hasTrophy, isFirst, isLast) {
    const li = document.createElement('li');
    li.className = 'winner-item';
    
    if (hasTrophy) {
        li.classList.add('has-trophy');
        let suffix = '';
        if(isFirst) suffix = ' (Primeiro)';
        if(isLast) suffix = ' (Último)';
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
/* --- script.js (Adicione isso no FINAL do arquivo) --- */

// --- 4. Controle via Teclado (Tecla ENTER) ---
document.addEventListener('keydown', (event) => {
    // Verifica se a tecla pressionada foi o ENTER
    if (event.key === 'Enter') {
        event.preventDefault(); // Evita comportamentos padrões do navegador

        if (isAnimating) {
            // Se estiver rodando, o Enter funciona como "Parar Agora"
            stopRouletteAndShowWinner();
        } else {
            // Se estiver parado e o botão estiver ativo, o Enter funciona como "Sortear"
            if (!btnDraw.disabled) {
                btnDraw.click();
            }
        }
    }
});
