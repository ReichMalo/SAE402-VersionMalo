/* VR/js/game-manager.js */

const INGREDIENT_MODELS = {
    'bun_bottom': '#model-bun-top',
    'patty': '#model-patty',
    'cheese': '#model-cheese',
    'tomato': '#model-tomato',
    'onion': '#model-onion',
    'bun_top': '#model-bun-bottom'
};

const TV_CONFIG = {
    width: 1.1,
    height: 0.7,
    depth: 0.35,
    screenWidth: 0.9,
    screenGlow: '#2c3e50',
    successColor: '#27ae60',
    failColor: '#c0392b'
};

const ORDER_SLOTS = [
    { x: -0.9, y: 1.65, z: -1.5 },
    { x: 0.9,  y: 1.65, z: -1.5 }
];

// Listes globales pour les recettes
window.listeRecipe1 = null;
window.listeRecipe2 = null;

function generateRandomRecipe() {
    const testElements = ['bun_bottom', 'patty', 'cheese', 'tomato', 'onion', 'bun_top'];
    const randomElement = testElements[Math.floor(Math.random() * testElements.length)];
    return [{ type: randomElement }];
}

AFRAME.registerComponent('recipe-display', {
    init: function() {
        this.recipe = generateRandomRecipe();
        this.el.classList.add('active-order');
        this.contentGroup = null;
        this.resultText = null;
        
        // Assigner la recette aux listes globales selon l'ID
        const parentId = this.el.getAttribute('id');
        const recipeList = this.recipe.map(item => item.type);
        
        if (parentId === 'order-slot-0') {
            window.listeRecipe1 = recipeList;
        } else if (parentId === 'order-slot-1') {
            window.listeRecipe2 = recipeList;
        }
        
        console.log('📺 Recettes:', { recipe1: window.listeRecipe1, recipe2: window.listeRecipe2 });

        this._buildTVDesign();
        this._fillScreenContent();
        this._addDebugButton();
    },

    getRecipe: function() { return this.recipe; },

    showResult: function(score, isPerfect) {
        if (this.contentGroup) this.contentGroup.setAttribute('visible', 'false');

        const screen = this.el.querySelector('.tv-screen');
        const color = score > 0 ? TV_CONFIG.successColor : TV_CONFIG.failColor;
        screen.setAttribute('color', color);

        if (!this.resultText) {
            this.resultText = document.createElement('a-text');
            this.resultText.setAttribute('position', `0 0 ${(TV_CONFIG.depth / 2) + 0.06}`);
            this.resultText.setAttribute('align', 'center');
            this.resultText.setAttribute('width', 2.5);
            this.el.appendChild(this.resultText);
        }

        const message = isPerfect ? "PARFAIT!\n" : (score > 0 ? "PAS MAL...\n" : "RATE...\n");
        this.resultText.setAttribute('value', `${message}+${score} PTS`);
        this.resultText.setAttribute('visible', 'true');

        setTimeout(() => { this.resetOrder(); }, 3000);
    },

    resetOrder: function() {
        if (this.contentGroup) {
            this.el.removeChild(this.contentGroup);
            this.contentGroup = null;
        }
        if (this.resultText) {
            this.resultText.setAttribute('visible', 'false');
        }
        const screen = this.el.querySelector('.tv-screen');
        if (screen) screen.setAttribute('color', TV_CONFIG.screenGlow);

        this.recipe = generateRandomRecipe();
        
        // Mettre à jour les listes globales
        const parentId = this.el.getAttribute('id');
        const recipeList = this.recipe.map(item => item.type);
        
        if (parentId === 'order-slot-0') {
            window.listeRecipe1 = recipeList;
        } else if (parentId === 'order-slot-1') {
            window.listeRecipe2 = recipeList;
        }
        
        this._fillScreenContent();
    },

    _buildTVDesign: function() {
        // Cadre
        const frame = document.createElement('a-box');
        frame.setAttribute('color', '#2c2c2c');
        frame.setAttribute('width', TV_CONFIG.width);
        frame.setAttribute('height', TV_CONFIG.height);
        frame.setAttribute('depth', TV_CONFIG.depth);
        this.el.appendChild(frame);

        // Écran
        const screenZ = (TV_CONFIG.depth / 2) + 0.01;
        const screen = document.createElement('a-plane');
        screen.classList.add('tv-screen');
        screen.setAttribute('color', TV_CONFIG.screenGlow);
        screen.setAttribute('width', TV_CONFIG.width - 0.1);
        screen.setAttribute('height', TV_CONFIG.height - 0.1);
        screen.setAttribute('position', `0 0 ${screenZ}`);
        screen.setAttribute('shader', 'flat');
        this.el.appendChild(screen);

        // Support plafond
        const ceilingMount = document.createElement('a-cylinder');
        ceilingMount.setAttribute('color', '#111');
        ceilingMount.setAttribute('height', 3);
        ceilingMount.setAttribute('radius', 0.03);
        ceilingMount.setAttribute('position', `0 ${TV_CONFIG.height / 2 + 1.5} 0`);
        this.el.appendChild(ceilingMount);
    },

    _fillScreenContent: function() {
        const screenZ = (TV_CONFIG.depth / 2) + 0.05;
        this.contentGroup = document.createElement('a-entity');
        this.contentGroup.setAttribute('position', `0 0 ${screenZ}`);
        this.el.appendChild(this.contentGroup);

        const itemsToRender = [];
        let totalContentWidth = 0;

        this.recipe.forEach((item) => {
            let scaleVal, widthSpace;
            if (item.type === 'tomato') { scaleVal = 0.10; widthSpace = 0.11; }
            else if (item.type.includes('bun')) { scaleVal = 0.18; widthSpace = 0.16; }
            else if (item.type === 'onion') { scaleVal = 0.21; widthSpace = 0.18; }
            else { scaleVal = 0.28; widthSpace = 0.24; }

            itemsToRender.push({ type: item.type, scale: `${scaleVal} ${scaleVal} ${scaleVal}`, width: widthSpace });
            totalContentWidth += widthSpace;
        });

        const maxAvailableWidth = TV_CONFIG.screenWidth - 0.15;
        let globalScale = 1;
        if (totalContentWidth > maxAvailableWidth) {
            globalScale = maxAvailableWidth / totalContentWidth;
            this.contentGroup.setAttribute('scale', `${globalScale} ${globalScale} ${globalScale}`);
        }

        let currentX = -(totalContentWidth / 2);
        itemsToRender.forEach((data) => {
            const modelId = INGREDIENT_MODELS[data.type];
            if (!modelId) return;

            const part = document.createElement('a-entity');
            part.setAttribute('gltf-model', modelId);
            part.setAttribute('scale', data.scale);

            let posX = currentX + (data.width / 2);
            if (data.type === 'tomato') posX -= 0.07;

            part.setAttribute('position', `${posX} 0 0`);
            part.setAttribute('rotation', '20 30 0');
            this.contentGroup.appendChild(part);

            currentX += data.width;
        });
    },

    _addDebugButton: function() {
        // Bouton de validation enlevé - validation automatique via burger-physx-detector
    }
});

