/**
 * game-ui.js - Menu de démarrage et système de timer
 */

AFRAME.registerComponent('game-ui', {
    schema: {
        gameDuration: { type: 'number', default: 60000 } // 60 secondes en ms
    },

    init: function() {
        this.gameActive = false;
        this.gameStartTime = null;
        this.timerDisplay = null;
        this.menuPanel = null;
        this.finalScore = 0;
        
        // Variables globales pour accès par d'autres composants
        window.gameActive = false;
        
        console.log('🎮 Game UI initialized');
        
        // Créer le menu initial
        this._createStartMenu();
    },

    _createStartMenu: function() {
        const scene = this.el.sceneEl;
        
        // Conteneur du menu
        this.menuPanel = document.createElement('a-entity');
        this.menuPanel.id = 'game-menu-panel';
        this.menuPanel.setAttribute('position', '-1.3 1.2 -0.3');
        this.menuPanel.setAttribute('rotation', '0 45 0');
        scene.appendChild(this.menuPanel);
        
        // Fond
        const bg = document.createElement('a-box');
        bg.setAttribute('width', 0.85);
        bg.setAttribute('height', 0.7);
        bg.setAttribute('depth', 0.1);
        bg.setAttribute('color', '#1a1a2e');
        bg.setAttribute('material', 'metalness: 0.6; roughness: 0.4');
        this.menuPanel.appendChild(bg);
        
        // Titre
        const title = document.createElement('a-text');
        title.setAttribute('value', 'VR BURGER');
        title.setAttribute('position', '0 0.15 0.1');
        title.setAttribute('align', 'center');
        title.setAttribute('width', 0.8);
        title.setAttribute('color', '#00FF00');
        title.setAttribute('font', 'monoid');
        title.setAttribute('scale', '1.5 1.5 1.5');
        this.menuPanel.appendChild(title);
        
        // Bouton "Jouer" - Grabable
        const playButton = document.createElement('a-entity');
        playButton.setAttribute('position', '0 -0.2 0.08');
        playButton.setAttribute('geometry', 'primitive: box; width: 0.4; height: 0.15; depth: 0.05');
        playButton.setAttribute('material', 'color: #27ae60; emissive: #27ae60; emissiveIntensity: 0.5');
        playButton.setAttribute('class', 'interactable');
        playButton.setAttribute('item-type', 'play-button');
        playButton.id = 'play-button';
        this.menuPanel.appendChild(playButton);
        
        const buttonText = document.createElement('a-text');
        buttonText.setAttribute('value', 'JOUER');
        buttonText.setAttribute('position', '0 0 0.04');
        buttonText.setAttribute('align', 'center');
        buttonText.setAttribute('color', '#000');
        buttonText.setAttribute('font', 'monoid');
        buttonText.setAttribute('scale', '0.75 0.75 0.75');
        playButton.appendChild(buttonText);
        
        // Events au grab
        playButton.addEventListener('grab-start', () => {
            console.log('🎮 Play button grabbed!');
            playButton.setAttribute('material', 'color: #1abc9c; emissive: #1abc9c; emissiveIntensity: 0.8');
        });
        
        playButton.addEventListener('grab-end', () => {
            console.log('🎮 Play button released - Starting game!');
            playButton.setAttribute('material', 'color: #27ae60; emissive: #27ae60; emissiveIntensity: 0.5');
            this._startGame();
        });
    },

    _startGame: function() {
        console.log('🎮 Game started!');
        
        this.gameActive = true;
        window.gameActive = true;  // Signaler globalement que le jeu est actif
        this.gameStartTime = Date.now();
        
        // Masquer le menu
        this.menuPanel.setAttribute('visible', 'false');
        
        // Créer l'affichage du timer
        this._createTimerDisplay();
        
        // Réinitialiser le score
        if (window.ScoreManager) {
            window.ScoreManager.data.totalScore = 0;
            window.ScoreManager.targetScore = 0;
            window.ScoreManager.displayedScore = 0;
        }
    },

    _createTimerDisplay: function() {
        const scene = this.el.sceneEl;
        
        // Conteneur du timer
        const timerContainer = document.createElement('a-entity');
        timerContainer.id = 'timer-display';
        timerContainer.setAttribute('position', '0 2.2 -3');
        scene.appendChild(timerContainer);
        
        // Fond
        const bg = document.createElement('a-box');
        bg.setAttribute('width', 1);
        bg.setAttribute('height', 0.5);
        bg.setAttribute('depth', 0.1);
        bg.setAttribute('color', '#0a0a0a');
        bg.setAttribute('material', 'metalness: 0.8; roughness: 0.2');
        timerContainer.appendChild(bg);
        
        // Texte du timer
        this.timerDisplay = document.createElement('a-text');
        this.timerDisplay.setAttribute('value', '60s');
        this.timerDisplay.setAttribute('position', '0 0 0.1');
        this.timerDisplay.setAttribute('align', 'center');
        this.timerDisplay.setAttribute('color', '#FF4444');
        this.timerDisplay.setAttribute('font', 'monoid');
        this.timerDisplay.setAttribute('scale', '2 2 2');
        timerContainer.appendChild(this.timerDisplay);
        
        this.timerContainer = timerContainer;
    },

    tick: function() {
        if (!this.gameActive || !this.gameStartTime) return;
        
        const elapsed = Date.now() - this.gameStartTime;
        const remaining = Math.max(0, this.data.gameDuration - elapsed);
        const seconds = Math.ceil(remaining / 1000);
        
        // Mettre à jour le timer
        if (this.timerDisplay) {
            this.timerDisplay.setAttribute('value', seconds + 's');
            
            // Changer la couleur selon le temps restant
            if (seconds <= 10) {
                this.timerDisplay.setAttribute('color', '#FF0000');
            } else if (seconds <= 20) {
                this.timerDisplay.setAttribute('color', '#FFAA00');
            }
        }
        
        // Fin du jeu
        if (remaining <= 0) {
            this._endGame();
        }
    },

    _endGame: function() {
        console.log('⏱️ Game ended!');
        
        this.gameActive = false;
        window.gameActive = false;  // Signaler globalement que le jeu n'est plus actif
        
        // Sauvegarder le score final AVANT de le remettre à 0 (utiliser targetScore qui est à jour)
        this.finalScore = window.ScoreManager ? (window.ScoreManager.targetScore || window.ScoreManager.data.totalScore || 0) : 0;
        console.log('💾 Score sauvegardé:', this.finalScore);
        
        // Masquer le timer
        if (this.timerContainer) {
            this.timerContainer.setAttribute('visible', 'false');
        }
        
        // Afficher l'écran fin avec le score sauvegardé
        this._createEndMenu();
    },

    _createEndMenu: function() {
        const scene = this.el.sceneEl;
        
        // Conteneur du menu fin
        this.endPanel = document.createElement('a-entity');
        this.endPanel.id = 'game-end-panel';
        this.endPanel.setAttribute('position', '-1.3 1.2 -0.3');
        this.endPanel.setAttribute('rotation', '0 45 0');
        scene.appendChild(this.endPanel);
        
        // Fond
        const bg = document.createElement('a-box');
        bg.setAttribute('width', 0.85);
        bg.setAttribute('height', 0.85);
        bg.setAttribute('depth', 0.1);
        bg.setAttribute('color', '#2c003e');
        bg.setAttribute('material', 'metalness: 0.6; roughness: 0.4');
        this.endPanel.appendChild(bg);
        
        // Titre
        const title = document.createElement('a-text');
        title.setAttribute('value', 'TIME UP !');
        title.setAttribute('position', '0 0.2 0.1');
        title.setAttribute('align', 'center');
        title.setAttribute('width', 0.8);
        title.setAttribute('color', '#FF6B6B');
        title.setAttribute('font', 'monoid');
        title.setAttribute('scale', '1.6 1.6 1.6');
        this.endPanel.appendChild(title);
        
        // Score final
        const finalScore = this.finalScore;
        const scoreText = document.createElement('a-text');
        scoreText.setAttribute('value', 'SCORE: ' + finalScore);
        scoreText.setAttribute('position', '0 -0.1 0.1');
        scoreText.setAttribute('align', 'center');
        scoreText.setAttribute('width', 0.8);
        scoreText.setAttribute('color', '#FFD700');
        scoreText.setAttribute('font', 'monoid');
        scoreText.setAttribute('scale', '1.5 1.5 1.5');
        this.endPanel.appendChild(scoreText);
        
        // Bouton "Rejouer" - Grabable
        const replayButton = document.createElement('a-entity');
        replayButton.setAttribute('position', '0 -0.35 0.08');
        replayButton.setAttribute('geometry', 'primitive: box; width: 0.5; height: 0.2; depth: 0.05');
        replayButton.setAttribute('material', 'color: #3498db; emissive: #3498db; emissiveIntensity: 0.5');
        replayButton.setAttribute('class', 'interactable');
        replayButton.setAttribute('item-type', 'replay-button');
        replayButton.id = 'replay-button';
        this.endPanel.appendChild(replayButton);
        
        const buttonText = document.createElement('a-text');
        buttonText.setAttribute('value', 'REJOUER');
        buttonText.setAttribute('position', '0 0 0.04');
        buttonText.setAttribute('align', 'center');
        buttonText.setAttribute('color', '#fff');
        buttonText.setAttribute('font', 'monoid');
        buttonText.setAttribute('scale', '0.5 0.5 0.5');
        replayButton.appendChild(buttonText);
        
        // Events au grab
        replayButton.addEventListener('grab-start', () => {
            console.log('🎮 Replay button grabbed!');
            replayButton.setAttribute('material', 'color: #2ecc71; emissive: #2ecc71; emissiveIntensity: 0.8');
        });
        
        replayButton.addEventListener('grab-end', () => {
            console.log('🎮 Replay button released - Restarting game!');
            
            // Reset le score AVANT de recommencer
            if (window.ScoreManager) {
                window.ScoreManager.data.totalScore = 0;
                window.ScoreManager.targetScore = 0;
                window.ScoreManager.displayedScore = 0;
                if (window.ScoreDisplayElement) {
                    window.ScoreDisplayElement.setAttribute('value', '0000');
                }
            }
            
            this.endPanel.remove();
            this._createStartMenu();
            this.menuPanel.setAttribute('visible', 'true');
        });
    }
});
