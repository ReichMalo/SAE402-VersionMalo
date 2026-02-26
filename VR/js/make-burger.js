/**
 * make-burger.js - Plate detection component
 * 
 * Détecte les ingrédients dans/près de l'assiette
 * La boite invisible enfant suit l'assiette pour détecter les collisions
 */

AFRAME.registerComponent('plate-target', {
  init: function() {
    this._items = [];
    this._tempList = [];
    this._detectionRadius = 0.5; // Rayon de détection autour de l'assiette
    this._lastItemsJson = '';
    
    // Créer une boite de collision enfant si elle n'existe pas
    this._ensureDetectionBox();
  },

  _ensureDetectionBox: function() {
    // Créer une boite wireframe en Three.js INDÉPENDANTE (pas attachée à l'assiette)
    if (!this._detectionBox) {
      // Créer la géométrie et le matériau
      const geometry = new THREE.BoxGeometry(0.25, 0.35, 0.25);
      const material = new THREE.LineBasicMaterial({ 
        color: 0x00FF00,
        linewidth: 2
      });
      
      // Créer les arêtes (wireframe)
      const edges = new THREE.EdgesGeometry(geometry);
      const wireframe = new THREE.LineSegments(edges, material);
      
      // Rendre invisible (mais la détection reste active)
      wireframe.visible = false;
      
      // Marquer pour que PhysX l'IGNORE COMPLÈTEMENT
      wireframe.userData.ignorePhysics = true;
      wireframe.userData.physxIgnore = true;
      wireframe.userData.noCollision = true;
      
      // Ajouter à la scène directement (pas à object3D de l'assiette!)
      const scene = this.el.sceneEl.object3D;
      scene.add(wireframe);
      
      this._detectionBox = wireframe;
    }
  },

  tick: function() {
    // S'assurer que la boite existe avant de tester
    if (!this._detectionBox) {
      this._ensureDetectionBox();
      return; // Attendre le prochain frame après création
    }

    // Récupérer la position et rotation de l'assiette
    const plateWorldPos = new THREE.Vector3();
    const plateWorldQuat = new THREE.Quaternion();
    this.el.object3D.getWorldPosition(plateWorldPos);
    this.el.object3D.getWorldQuaternion(plateWorldQuat);
    
    // Positionner le wireframe relatif à l'assiette (offset 0, 0.22, 0)
    const offset = new THREE.Vector3(0, 0.22, 0).applyQuaternion(plateWorldQuat);
    this._detectionBox.position.copy(plateWorldPos).add(offset);
    this._detectionBox.quaternion.copy(plateWorldQuat);

    this._tempList.length = 0;
    
    // Récupérer la position du wireframe en coordonnées mondiales
    const boxWorldPos = new THREE.Vector3();
    this._detectionBox.getWorldPosition(boxWorldPos);
    
    const boxSize = {
      x: 0.125,  // 0.25 / 2
      y: 0.2,    // 0.4 / 2
      z: 0.125   // 0.25 / 2
    };
    
    const allInteractable = this.el.sceneEl.querySelectorAll('.interactable');
    
    allInteractable.forEach(el => {
      if (el === this.el || !el.object3D) return;
      
      const type = el.getAttribute('item-type');
      if (!type || ['pan', 'plate', 'trash', 'spatula'].includes(type)) return;
      
      // Vérifier si l'élément est à l'intérieur de la boite
      const elWorldPos = new THREE.Vector3();
      el.object3D.getWorldPosition(elWorldPos);
      
      // Calculer la position relative par rapport au centre de la boite
      const relativePos = new THREE.Vector3().subVectors(elWorldPos, boxWorldPos);
      
      // Vérifier si dans les bounds
      if (Math.abs(relativePos.x) < boxSize.x &&
          Math.abs(relativePos.y) < boxSize.y &&
          Math.abs(relativePos.z) < boxSize.z) {
        this._tempList.push(type);
      }
    });
    
    // Trier par titre pour avoir une liste uniforme
    this._tempList.sort((a, b) => a.localeCompare(b));
    
    // Mettre à jour l'affichage si changement
    const newItemsJson = JSON.stringify(this._tempList);
    if (newItemsJson !== this._lastItemsJson) {
      this._lastItemsJson = newItemsJson;
      this._items = this._tempList.slice();

      if (this._items.length === 0) {
      } else {
      }
    }
  },

  // API pour accéder à la liste des items
  getItems: function() {
    return this._items.slice();
  }
});
