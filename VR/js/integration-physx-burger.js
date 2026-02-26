/**
 * integration-physx-burger.js
 * Intègre le système de détection PhysX avec le système de recettes et de score
 * 
 * Ce système permet :
 * 1. Détection des ingrédients dans la zone de détection (plaque)
 * 2. Vérification de la stabilité physique (vélocité, position)
 * 3. Validation contre la recette active
 * 4. Incrémentation du score via ScoreManager
 */

AFRAME.registerComponent('burger-validator', {
  schema: {
    enabled: { type: 'boolean', default: true },
    detectorSelector: { type: 'string', default: '[burger-physx-detector]' },
    debugMode: { type: 'boolean', default: true }
  },

  init: function() {
    this.detector = null;
    this.lastValidationTime = 0;
    this.validationCooldown = 2000; // Éviter les validations trop fréquentes

    this.setupEventListeners();
  },

  setupEventListeners: function() {
    // Attendre que la scène soit chargée
    this.el.sceneEl.addEventListener('loaded', () => {
      this.detector = document.querySelector(this.data.detectorSelector);
    });
  },

  /**
   * Valider un burger manuellement (par exemple, via un bouton)
   */
  validateBurger: function() {
    const now = Date.now();
    if (now - this.lastValidationTime < this.validationCooldown) {
      return;
    }

    if (!this.detector) {
      return;
    }

    const detectorComponent = this.detector.components['burger-physx-detector'];
    if (!detectorComponent) {
      return;
    }

    // Vérifier que le burger est stable
    if (!detectorComponent.isStable) {
      return;
    }

    detectorComponent.forceValidate();
    this.lastValidationTime = now;
  },

  /**
   * Obtenir les infos du burger actuel
   */
  getBurgerStatus: function() {
    if (!this.detector) return null;

    const detectorComponent = this.detector.components['burger-physx-detector'];
    if (!detectorComponent) return null;

    const info = detectorComponent.getBurgerInfo();
    return {
      ...info,
      timestamp: Date.now(),
      isValidatable: info.isStable && info.count > 0
    };
  },

  /**
   * Logger le statut du burger
   */
  logStatus: function() {
    const status = this.getBurgerStatus();
    if (status) {
    }
  }
});

/**
 * HUD de débogage pour voir l'état du burger en temps réel
 */
AFRAME.registerComponent('burger-debug-hud', {
  schema: {
    position: { type: 'string', default: '0 3 -4' },
    width: { type: 'number', default: 1.5 },
    height: { type: 'number', default: 0.8 },
    updateInterval: { type: 'number', default: 100 }
  },

  init: function() {
    this.lastUpdate = 0;

    // Panel background
    const panel = document.createElement('a-plane');
    panel.setAttribute('width', this.data.width);
    panel.setAttribute('height', this.data.height);
    panel.setAttribute('material', 'color: #000; opacity: 0.8; transparent: true');
    this.el.appendChild(panel);

    // Text element
    this.textEl = document.createElement('a-text');
    this.textEl.setAttribute('value', 'Burger Debug\n\nInitializing...');
    this.textEl.setAttribute('align', 'left');
    this.textEl.setAttribute('baseline', 'top');
    this.textEl.setAttribute('width', this.data.width - 0.2);
    this.textEl.setAttribute('position', `-${this.data.width / 2 - 0.1} ${this.data.height / 2 - 0.1} 0.01`);
    this.textEl.setAttribute('color', '#00ff99');
    this.textEl.setAttribute('font-size', '32');
    this.el.appendChild(this.textEl);
  },

  tick: function(now) {
    if (now - this.lastUpdate < this.data.updateInterval) return;
    this.lastUpdate = now;

    // Récupérer le détecteur directement
    const detector = document.querySelector('[burger-physx-detector]');
    if (!detector || !detector.components['burger-physx-detector']) {
      this.textEl.setAttribute('value', 'Status: ❌ ERROR\nNo detector found');
      return;
    }

    const detectorComp = detector.components['burger-physx-detector'];
    const burger = detectorComp.getBurgerInfo();

    if (!burger) {
      this.textEl.setAttribute('value', 'Status: ❌ ERROR\nNo burger info');
      return;
    }

    let text = `═══════════════════\n`;
    text += `📊 BURGER STATUS\n`;
    text += `═══════════════════\n\n`;
    
    // Afficher le résultat de validation si récent (< 3 secondes)
    if (burger.lastValidation && (now - burger.lastValidationTime) < 3000) {
      text += `${burger.lastValidation.message}\n`;
      if (burger.lastValidation.score) {
        text += `Score: +${burger.lastValidation.score}\n`;
      }
      text += `───────────────────\n\n`;
    }
    
    text += `Détecté: ${burger.count}\n`;
    text += `Stable: ${burger.isStable ? '✅' : '⏳'}\n`;
    text += `Validable: ${burger.count > 0 && burger.isStable ? '✅ OUI' : '❌ NON'}\n\n`;

    if (burger.ingredients && burger.ingredients.length > 0) {
      text += `Ingrédients (${burger.count}):\n`;
      burger.ingredients.forEach((ing, idx) => {
        text += `  ${idx + 1}. ${ing.type}\n`;
      });
    } else {
      text += 'En attente d\'ingrédients...';
    }

    this.textEl.setAttribute('value', text);
  }
});

// Exposer une API globale pour faciliter les tests
window.BurgerIntegration = {
  validate: function() {
    const validator = document.querySelector('[burger-validator]');
    if (validator && validator.components['burger-validator']) {
      validator.components['burger-validator'].validateBurger();
    }
  },

  getStatus: function() {
    const validator = document.querySelector('[burger-validator]');
    if (validator && validator.components['burger-validator']) {
      return validator.components['burger-validator'].getBurgerStatus();
    }
    return null;
  },

  logStatus: function() {
    const validator = document.querySelector('[burger-validator]');
    if (validator && validator.components['burger-validator']) {
      validator.components['burger-validator'].logStatus();
    }
  }
};


