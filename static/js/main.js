// main.js

import * as api from './api.js';
import * as ui from './ui.js';

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
    ui.updateURLParameters();
    loadObjekts();
}

// Listen for the custom event from ui.js
document.addEventListener('filtersChanged', fetchDataAfterFilterChange);

document.addEventListener('DOMContentLoaded', async function () {
    // Preventing dropdowns from undesired behavior
    ui.addDropDownToggleBehaviour();

    try {
        // Populate dropdowns with data from API calls
        const [members, seasonTitles] = await Promise.all([api.fetchMembers(), api.fetchSeasons()]);

        // Populate members from ARTMS
        ui.populateMultiSelectDropdown(members.artmsMembers, 'memberFilterList', "member");
        
        // Add a separator between artists groups
        const separator = document.createElement('li');
        separator.className = 'dropdown-divider';
        document.getElementById('memberFilterList').appendChild(separator);
        
        // Populate members from TRIPLES
        ui.populateMultiSelectDropdown(members.tripleSMembers, 'memberFilterList', "member");

        // Populate seasons
        ui.populateMultiSelectDropdown(seasonTitles, 'seasonFilterList');
        
        // Populate other filters
        ui.populateMultiSelectDropdown(ui.classes, 'classFilterList');
        ui.populateMultiSelectDropdown(['True', 'False'], 'transferableFilterList');

    } catch (error) {
        console.error('Error fetching filter data:', error);
    }

    // Attach event listener to reset filters button
    document.getElementById('resetFilters').addEventListener('click', function () {
        ui.resetAllFilters();
    });

    // Parse the URL and query string
    const url = new URL(window.location.href);
    const userQuery = url.pathname.split('/').pop();
    const urlParams = new URLSearchParams(url.search);

    // Check if there's a user query in the URL before fetching the address
    if (userQuery) {
        api.fetchAddress(userQuery).then(addr => {
            address = addr;
            applyFiltersFromURL(urlParams); // Load the objects only after getting the address

            document.getElementById('userName').textContent = userQuery;
            document.getElementById('userETHAddress').textContent = address;
        }).catch(error => {
            console.error(error);
            alert("Failed to fetch address. Please try again later.");
        });
    } else {
        console.error("No user query found in the URL.");
    }
});

function applyFiltersFromURL(urlParams) {
    // Set the 'sort' filter if it's in the URL params
    if (urlParams.has('sort')) {
        ui.setFilterActive('sort', urlParams.get('sort'));
    }

    // Set the 'member' filter if it's in the URL params
    if (urlParams.has('member')) {
        ui.setFilterActive('member', urlParams.get('member'));
    }

    // Set the 'season' filter if it's in the URL params
    if (urlParams.has('season')) {
        ui.setFilterActive('season', urlParams.get('season'));
    }

    // Set the 'class' filter if it's in the URL params
    if (urlParams.has('class')) {
        ui.setFilterActive('class', urlParams.get('class'));
    }

    // Set the 'transferable' filter if it's in the URL params
    if (urlParams.has('transferable')) {
        ui.setFilterActive('transferable', urlParams.get('transferable'));
    }

    // After setting filters, dispatch a custom event to indicate that filters have been changed
    document.dispatchEvent(new CustomEvent('filtersChanged'));
}

window.onscroll = function () {
    if ((window.innerHeight + window.scrollY) >= document.body.offsetHeight) {
        loadObjekts();
    }
};