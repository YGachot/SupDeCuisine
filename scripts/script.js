let recipes = [];
let ingredientsList = [];

fetch('https://gist.githubusercontent.com/baiello/0a974b9c1ec73d7d0ed7c8abc361fc8e/raw/e598efa6ef42d34cc8d7e35da5afab795941e53e/recipes.json')
    .then(response => response.json())
    .then(data => {
        recipes = data;
        extractIngredients();
        initializeFilters();
        displayRecipes(recipes);
    });

function extractIngredients() {
    ingredientsList = [...new Set(recipes.flatMap(recipe => recipe.ingredients.map(ingredient => ingredient.ingredient)))];
}

function displayRecipes(filteredRecipes) {
    const recipeContainer = document.getElementById('recipe-grid');
    recipeContainer.innerHTML = '';

    filteredRecipes.forEach(recipe => recipeContainer.appendChild(createRecipeCard(recipe)));

    updateCounter(filteredRecipes.length);
}

function createRecipeCard(recipe) {
    const recipeCard = document.createElement('div');
    recipeCard.className = 'recipe-card';

    const imagePath = `/images/Recettes/${recipe.image.split('/').pop()}`;

    recipeCard.innerHTML = `
        <img src="${imagePath}" alt="${recipe.name}" class="recipe-image">
        <div class="recipe-details">
            <h2 class="recipe-title">${recipe.name}</h2>
            <p class="recipe-description">${recipe.description}</p>
            <br>
            <h3>Ingrédients:</h3>
            <ul class="ingredients-list">
                ${recipe.ingredients.map((ingredient, index) => createIngredientListItem(ingredient, index)).join('')}
            </ul>
        </div>
    `;
    return recipeCard;
}

function createIngredientListItem(ingredient, index) {
    const { ingredient: name, quantity = '', unit = '' } = ingredient;
    return `
        <li class="details-ingredients-list">
            <span class="ingredient-name" id="ingredient-${index}">${name}</span>
            <br>
            ${quantity ? `<span class="ingredient-quantity" id="quantity-${index}">${quantity}${unit ? ` ${unit}` : ''}</span>` : ''}
        </li>`;
}

function updateCounter(count) {
    document.getElementById('recipe-counter').textContent = `${count} Recettes`;
}

function initializeFilters() {
    populateFilters();
    setupIngredientSearch();
    setupSearchBar();
}

function populateFilters() {
    ['utensil', 'appliance', 'ingredient'].forEach(filter => {
        populateCustomSelect(`${filter}-filter`, getUniqueValuesForFilter(filter));
    });
}

function getUniqueValuesForFilter(filter) {
    if (filter === 'ingredient') return ingredientsList;
    return [...new Set(recipes.flatMap(recipe => recipe[filter + 's']))];
}

function populateCustomSelect(filterId, options) {
    const optionsList = document.getElementById(filterId).querySelector('.custom-options-list');
    optionsList.innerHTML = options.map(option => createFilterOption(filterId, option)).join('');

    const selectInput = document.querySelector(`#${filterId} .custom-select-input`);
    selectInput.addEventListener('focus', () => optionsList.style.display = 'block');
    selectInput.addEventListener('input', event => filterOptions(event, options, optionsList));
}

function createFilterOption(filterId, option) {
    const optionId = `${filterId}-${option}`;
    return `
        <li>
            <input type="checkbox" value="${option}" id="${optionId}">
            <label for="${optionId}">${option}</label>
        </li>`;
}

function filterOptions(event, options, optionsList) {
    const searchTerm = event.target.value.toLowerCase();
    const filteredOptions = options.filter(option => option.toLowerCase().includes(searchTerm));
    optionsList.innerHTML = filteredOptions.map(option => createFilterOption(optionsList.id, option)).join('');
    optionsList.style.display = filteredOptions.length ? 'block' : 'none';
}

