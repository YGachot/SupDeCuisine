// updateCounter.test.js
const { updateCounter } = require('./path-to-your-file'); // Ajuste le chemin d'importation en fonction de ton fichier

describe('updateCounter', () => {
    let counterElement;

    // Avant chaque test, crée un élément #recipe-counter dans le DOM
    beforeEach(() => {
        // Simuler un élément DOM pour #recipe-counter
        document.body.innerHTML = `<div id="recipe-counter"></div>`;
        counterElement = document.getElementById('recipe-counter');
    });

    it('should update the counter text when called', () => {
        const count = 5;

        // Appeler la fonction avec un paramètre
        updateCounter(count);

        // Vérifier si le texte de l'élément a été mis à jour
        expect(counterElement.textContent).toBe('5 Recettes');
    });

    it('should handle zero count', () => {
        const count = 0;

        // Appeler la fonction avec zéro
        updateCounter(count);

        // Vérifier si le texte de l'élément a été mis à jour
        expect(counterElement.textContent).toBe('0 Recettes');
    });
});
