// ui.js

import { loadObjekts } from './main.js';

export const classes = [
    "Welcome", "First", "Special", "Double", "Zero"
];

const gridElem = document.getElementById('objektGrid');

export function createObjektElem(objekt) {
    const colElem = document.createElement('div');
    colElem.className = 'col mt-2';

    const cardElem = document.createElement('div');
    cardElem.className = 'objekt-card';

    const imgElem = document.createElement('img');
    imgElem.className = 'objekt-image';
    imgElem.src = objekt.frontImage.replace('/4x', '/1x');
    imgElem.alt = `Objekt ${objekt.objektNo}`;

    imgElem.addEventListener('click', function () {
        if (imgElem.src === objekt.frontImage.replace('/4x', '/1x')) {
            imgElem.src = objekt.backImage.replace('/4x', '/1x');
        } else {
            imgElem.src = objekt.frontImage.replace('/4x', '/1x');
        }
    });

    const infoElem = document.createElement('div');
    infoElem.className = 'objekt-info';

    const memberElem = document.createElement('p');
    memberElem.innerText = `${objekt.member} ${objekt.collectionNo}`;

    infoElem.appendChild(memberElem);

    cardElem.appendChild(imgElem);
    cardElem.appendChild(infoElem);
    colElem.appendChild(cardElem);
    return colElem;
}

export function clearGrid() {
    gridElem.innerHTML = '';
}

export function handleFilterChange() {
    console.log("handleFilterChange called");
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

export function populateMultiSelectDropdown(array, elementId) {
    array.forEach(item => {
        let li = document.createElement('li');
        li.className = 'clickable-option';
        li.innerText = item;

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

export function resetAllFilters() {
    const activeOptions = document.querySelectorAll('.clickable-option.active');
    activeOptions.forEach(option => {
        option.classList.remove('active');
    });
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
    }
};