// ui.js

import * as modal from './objektModal.js';

export const classes = [
    "Welcome", "First", "Special", "Double", "Zero"
];

const gridElem = document.getElementById('objektGrid');

export function createObjektElem(objekt) {
    const colElem = document.createElement('div');
    colElem.className = 'col mt-2';

    const cardElem = document.createElement('div');
    cardElem.className = 'objekt-card position-relative';  // position-relative for the flip button

    const imgElem = document.createElement('img');
    imgElem.className = 'objekt-image';
    imgElem.src = objekt.frontImage.replace('/4x', '/1x');
    imgElem.alt = `Objekt ${objekt.objektNo}`;

    // Flip button
    const flipButton = document.createElement('button');
    flipButton.className = 'btn position-absolute top-0 end-0 p-1 flip-button';  // Added custom class for flip button styling
    flipButton.innerHTML = '<i class="fas fa-redo"></i>';  // FontAwesome icon for flipping
    flipButton.style.zIndex = '1';  // Ensure button stays on top
    flipButton.addEventListener('click', function(event) {
        if (imgElem.src === objekt.frontImage.replace('/4x', '/1x')) {
            imgElem.src = objekt.backImage.replace('/4x', '/1x');
        } else {
            imgElem.src = objekt.frontImage.replace('/4x', '/1x');
        }
        event.stopPropagation();  // Avoid modal display on button click
    });

    const infoElem = document.createElement('div');
    infoElem.className = 'objekt-info text-center';  // text-center to center the objekt text

    const memberElem = document.createElement('span');
    memberElem.innerText = `${objekt.member} ${objekt.collectionNo}`;
    infoElem.appendChild(memberElem);

    cardElem.appendChild(imgElem);
    cardElem.appendChild(flipButton);  // Add flip button to card
    cardElem.appendChild(infoElem);

    cardElem.addEventListener('click', function() {
        modal.displayObjektModal(objekt);
    });

    colElem.appendChild(cardElem);

    return colElem;
}

export function clearGrid() {
    gridElem.innerHTML = '';
}

export function handleFilterChange() {

    clearGrid();

    // Emit a custom event indicating that the filters have changed
    document.dispatchEvent(new Event('filtersChanged'));
}

export function populateGrid(objekts) {
    for (const objekt of objekts) {
        const objektElem = createObjektElem(objekt);
        gridElem.appendChild(objektElem);
    }
}

export function updateTotalObjektsCount(count) {
    document.getElementById('objektCount').textContent = `${count || 0} Objekts`;
}

export function populateMultiSelectDropdown(array, elementId, dropdownType = "text") {

    array.forEach(item => {
        let li = document.createElement('li');
        li.className = 'clickable-option';

        if (dropdownType === "member") {
            // For members, expect item to be an object with name and profileImageUrl
            let img = document.createElement('img');
            img.src = item.profileImageUrl;
            img.alt = item.name;
            img.style.borderRadius = "50%";
            img.style.width = "30px";
            img.style.marginRight = "8px";
            li.appendChild(img);

            let nameNode = document.createTextNode(item.name);
            li.appendChild(nameNode);
        } else {
            // For other dropdown types, just expect text items
            li.innerText = item;
        }

        li.addEventListener('click', function (e) {
            // Toggle the active state
            if (li.classList.contains('active')) {
                li.classList.remove('active');
            } else {
                li.classList.add('active');
            }

            handleFilterChange();

            e.stopPropagation();
        });

        document.getElementById(elementId).appendChild(li);
    });
}

document.getElementById('sortFilterList').addEventListener('click', function(e) {
    // Check if the clicked element has the class 'clickable-option'
    if (e.target.classList.contains('clickable-option')) {
        // Deselect other options
        this.querySelectorAll('.clickable-option.active').forEach(activeElem => {
            activeElem.classList.remove('active');
        });

        // Select the clicked option
        e.target.classList.add('active');

        // Update the button label to reflect the selected option
        document.getElementById('sortDropdown').innerText = e.target.innerText;
        handleFilterChange();
    }
});

export function resetAllFilters() {
    // Remove the active class from all active options
    const activeOptions = document.querySelectorAll('.clickable-option.active');
    activeOptions.forEach(option => {
        option.classList.remove('active');
    });

    // Set the sorting dropdown back to "Newest"
    let newestOption = document.querySelector('#sortFilterList .clickable-option:nth-child(1)');
    if (newestOption) {
        newestOption.classList.add('active');
    }
    document.getElementById('sortDropdown').innerText = 'Newest';

    handleFilterChange();
}

export function addDropDownToggleBehaviour() {
    document.querySelectorAll('.dropdown-menu .dropdown-toggle').forEach(function (element) {
        element.addEventListener('click', function (e) {
            e.stopPropagation();
            e.preventDefault();

            let currentDropdownMenu = e.target.nextElementSibling;

            document.querySelectorAll('.dropdown-menu .dropdown-menu').forEach(innerMenu => {
                if (innerMenu !== currentDropdownMenu && innerMenu.classList.contains('show')) {
                    innerMenu.classList.remove('show');
                }
            });

            currentDropdownMenu.classList.toggle('show');
        });
    });
}

export const filters = {
    
    get memberValues() {
        return Array.from(document.querySelectorAll('#memberFilterList .clickable-option.active'))
            .map(li => li.innerText);
    },

    get seasonValues() {
        return Array.from(document.querySelectorAll('#seasonFilterList .clickable-option.active'))
            .map(li => li.innerText);
    },

    get classValues() {
        return Array.from(document.querySelectorAll('#classFilterList .clickable-option.active'))
            .map(li => li.innerText);
    },

    get transferableValues() {
        return Array.from(document.querySelectorAll('#transferableFilterList .clickable-option.active'))
            .map(li => li.innerText);
    },

    get sortOption() {
        return Array.from(document.querySelectorAll('#sortFilterList .clickable-option.active'))
            .map(li => li.innerText);
    }
};

export function setFilterActive(filterType, value) {
    // Common function to toggle 'active' class for li-based filters
    function toggleActiveClass(listSelector, value) {
        const options = document.querySelectorAll(listSelector + ' .clickable-option');
        options.forEach(option => {
            if (option.textContent.trim() === value) {
                option.classList.add('active');
            } else {
                option.classList.remove('active');
            }
        });
    }

    switch (filterType) {
        case 'sort':
            // If sort is using li elements as well
            toggleActiveClass('#sortFilterList', value);
            break;
        case 'member':
            toggleActiveClass('#memberFilterList', value);
            break;
        case 'season':
            toggleActiveClass('#seasonFilterList', value);
            break;
        case 'class':
            toggleActiveClass('#classFilterList', value);
            break;
        case 'transferable':
            // Assuming transferable uses li elements as well
            toggleActiveClass('#transferableFilterList', value === 'True' ? 'True' : 'False');
            break;
        default:
            console.warn(`Filter type ${filterType} is not recognized.`);
    }
}
