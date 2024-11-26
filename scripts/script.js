let recipes = [];
let ingredientsList = [];

fetch('https://gist.githubusercontent.com/baiello/0a974b9c1ec73d7d0ed7c8abc361fc8e/raw/e598efa6ef42d34cc8d7e35da5afab795941e53e/recipes.json')
    .then(response => response.json())
    .then(data => {
        recipes = data;
        initializeFilters();
        displayRecipes(recipes);
        extractIngredients();
    })
    .catch(error => console.error('Erreur de récupération des recettes:', error));

function extractIngredients() {
    const ingredients = recipes.flatMap(recipe => recipe.ingredients.map(ingredient => ingredient.ingredient));
    ingredientsList = [...new Set(ingredients)];
}

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

    const imageName = recipe.image.split('/').pop();
    const imagePath = `/SupDeCuisine/images/Recettes/${imageName}`;

    recipeCard.innerHTML = `
    <img src="${imagePath}" alt="${recipe.name}" class="recipe-image">
    <div class="recipe-details">
        <h2 class="recipe-title">${recipe.name}</h2>
        <p class="recipe-description">${recipe.description}</p>
        <br>
        <h3>Ingrédients:</h3>
        <ul class="ingredients-list">
            ${recipe.ingredients.map((ingredient, index) => {
                const ingredientName = ingredient.ingredient;
                const quantity = ingredient.quantity ? ingredient.quantity : '';
                const unit = ingredient.unit ? ingredient.unit : '';
                return `
                    <li class="details-ingredients-list">
                        <span class="ingredient-name"${index}">${ingredientName}</span>
                        <br>
                        ${quantity ? `<span class="ingredient-quantity"${index}">${quantity}${unit ? ` ${unit}` : ''}</span>` : ''}
                    </li>`;
            }).join('')}
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
    setupIngredientSearch();
    setupSearchBar(); // Ajout de la gestion de la barre de recherche principale
}

function populateFilters() {
    populateCustomSelect('utensil-filter', [...new Set(recipes.flatMap(recipe => recipe.ustensils))]);
    populateCustomSelect('appliance-filter', [...new Set(recipes.map(recipe => recipe.appliance))]);
    populateCustomSelect('ingredient-filter', ingredientsList);
}

function populateCustomSelect(filterId, options) {
    const filterWrapper = document.getElementById(filterId);
    const selectInput = filterWrapper.querySelector('.custom-select-input');
    const optionsList = filterWrapper.querySelector('.custom-options-list');

    optionsList.innerHTML = '';

    options.forEach(option => {
        const optionElement = document.createElement('li');
        optionElement.textContent = option;
        optionElement.addEventListener('click', function () {
            selectInput.value = option;
            optionsList.style.display = 'none';
            applyFilters();
        });
        optionsList.appendChild(optionElement);
    });

    selectInput.addEventListener('input', function () {
        const searchTerm = selectInput.value.toLowerCase();
        const filteredOptions = options.filter(option =>
            option.toLowerCase().includes(searchTerm)
        );
        updateOptionsList(filteredOptions, optionsList);
    });

    selectInput.addEventListener('focus', function () {
        optionsList.style.display = 'block';
    });

    document.addEventListener('click', function (event) {
        if (!filterWrapper.contains(event.target) && event.target !== selectInput) {
            optionsList.style.display = 'none';
        }
    });
}

function updateOptionsList(filteredOptions, optionsList) {
    optionsList.innerHTML = '';
    filteredOptions.forEach(option => {
        const optionElement = document.createElement('li');
        optionElement.textContent = option;
        optionElement.addEventListener('click', function () {
            const selectInput = optionsList.closest('.custom-select-wrapper').querySelector('.custom-select-input');
            selectInput.value = option;
            optionsList.style.display = 'none';
            applyFilters();
        });
        optionsList.appendChild(optionElement);
    });

    if (filteredOptions.length === 0) {
        optionsList.style.display = 'none';
    }
}

function setupIngredientSearch() {
    const searchInput = document.getElementById('search-input');
    const optionsList = document.getElementById('options-list');
    const wrapper = document.querySelector('.custom-select-wrapper');

    function updateOptions(filteredOptions) {
        optionsList.innerHTML = '';
        filteredOptions.forEach(option => {
            const optionElement = document.createElement('li');
            optionElement.textContent = option;
            optionElement.addEventListener('click', function () {
                searchInput.value = option;
                optionsList.style.display = 'none';
                applyFilters();
            });
            optionsList.appendChild(optionElement);
        });

        if (filteredOptions.length === 0) {
            optionsList.style.display = 'none';
        }
    }

    searchInput.addEventListener('focus', function () {
        optionsList.style.display = 'block';
    });

    searchInput.addEventListener('input', function () {
        const searchTerm = searchInput.value.toLowerCase();
        const filteredOptions = ingredientsList.filter(option =>
            option.toLowerCase().includes(searchTerm)
        );
        updateOptions(filteredOptions);
    });

    document.addEventListener('click', function (event) {
        if (!wrapper.contains(event.target) && event.target !== searchInput) {
            optionsList.style.display = 'none';
        }
    });
}

// Nouvelle fonction pour rechercher dans toute la recipe card
function searchInRecipes(query) {
    const lowerCaseQuery = query.toLowerCase();

    const filteredRecipes = recipes.filter(recipe => {
        const inName = recipe.name.toLowerCase().includes(lowerCaseQuery);
        const inDescription = recipe.description.toLowerCase().includes(lowerCaseQuery);
        const inIngredients = recipe.ingredients.some(ingredient =>
            ingredient.ingredient.toLowerCase().includes(lowerCaseQuery)
        );

        return inName || inDescription || inIngredients;
    });

    return filteredRecipes;
}

// Configuration de la recherche globale
function setupSearchBar() {
    const searchInput = document.querySelector('.rechercher-input');

    searchInput.addEventListener('input', function (event) {
        const query = event.target.value.trim();

        if (query) {
            const results = searchInRecipes(query);
            displayRecipes(results);
            displayErrorMessage(results.length, query);
        } else {
            displayRecipes(recipes);
            displayErrorMessage(recipes.length, query);
        }
    });
}

function applyFilters() {
    const selectedUtensil = document.querySelector('#utensil-filter .custom-select-input').value.toLowerCase();
    const selectedAppliance = document.querySelector('#appliance-filter .custom-select-input').value.toLowerCase();
    const selectedIngredient = document.querySelector('#ingredient-filter .custom-select-input').value.toLowerCase();
    const query = document.querySelector('.rechercher-input').value.toLowerCase().trim();

    const filteredRecipes = recipes.filter(recipe => {
        const matchIngredients = !selectedIngredient || recipe.ingredients.some(ing => ing.ingredient.toLowerCase().includes(selectedIngredient));
        const matchAppliances = !selectedAppliance || recipe.appliance.toLowerCase().includes(selectedAppliance);
        const matchUstensils = !selectedUtensil || recipe.ustensils.some(ust => ust.toLowerCase().includes(selectedUtensil));
        const matchSearch = recipe.name.toLowerCase().includes(query) ||
            recipe.description.toLowerCase().includes(query) ||
            recipe.ingredients.some(ing => ing.ingredient.toLowerCase().includes(query));

        return matchIngredients && matchAppliances && matchUstensils && matchSearch;
    });

    displayRecipes(filteredRecipes);
    displayErrorMessage(filteredRecipes.length, query);
}

function resetFilters() {
    document.querySelectorAll('.custom-select-input').forEach(input => input.value = '');
    document.querySelector('.rechercher-input').value = '';

    displayRecipes(recipes);

    const errorMessageElement = document.getElementById('error-message');
    if (errorMessageElement) errorMessageElement.style.display = 'none';
}

document.getElementById('reset-filters-button').addEventListener('click', resetFilters);

function displayErrorMessage(count, query) {
    const errorMessageElement = document.getElementById('error-message');
    if (count === 0) {
        errorMessageElement.textContent = `Aucune recette ne contient '${query}'`;
        errorMessageElement.style.display = 'block';
    } else {
        errorMessageElement.style.display = 'none';
    }
}