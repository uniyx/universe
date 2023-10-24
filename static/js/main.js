// main.js

import * as api from './api.js';
import * as ui from './ui.js';
import * as modal from './objektModal.js';

let address = '';
let nextStartAfter = null;
let loading = false;
let hasMore = true;

export async function loadObjekts() {
    if (loading || !hasMore) return;
    loading = true;

    const memberValues = ui.filters.memberValues;
    const seasonValues = ui.filters.seasonValues;
    const classValues = ui.filters.classValues;
    const transferableValues = ui.filters.transferableValues;
    const sortOption = ui.filters.sortOption;

    try {
        const data = await api.fetchObjekts(address, nextStartAfter, memberValues, seasonValues, classValues, transferableValues, sortOption);

        ui.updateTotalObjektsCount(data.total);

        if (!data.hasNext) {
            nextStartAfter = null;
            hasMore = false;
        } else {
            nextStartAfter = data.nextStartAfter;
        }

        ui.populateGrid(data.objekts);
        loading = false;
    } catch (error) {
        console.error("Error loading objekts:", error);
    }
}

function fetchDataAfterFilterChange() {
    hasMore = true;
    nextStartAfter = null;
    loadObjekts();
}

// Listen for the custom event from ui.js
document.addEventListener('filtersChanged', fetchDataAfterFilterChange);

document.addEventListener('DOMContentLoaded', function () {
    //ui.populateMultiSelectDropdown(['oldest','newest','noAscending','noDescending'], 'sortFilterList');
    ui.populateMultiSelectDropdown(ui.classes, 'classFilterList');
    ui.populateMultiSelectDropdown(['True', 'False'], 'transferableFilterList');

    // Preventing dropdowns from undesired behavior
    ui.addDropDownToggleBehaviour();

    Promise.all([
        api.fetchMembers()
    ]).then(([members]) => {
        // Populate members from ARTMS
        ui.populateMultiSelectDropdown(members.artmsMembers, 'memberFilterList', "member");
    
        // Add a separator between artists groups
        const separator = document.createElement('li');
        separator.className = 'dropdown-divider';
        document.getElementById('memberFilterList').appendChild(separator);
    
        // Populate members from TRIPLES
        ui.populateMultiSelectDropdown(members.tripleSMembers, 'memberFilterList', "member");
    
    }).catch(error => {
        console.error('Error fetching members:', error);
    });
    
    api.fetchSeasons().then(seasonTitles => {
        ui.populateMultiSelectDropdown(seasonTitles, 'seasonFilterList');
        
    }).catch(error => {
        console.error('Error fetching seasons:', error);
    });

    document.getElementById('resetFilters').addEventListener('click', function () {
        ui.resetAllFilters();
    });

    const queryString = window.location.pathname.split('/');
    const userQuery = queryString[queryString.length - 1];

    api.fetchAddress(userQuery).then(addr => {
        address = addr;
        loadObjekts();

        document.getElementById('userName').textContent = userQuery;
        document.getElementById('userETHAddress').textContent = address;
    }).catch(error => {
        console.error(error);
        alert("Failed to fetch address. Please try again later.");
    });
});

window.onscroll = function () {
    if ((window.innerHeight + window.scrollY) >= document.body.offsetHeight) {
        loadObjekts();
    }
};