function setupIngredientSearch() {
    const searchInput = document.getElementById('search-input');
    const optionsList = document.getElementById('options-list');
    const wrapper = document.querySelector('.custom-select-wrapper');

    searchInput.addEventListener('focus', () => optionsList.style.display = 'block');
    searchInput.addEventListener('input', () => updateSearchOptions(searchInput.value.toLowerCase(), optionsList));

    document.addEventListener('click', event => {
        if (!wrapper.contains(event.target) && event.target !== searchInput) optionsList.style.display = 'none';
    });
}

function updateSearchOptions(query, optionsList) {
    const filteredOptions = ingredientsList.filter(option => option.toLowerCase().includes(query));
    optionsList.innerHTML = filteredOptions.map(option => createSearchOption(option)).join('');
    optionsList.style.display = filteredOptions.length ? 'block' : 'none';
}

function createSearchOption(option) {
    return `
        <li>
            <input type="checkbox" value="${option}" id="search-${option}">
            <label for="search-${option}">${option}</label>
        </li>`;
}

function searchInRecipes(query) {
    const lowerCaseQuery = query.toLowerCase();

    return recipes.filter(recipe => 
        recipe.name.toLowerCase().includes(lowerCaseQuery) ||
        recipe.description.toLowerCase().includes(lowerCaseQuery) ||
        recipe.ingredients.some(ingredient => ingredient.ingredient.toLowerCase().includes(lowerCaseQuery))
    );
}

function setupSearchBar() {
    const searchInput = document.querySelector('.rechercher-input');
    searchInput.addEventListener('input', event => {
        const query = event.target.value.trim();
        const results = query ? searchInRecipes(query) : recipes;
        displayRecipes(results);
        displayErrorMessage(results.length, query);
    });
}

function applyFilters() {
    const selectedFilters = getSelectedFilters();
    const query = document.querySelector('.rechercher-input').value.toLowerCase().trim();

    const filteredRecipes = recipes.filter(recipe => 
        selectedFilters.every(filter => filter(recipe, query))
    );

    displayRecipes(filteredRecipes);
    displaySelectedFilters(selectedFilters, query);
    displayErrorMessage(filteredRecipes.length, query);
}

function getSelectedFilters() {
    const selectedUtensils = Array.from(document.querySelectorAll('#utensil-filter .custom-options-list input:checked')).map(input => input.value.toLowerCase());
    const selectedAppliances = Array.from(document.querySelectorAll('#appliance-filter .custom-options-list input:checked')).map(input => input.value.toLowerCase());
    const selectedIngredients = Array.from(document.querySelectorAll('#ingredient-filter .custom-options-list input:checked')).map(input => input.value.toLowerCase());

    return [
        recipe => selectedIngredients.length === 0 || recipe.ingredients.some(ing => selectedIngredients.includes(ing.ingredient.toLowerCase())),
        recipe => selectedAppliances.length === 0 || selectedAppliances.includes(recipe.appliance.toLowerCase()),
        recipe => selectedUtensils.length === 0 || recipe.ustensils.some(ust => selectedUtensils.includes(ust.toLowerCase())),
        recipe => recipe.name.toLowerCase().includes(query) || recipe.description.toLowerCase().includes(query) || recipe.ingredients.some(ing => ing.ingredient.toLowerCase().includes(query))
    ];
}

function displaySelectedFilters(selectedFilters, query) {
    const selectedFiltersContainer = document.getElementById('selected-filters');
    selectedFiltersContainer.innerHTML = '';

    selectedFilters.forEach(filter => {
        const filterElement = document.createElement('div');
        filterElement.className = 'selected-filter';
        filterElement.textContent = filter;

        filterElement.addEventListener('click', () => {
            document.querySelector(`input[value="${filter}"]`).checked = false;
            applyFilters();
        });

        selectedFiltersContainer.appendChild(filterElement);
    });
}

function displayErrorMessage(recipeCount, query) {
    const errorMessageContainer = document.getElementById('error-message');
    errorMessageContainer.textContent = recipeCount === 0 ? `Aucune recette trouvée pour "${query}".` : '';
}

function resetFilters() {
    document.querySelectorAll('.custom-select-input').forEach(input => input.value = '');
    location.reload();
}

document.getElementById('reset-filters-button').addEventListener('click', resetFilters);
