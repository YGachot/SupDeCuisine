let recipes = [];

fetch('https://gist.githubusercontent.com/baiello/0a974b9c1ec73d7d0ed7c8abc361fc8e/raw/e598efa6ef42d34cc8d7e35da5afab795941e53e/recipes.json')
    .then(response => response.json())
    .then(data => {
        recipes = data;
        initializeFilters();
        displayRecipes(recipes);
    })
    .catch(error => console.error('Erreur de récupération des recettes:', error));


function displayRecipes(filteredRecipes) {
    const recipeContainer = document.getElementById('recipe-grid');
    recipeContainer.innerHTML = '';

    filteredRecipes.forEach(recipe => {
        const recipeCard = createRecipeCard(recipe);
        recipeContainer.appendChild(recipeCard);
    });

    updateCounter(filteredRecipes.length);
}


function createRecipeCard(recipe) {
    const recipeCard = document.createElement('div');
    recipeCard.className = 'recipe-card';

    const imageName = recipe.image.split('/').pop()
    const imagePath = `/SupDeCuisine/images/Recettes/${imageName}`;


    const ingredientsList = recipe.ingredients.map((ingredient, index) => {
        const ingredientName = ingredient.ingredient;
        const quantity = ingredient.quantity ? ingredient.quantity : '';
        const unit = ingredient.unit ? ingredient.unit : ''; 

    
        const ingredientText = `${ingredientName}${quantity ? ` ${quantity}` : ''}${unit ? ` ${unit}` : ''}`;


        return `<li><span class="ingredient" id="ingredient-${index}">${ingredientText}</span></li>`;
    }).join('');

    recipeCard.innerHTML = `
        <img src="${imagePath}" alt="${recipe.name}" class="recipe-image">
        <div class="recipe-details">
            <h2 class="recipe-title">${recipe.name}</h2>
            <p class="recipe-description">${recipe.description}</p>
            <h3>Ingrédients:</h3>
            <ul class="ingredients-list">
                ${ingredientsList}
            </ul>
        </div>
    `;
    return recipeCard;
}



function updateCounter(count) {
    const counterElement = document.getElementById('recipe-counter');
    counterElement.textContent = `${count} Recettes`;
}


function initializeFilters() {
    populateFilters();

    document.getElementById('ingredient-button').addEventListener('click', () => toggleFilterOptions('ingredient-options'));
    document.getElementById('appliance-button').addEventListener('click', () => toggleFilterOptions('appliance-options'));
    document.getElementById('utensil-button').addEventListener('click', () => toggleFilterOptions('utensil-options'));
}

function populateFilters() {
    const utensilOptions = document.getElementById('utensil-options');
    const applianceOptions = document.getElementById('appliance-options');
    const ingredientOptions = document.getElementById('ingredient-options');

    const utensilList = [...new Set(recipes.flatMap(recipe => recipe.ustensils))];
    const applianceList = [...new Set(recipes.map(recipe => recipe.appliance))];
    const ingredientList = [...new Set(recipes.flatMap(recipe => recipe.ingredients.map(ing => ing.ingredient)))];

    populateFilterOptions(utensilOptions, utensilList);
    populateFilterOptions(applianceOptions, applianceList);
    populateFilterOptions(ingredientOptions, ingredientList);
}


function populateFilterOptions(filterElement, options) {
    filterElement.innerHTML = '';
    options.forEach(optionValue => {
        const option = document.createElement('div');
        option.className = 'filter-option';
        option.textContent = optionValue;
        option.addEventListener('click', () => toggleSelection(option));
        filterElement.appendChild(option);
    });
}

function toggleSelection(optionElement) {
    optionElement.classList.toggle('selected');
    applyFilters();
}

function applyFilters() {
    const utensilFilters = Array.from(document.getElementById('utensil-options').getElementsByClassName('selected')).map(option => option.textContent);
    const applianceFilters = Array.from(document.getElementById('appliance-options').getElementsByClassName('selected')).map(option => option.textContent);
    const ingredientFilters = Array.from(document.getElementById('ingredient-options').getElementsByClassName('selected')).map(option => option.textContent);
    const query = document.querySelector('.rechercher-input').value.toLowerCase().trim();

    const filteredRecipes = recipes.filter(recipe => {
        const matchIngredients = ingredientFilters.every(ingredient =>
            recipe.ingredients.some(ing => ing.ingredient.toLowerCase().includes(ingredient.toLowerCase()))
        );

        const matchAppliances = applianceFilters.length === 0 || applianceFilters.some(appliance =>
            recipe.appliance.toLowerCase().includes(appliance.toLowerCase())
        );

        const matchUstensils = utensilFilters.length === 0 || utensilFilters.every(utensil =>
            recipe.ustensils.some(ust => ust.toLowerCase().includes(utensil.toLowerCase()))
        );

        const matchSearch = recipe.name.toLowerCase().includes(query) ||
            recipe.description.toLowerCase().includes(query) ||
            recipe.ingredients.some(ing => ing.ingredient.toLowerCase().includes(query));

        return matchIngredients && matchAppliances && matchUstensils && matchSearch;
    });

    displayRecipes(filteredRecipes);
    displayErrorMessage(filteredRecipes.length, query);
}

function displayErrorMessage(count, query) {
    const errorMessageElement = document.getElementById('error-message');
    if (count === 0) {
        errorMessageElement.textContent = `Aucune recette ne contient '${query}'.`;
        errorMessageElement.style.display = 'block';
    } else {
        errorMessageElement.style.display = 'none';
    }
}

function toggleFilterOptions(filterId) {
    const filterElement = document.getElementById(filterId);
    filterElement.style.display = (filterElement.style.display === 'block') ? 'none' : 'block';
}


fetchRecipes();
