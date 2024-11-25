async function fetchRecipes() {
    try {
        const response = await fetch('https://gist.githubusercontent.com/baiello/0a974b9c1ec73d7d0ed7c8abc361fc8e/raw/e598efa6ef42d34cc8d7e35da5afab795941e53e/recipes.json');
        const recipes = await response.json();
        displayRecipes(recipes);

        const searchInput = document.querySelector('.rechercher-input');
        searchInput.addEventListener('input', () => filterRecipes(recipes, searchInput.value));
    } catch (error) {
        console.error('Erreur lors de la récupération des recettes:', error);
    }
}

const imageBasePath = '/SupDeCuisine/images/Recettes/';

function createRecipeCard(recipe) {
    const recipeCard = document.createElement('div');
    recipeCard.className = 'recipe-card';

    const imageName = recipe.image.split('/').pop();
    const imagePath = `${imageBasePath}${imageName}`;
    const ingredients = recipe.ingredients;

    recipeCard.innerHTML = `
        <img src="${imagePath}" alt="${imageName}" class="recipe-image">
        <div class="recipe-details">
            <h2 class="recipe-title">${recipe.name}</h2>
            <br>
            <h3 class="recipe-recipe">Recette</h3>
            <br>
            <p class="recipe-description">${recipe.description}</p>
            <br>
            <h3>Ingrédients:</h3>
            <br>
            <div class="ingredients-list">
                ${ingredients.map((ingredient, index) => `
                    <div class="ingredient-item ingredient-${index}">
                        <span class="ingredient-name">${ingredient.ingredient}</span>
                        <br>
                        <span class="ingredient-quantity">${ingredient.quantity ? ingredient.quantity : ''}${ingredient.quantity && ingredient.unit ? ' ' : ''}${ingredient.unit ? ingredient.unit : ''}</span>
                    </div>
                `).join('')}
            </div>

        </div>
    `;

    return recipeCard;
}

function updateCounter(count) {
    const counterElement = document.getElementById('recipe-counter');
    counterElement.textContent = `${count} Recettes`;
}

function displayErrorMessage(count, query) {
    const errorMessageElement = document.getElementById('error-message');
    if (count === 0) {
        errorMessageElement.textContent = `Aucune recette ne contient '${query}'`;
        errorMessageElement.style.display = 'block'; // Affiche le message
    } else {
        errorMessageElement.style.display = 'none'; // Cache le message
    }
}

function displayRecipes(recipes) {
    const gridContainer = document.getElementById('recipe-grid');
    gridContainer.innerHTML = '';
    recipes.forEach(recipe => {
        const recipeCard = createRecipeCard(recipe);
        gridContainer.appendChild(recipeCard);
    });
    updateCounter(recipes.length); 
}

function filterRecipes(recipes, query) {
    const lowerQuery = query.toLowerCase();
    const filteredRecipes = recipes.filter(recipe => {
        const inName = recipe.name.toLowerCase().includes(lowerQuery);
        const inDescription = recipe.description.toLowerCase().includes(lowerQuery);
        const inIngredients = recipe.ingredients.some(ingredient =>
            ingredient.ingredient.toLowerCase().includes(lowerQuery)
        );
        return inName || inDescription || inIngredients;
    });

    displayRecipes(filteredRecipes);
    displayErrorMessage(filteredRecipes.length, query); // Affiche le message d'erreur si nécessaire
}

fetchRecipes();
