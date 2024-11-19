async function fetchRecipes() {
    try {
        const response = await fetch('https://gist.githubusercontent.com/baiello/0a974b9c1ec73d7d0ed7c8abc361fc8e/raw/e598efa6ef42d34cc8d7e35da5afab795941e53e/recipes.json');
        const recipes = await response.json();
        displayRecipes(recipes);
    } catch (error) {
        console.error('Erreur lors de la récupération des recettes:', error);
    }
}

const imageBasePath = '/SupDeCuisine/images/Recettes/'

function createRecipeCard(recipe) {
    const recipeCard = document.createElement('div');
    recipeCard.className = 'recipe-card';

    const imageName = recipe.image.split('/').pop();
    const imagePath = `${imageBasePath}${imageName}`;

    recipeCard.innerHTML = `
        <img src="${imagePath}" alt="${imageName}" class="recipe-image">
        <div class="recipe-details">
            <h2 class="recipe-title">${recipe.name}</h2>
            <p class="recipe-description">${recipe.description}</p>
            <h3>Ingrédients:</h3>
            <ul class="recipe-ingredients">
                ${getIngredientsList(recipe.ingredients)}
            </ul>
        </div>
    `;

    return recipeCard;
}

function getIngredientsList(ingredients) {
    return ingredients.map(ingredient => `
        <li>${ingredient.quantity} ${ingredient.unit ? ingredient.unit + ' ' : ''}${ingredient.ingredient}</li>
    `).join('');
}

function displayRecipes(recipes) {
    const gridContainer = document.getElementById('recipe-grid');
    recipes.forEach(recipe => {
        const recipeCard = createRecipeCard(recipe);
        gridContainer.appendChild(recipeCard);
    });
}

fetchRecipes();