AFRAME.registerComponent('order-manager', {
    schema: { interval: { type: 'number', default: 18000 }, maxOrders: { type: 'number', default: 2 } },
    init: function() { 
        this.timer = 0; 
        this.spawnOneOrder();
        const self = this;
        setTimeout(() => self.spawnOneOrder(), 150);
    },
    tick: function(time, timeDelta) {
        this.timer += timeDelta;
        if (this.timer >= this.data.interval) { this.spawnOneOrder(); this.timer = 0; }
    },
    spawnOneOrder: function() {
        const currentOrders = this.el.sceneEl.querySelectorAll('[recipe-display]').length;
        if (currentOrders >= this.data.maxOrders) return;
        for (let i = 0; i < ORDER_SLOTS.length; i++) {
            const slotId = `order-slot-${i}`;
            if (!document.getElementById(slotId)) { this.createOrderAt(ORDER_SLOTS[i], slotId); return; }
        }
    },
    createOrderAt: function(position, id) {
        const orderEl = document.createElement('a-entity');
        orderEl.setAttribute('id', id);
        orderEl.setAttribute('position', position);
        orderEl.setAttribute('recipe-display', '');

        // Animation d'apparition
        orderEl.setAttribute('animation', {
            property: 'position',
            from: `${position.x} ${position.y + 0.5} ${position.z}`,
            to: `${position.x} ${position.y} ${position.z}`,
            dur: 800,
            easing: 'easeOutQuad'
        });

        this.el.sceneEl.appendChild(orderEl);
    }
});