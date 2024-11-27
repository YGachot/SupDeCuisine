let recipes = [];
let ingredientsList = [];

fetch('https://gist.githubusercontent.com/baiello/0a974b9c1ec73d7d0ed7c8abc361fc8e/raw/e598efa6ef42d34cc8d7e35da5afab795941e53e/recipes.json')
    .then(response => response.json())
    .then(data => {
        recipes = data;
        extractIngredients();
        initializeFilters();
        displayRecipes(recipes);
    })

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
    const imagePath = `/images/Recettes/${imageName}`;

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
    setupSearchBar();
}

function populateFilters() {
    populateCustomSelect('utensil-filter', [...new Set(recipes.flatMap(recipe => recipe.ustensils))]);
    populateCustomSelect('appliance-filter', [...new Set(recipes.map(recipe => recipe.appliance))]);
    populateCustomSelect('ingredient-filter', ingredientsList);
}

function populateCustomSelect(filterId, options) {
    const filterWrapper = document.getElementById(filterId);
    const optionsList = filterWrapper.querySelector('.custom-options-list');

    optionsList.innerHTML = '';

    options.forEach(option => {
        const optionElement = document.createElement('li');
        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.value = option;
        checkbox.id = `${filterId}-${option}`;

        const label = document.createElement('label');
        label.setAttribute('for', `${filterId}-${option}`);
        label.textContent = option;

        optionElement.appendChild(checkbox);
        optionElement.appendChild(label);

        checkbox.addEventListener('change', function () {
            applyFilters();
            optionsList.style.display = 'none'; // Ferme la liste déroulante après sélection
        });

        optionsList.appendChild(optionElement);
    });

    const selectInput = filterWrapper.querySelector('.custom-select-input');
    selectInput.addEventListener('focus', function () {
        optionsList.style.display = 'block';
    });

    selectInput.addEventListener('input', function () {
        const searchTerm = selectInput.value.toLowerCase();
        const filteredOptions = options.filter(option =>
            option.toLowerCase().includes(searchTerm)
        );
        updateOptionsList(filteredOptions, optionsList);
    });
}

function updateOptionsList(filteredOptions, optionsList) {
    optionsList.innerHTML = '';
    filteredOptions.forEach(option => {
        const optionElement = document.createElement('li');
        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.value = option;
        checkbox.id = `search-${option}`;

        const label = document.createElement('label');
        label.setAttribute('for', `search-${option}`);
        label.textContent = option;

        optionElement.appendChild(checkbox);
        optionElement.appendChild(label);

        checkbox.addEventListener('change', function () {
            applyFilters();
            optionsList.style.display = 'none'; // Ferme la liste déroulante après sélection
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
            const checkbox = document.createElement('input');
            checkbox.type = 'checkbox';
            checkbox.value = option;
            checkbox.id = `search-${option}`;

            const label = document.createElement('label');
            label.setAttribute('for', `search-${option}`);
            label.textContent = option;

            optionElement.appendChild(checkbox);
            optionElement.appendChild(label);

            checkbox.addEventListener('change', function () {
                applyFilters();
                optionsList.style.display = 'none'; // Ferme la liste déroulante après sélection
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
    const selectedUtensils = Array.from(document.querySelectorAll('#utensil-filter .custom-options-list input:checked')).map(input => input.value.toLowerCase());
    const selectedAppliances = Array.from(document.querySelectorAll('#appliance-filter .custom-options-list input:checked')).map(input => input.value.toLowerCase());
    const selectedIngredients = Array.from(document.querySelectorAll('#ingredient-filter .custom-options-list input:checked')).map(input => input.value.toLowerCase());
    const query = document.querySelector('.rechercher-input').value.toLowerCase().trim();

    const filteredRecipes = recipes.filter(recipe => {
        const matchIngredients = selectedIngredients.length === 0 || recipe.ingredients.some(ing => selectedIngredients.includes(ing.ingredient.toLowerCase()));
        const matchAppliances = selectedAppliances.length === 0 || selectedAppliances.includes(recipe.appliance.toLowerCase());
        const matchUstensils = selectedUtensils.length === 0 || recipe.ustensils.some(ust => selectedUtensils.includes(ust.toLowerCase()));
        const matchSearch = recipe.name.toLowerCase().includes(query) ||
            recipe.description.toLowerCase().includes(query) ||
            recipe.ingredients.some(ing => ing.ingredient.toLowerCase().includes(query));

        return matchIngredients && matchAppliances && matchUstensils && matchSearch;
    });

    displayRecipes(filteredRecipes);
    displaySelectedFilters(selectedIngredients, selectedAppliances, selectedUtensils, query);
    displayErrorMessage(filteredRecipes.length, query);
}

function resetFilters() {
    document.querySelectorAll('.custom-select-input').forEach(input => input.value = '');
    location.reload();
}

document.getElementById('reset-filters-button').addEventListener('click', resetFilters);

function displaySelectedFilters(selectedIngredients, selectedAppliances, selectedUtensils, query) {
    const selectedFiltersContainer = document.getElementById('selected-filters');
    selectedFiltersContainer.innerHTML = '';

    [...selectedIngredients, ...selectedAppliances, ...selectedUtensils].forEach(filter => {
        const filterElement = document.createElement('div');
        filterElement.className = 'selected-filter';
        filterElement.textContent = filter;

        filterElement.addEventListener('click', function () {
            const checkbox = document.querySelector(`input[value="${filter}"]`);
            checkbox.checked = false;
            applyFilters();
        });

        selectedFiltersContainer.appendChild(filterElement);
    });
}

function displayErrorMessage(recipeCount, query) {
    const errorMessageContainer = document.getElementById('error-message');
    if (recipeCount === 0) {
        errorMessageContainer.textContent = `Aucune recette trouvée pour "${query}".`;
    } else {
        errorMessageContainer.textContent = '';
    }
}
