/**
 * burger-detector.js - Détection des burgers via la boite de l'assiette
 * 
 * Approche:
 * 1. Récupère la liste des ingrédients depuis l'assiette grabbée (plate-target component)
 * 2. Attend 1.5s de stabilité
 * 3. Compare avec les recettes et incrémente les points
 * 
 * Supporte plusieurs assiettes grabbées simultanément
 */

AFRAME.registerComponent('burger-detector', {
  schema: {
    stabilityTime: { type: 'number', default: 1500 }
  },

  init: function() {
    this.plates = []; // Array of {el, component, lastIngredients, stableStartTime, hasValidatedThisStable}
    this.lastCheckTime = 0;
    
    // Écouter les changements de grabbed plates
    this._setupPlateTracking();
  },

  _setupPlateTracking: function() {
    const scene = this.el.sceneEl;
    
    // Chercher tous les éléments avec plate-target
    const findPlates = () => {
      const allPlates = scene.querySelectorAll('[plate-target]');
      allPlates.forEach(plateEl => {
        // Vérifier si déjà suivi
        const isTracked = this.plates.some(p => p.el === plateEl);
        if (!isTracked) {
          const component = plateEl.components['plate-target'];
          if (component) {
            this.plates.push({
              el: plateEl,
              component: component,
              lastIngredients: [],
              stableStartTime: null,
              hasValidatedThisStable: false
            });
          }
        }
      });
      
      // Nettoyer les assiettes supprimées
      this.plates = this.plates.filter(p => p.el.parentElement !== null);
    };
    
    // Chercher les assiettes au démarrage
    setTimeout(() => findPlates(), 100);
    
    // Et régulièrement (pour les assiettes grabbées dans le temps)
    setInterval(findPlates, 1000);
  },

  tick: function(time) {
    // Check only every 500ms
    if (time - this.lastCheckTime < 500) return;
    this.lastCheckTime = time;
    
    // Traiter chaque assiette
    this.plates.forEach(plate => {
      if (!plate.component) return;
      
      // Récupérer la liste depuis le composant plate-target
      const currentList = plate.component.getItems();
      
      // Vérifier si la liste a changé
      if (JSON.stringify(currentList) !== JSON.stringify(plate.lastIngredients)) {
        plate.lastIngredients = currentList.slice();
        plate.stableStartTime = null;
        plate.hasValidatedThisStable = false;
      }
      
      // Vérifier la stabilité
      if (currentList.length > 0) {
        if (!plate.stableStartTime) {
          plate.stableStartTime = time;
        } else if (time - plate.stableStartTime > this.data.stabilityTime && !plate.hasValidatedThisStable) {
          // Valider quand stable pendant 1.5s
          this.validateBurger(currentList);
          plate.hasValidatedThisStable = true;
        }
      } else {
        plate.stableStartTime = null;
        plate.hasValidatedThisStable = false;
      }
    });
  },

  validateBurger: function(detectedList) {
    // Bloquer la validation si le jeu n'est pas actif
    if (!window.gameActive) {
      return;
    }
    
    // Trier la liste détectée pour comparaison
    const sortedDetected = detectedList.slice().sort();
    
    // Trier les recettes pour comparaison
    const sortedRecipe1 = window.listeRecipe1 ? window.listeRecipe1.slice().sort() : [];
    const sortedRecipe2 = window.listeRecipe2 ? window.listeRecipe2.slice().sort() : [];
    
    // Check recipe 1
    if (JSON.stringify(sortedDetected) === JSON.stringify(sortedRecipe1)) {
      const tv = document.getElementById('order-slot-0');
      if (tv && window.ScoreManager) {
        window.ScoreManager.validateOrder(sortedDetected, tv);
      }
      return;
    }
    
    // Check recipe 2
    if (JSON.stringify(sortedDetected) === JSON.stringify(sortedRecipe2)) {
      const tv = document.getElementById('order-slot-1');
      if (tv && window.ScoreManager) {
        window.ScoreManager.validateOrder(sortedDetected, tv);
      }
      return;
    }
  }
});
