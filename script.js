document.addEventListener('DOMContentLoaded', () => {
    // ==========================================
    // CONFIGURAÇÕES GERAIS
    // ==========================================
    const START_DATE = new Date('2026-05-23T01:00:00'); // Coloque a data do início de vocês
    const STORY_DURATIONS = [10000, 20000, 15000, 10000]; // Tempos de cada cena (A 2 e 3 são maiores para leitura)

    const splashScreen = document.getElementById('splash-screen');
    const viewDashboard = document.getElementById('view-dashboard');
    const viewStories = document.getElementById('view-stories');
    const btnPlayMusic = document.getElementById('btn-play-music');
    const btnStartStories = document.getElementById('btn-start-stories');
    const audio = document.getElementById('bg-music');
    
    // ==========================================
    // 1. GESTÃO DO SPLASH SCREEN -> DASHBOARD
    // ==========================================
    setTimeout(() => {
        splashScreen.style.opacity = '0';
        setTimeout(() => {
            splashScreen.style.display = 'none';
            viewDashboard.classList.add('active');
            simulateDashboardProgress();
            startLiveTimer(); // Inicia o contador do painel
        }, 800);
    }, 2500); 

    // Simular progresso do Player no Dashboard
    function simulateDashboardProgress() {
        const fill = document.querySelector('.progress-fill');
        const timeCurrent = document.querySelector('.time-current');
        let seconds = 0;
        
        setInterval(() => {
            seconds++;
            const mins = Math.floor(seconds / 60);
            const secs = seconds % 60;
            timeCurrent.textContent = `${mins}:${secs.toString().padStart(2, '0')}`;
            fill.style.width = `${(seconds / 225) * 100}%`; 
        }, 1000);
    }

    // Play da música no painel
    let isMusicPlaying = false;
    btnPlayMusic.addEventListener('click', () => {
        if(isMusicPlaying) {
            audio.pause();
            btnPlayMusic.innerHTML = '<i class="fa-solid fa-play" style="margin-left: 4px;"></i>';
        } else {
            audio.volume = 0.5;
            audio.play().catch(() => console.log('Autoplay bloqueado.'));
            btnPlayMusic.innerHTML = '<i class="fa-solid fa-pause"></i>';
        }
        isMusicPlaying = !isMusicPlaying;
    });

    // ==========================================
    // 2. SISTEMA DE PARTÍCULAS
    // ==========================================
    const particlesContainer = document.getElementById('particles-container');
    function createParticle() {
        const heart = document.createElement('i');
        heart.className = 'fa-solid fa-heart particle-heart';
        heart.style.left = Math.random() * 100 + 'vw';
        heart.style.animationDuration = (Math.random() * 5 + 5) + 's'; 
        heart.style.fontSize = (Math.random() * 15 + 10) + 'px';
        particlesContainer.appendChild(heart);
        setTimeout(() => { heart.remove(); }, 10000); 
    }
    setInterval(createParticle, 500);

    // ==========================================
    // 3. CONTADOR TEMPO REAL (DASHBOARD)
    // ==========================================
    function startLiveTimer() {
        const timerContainer = document.getElementById('live-timer');
        setInterval(() => {
            const now = new Date();
            const diff = now - START_DATE;

            const daysTotal = Math.floor(diff / (1000 * 60 * 60 * 24));
            const years = Math.floor(daysTotal / 365.25);
            const months = Math.floor((daysTotal % 365.25) / 30.44);
            const days = Math.floor((daysTotal % 365.25) % 30.44);
            
            const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
            const minutes = Math.floor((diff / 1000 / 60) % 60);
            const seconds = Math.floor((diff / 1000) % 60);

            timerContainer.innerHTML = `
                <div class="time-item"><span class="time-value">${years}</span><span class="time-label">Anos</span></div>
                <div class="time-item"><span class="time-value">${months}</span><span class="time-label">Meses</span></div>
                <div class="time-item"><span class="time-value">${days}</span><span class="time-label">Dias</span></div>
                <div class="time-item"><span class="time-value">${hours}</span><span class="time-label">Horas</span></div>
                <div class="time-item"><span class="time-value">${minutes}</span><span class="time-label">Min</span></div>
                <div class="time-item"><span class="time-value">${seconds}</span><span class="time-label">Seg</span></div>
            `;
        }, 1000);
    }

    // ==========================================
    // 4. INICIAR RETROSPECTIVA (STORIES)
    // ==========================================
    btnStartStories.addEventListener('click', (e) => {
        e.preventDefault();
        if (!isMusicPlaying) {
            audio.volume = 0.5;
            audio.play().catch(e => console.log('Autoplay bloqueado.'));
        }

        viewDashboard.classList.remove('active');
        viewStories.classList.add('active');
        initStories();
    });

    const progressContainer = document.getElementById('progress-container');
    const scenes = document.querySelectorAll('.scene');
    const totalScenes = scenes.length;
    let currentScene = 0, storyTimer, isHolding = false, progressValue = 0;

    function initStories() {
        progressContainer.innerHTML = '';
        for (let i = 0; i < totalScenes; i++) {
            const bg = document.createElement('div'); bg.className = 'progress-bar-bg';
            const fill = document.createElement('div'); fill.className = 'progress-bar-fill';
            bg.appendChild(fill); progressContainer.appendChild(bg);
        }
        goToScene(0);
    }

    function goToScene(index) {
        if (index < 0) index = 0;
        if (index >= totalScenes) return;

        clearInterval(storyTimer);
        currentScene = index;

        scenes.forEach((scene, i) => scene.classList.toggle('active', i === index));

        const fills = document.querySelectorAll('.progress-bar-fill');
        fills.forEach((fill, i) => {
            if (i < index) fill.style.width = '100%';
            else fill.style.width = '0%';
        });

        progressValue = 0;
        const updateRate = 50; 
        const duration = STORY_DURATIONS[currentScene];
        const increment = (updateRate / duration) * 100;

        storyTimer = setInterval(() => {
            if(!isHolding) {
                progressValue += increment;
                if(currentScene === totalScenes - 1 && progressValue >= 100) {
                    fills[currentScene].style.width = `100%`;
                    clearInterval(storyTimer);
                    return; // Trava na última tela (Pedido)
                }
                fills[currentScene].style.width = `${progressValue}%`;
                if(progressValue >= 100) goToScene(currentScene + 1);
            }
        }, updateRate);
    }

    // Controle de Toque nos Stories (Ignorando cliques nas Cartas que viram)
    let touchStartTime = 0;

    function handleHoldStart(e) {
        if (e.target.closest('.interactive-layer') || e.target.closest('button')) return;
        isHolding = true;
        touchStartTime = Date.now();
    }
    function handleHoldEnd(e, direction) {
        if (e.target.closest('.interactive-layer') || e.target.closest('button')) return;
        isHolding = false;
        if (Date.now() - touchStartTime < 250) {
            if (direction === 'next' && currentScene < totalScenes - 1) goToScene(currentScene + 1);
            else if (direction === 'prev') goToScene(currentScene - 1);
        }
    }

    viewStories.addEventListener('pointerdown', handleHoldStart);
    viewStories.addEventListener('pointerup', (e) => {
        if (e.clientX > window.innerWidth / 2) handleHoldEnd(e, 'next');
        else handleHoldEnd(e, 'prev');
    });

   // ==========================================
    // 5. SISTEMA DE CARTAS QUE VIRAM (Flip Cards)
    // ==========================================
    const flipCards = document.querySelectorAll('.flip-card');
    flipCards.forEach(card => {
        card.addEventListener('click', (e) => {
            // Apenas vira a carta, REMOVEMOS a alteração da variável 'isHolding'
            // para o tempo do story continuar correndo normalmente
            card.classList.toggle('flipped');
            
            // Se for carta da Pilha de Memórias, mostra o botão "Próxima"
            if (card.classList.contains('stack-card')) {
                const btnNext = document.getElementById('btnNextMemory');
                if (card.classList.contains('flipped')) {
                    btnNext.classList.remove('hidden');
                } else {
                    btnNext.classList.add('hidden');
                }
            }
        });
    });

    // Lógica da Pilha de Memórias (Story 2)
    const stackCards = document.querySelectorAll('.stack-card');
    const btnNextMemory = document.getElementById('btnNextMemory');
    let activeCardIndex = 0;

    if (btnNextMemory) {
        btnNextMemory.addEventListener('click', () => {
            if (activeCardIndex < stackCards.length - 1) {
                // Remove a carta atual
                stackCards[activeCardIndex].classList.remove('active-card');
                stackCards[activeCardIndex].classList.remove('flipped');
                stackCards[activeCardIndex].classList.add('prev-card');
                
                // Entra a próxima
                activeCardIndex++;
                stackCards[activeCardIndex].classList.add('active-card');
                
                // Esconde botão e retoma tempo
                btnNextMemory.classList.add('hidden');
                isHolding = false; 
            } else {
                // Acabaram as cartas, avança a cena
                goToScene(currentScene + 1);
            }
        });
    }

    // ==========================================
    // 6. BOTÃO FUJÃO AVANÇADO E CONFETTIS
    // ==========================================
    const btnNo = document.getElementById('btn-no');
    const btnYes = document.getElementById('btn-yes');
    const successMsg = document.getElementById('success-msg');
    const decisionArea = document.querySelector('.decision-area');

    function moveButtonEvade(e) {
        if(e.type === 'touchstart') e.preventDefault();
        
        const maxX = window.innerWidth - btnNo.offsetWidth - 20;
        const maxY = window.innerHeight - btnNo.offsetHeight - 20;
        
        const randomX = Math.floor(Math.random() * maxX);
        const randomY = Math.floor(Math.random() * maxY);

        btnNo.style.position = 'fixed';
        btnNo.style.left = `${randomX}px`;
        btnNo.style.top = `${randomY}px`;
    }

    btnNo.addEventListener('mouseover', moveButtonEvade);
    btnNo.addEventListener('touchstart', moveButtonEvade, { passive: false });

    function triggerConfetti() {
        const colors = ['#ff007f', '#1ed760', '#ffffff', '#f1c40f', '#9b59b6'];
        for (let i = 0; i < 100; i++) {
            const confetti = document.createElement('div');
            confetti.classList.add('confetti');
            
            confetti.style.left = Math.random() * 100 + 'vw';
            confetti.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
            confetti.style.top = '-10px';
            
            const size = Math.random() * 8 + 5;
            confetti.style.width = size + 'px';
            confetti.style.height = size + 'px';
            
            const duration = Math.random() * 3 + 2;
            confetti.style.animationDuration = duration + 's';
            confetti.style.animationDelay = Math.random() * 2 + 's';
            
            document.body.appendChild(confetti);
            setTimeout(() => confetti.remove(), (duration + 2) * 1000);
        }
    }

    btnYes.addEventListener('click', () => {
        decisionArea.style.display = 'none';
        successMsg.classList.remove('hidden');
        triggerConfetti();
    });
});