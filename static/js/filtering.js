// Define filter options
const members = [
    "Seoyeon", "Hyerin", "Jiwoo", "Chaeyeon",
    "Yooyeon", "Soomin", "Nakyoung", "Yubin",
    "Kaede", "Dahyun", "Kotone", "Yeonji",
    "Nien", "Sohyun", "Xinyu", "Mayu"
];

const classes = [
    "Welcome", "First", "Special", "Double", "Zero"
];

const seasons = [
    "Atom01", "Binary01", "Cream01"
];

const gridElem = document.getElementById('objektGrid');
let address = '';
let nextStartAfter = null;
let loading = false;

function createObjektElem(objekt) {
    const colElem = document.createElement('div');
    colElem.className = 'col';

    const cardElem = document.createElement('div');
    cardElem.className = 'objekt-card';

    const imgElem = document.createElement('img');
    imgElem.className = 'objekt-image';
    imgElem.src = objekt.thumbnailImage;
    imgElem.alt = `Objekt ${objekt.objektNo}`;

    cardElem.appendChild(imgElem);
    colElem.appendChild(cardElem);
    return colElem;
}

async function fetchAddress(query) {
    const response = await fetch(`https://api.cosmo.fans/user/v1/search?query=${query}&sort=newest`);
    const data = await response.json();
    return data.results[0].address;
}

let hasMore = true;  // Initialize hasMore to true

async function loadObjekts() {
    console.log("loadObjekts called");

    if (loading || !hasMore) return;  // Check for hasMore here
    loading = true;

    // Build the base URL based on filters
    let apiUrl = `https://api.cosmo.fans/objekt/v1/owned-by/${address}?sort=newest`;

    // Append filtering parameters
    const memberValue = document.getElementById('memberFilter').value;
    if (memberValue) apiUrl += `&member=${memberValue}`;

    const seasonValue = document.getElementById('seasonFilter').value;
    if (seasonValue) apiUrl += `&season=${seasonValue}`;

    const classValue = document.getElementById('classFilter').value;
    if (classValue) apiUrl += `&class=${classValue}`;

    const transferableValue = document.getElementById('transferableFilter').value;
    if (transferableValue) apiUrl += `&transferable=${transferableValue}`;

    if (nextStartAfter) apiUrl += `&start_after=${nextStartAfter}`;

    // Make the API call and handle the response
    const response = await fetch(apiUrl);
    const data = await response.json();

    // Update the total objekts count
    document.getElementById('objektCount').textContent = `${data.total || 0} Objekts owned`;

    if (!data.hasNext) {
        nextStartAfter = null;
        hasMore = false;  // Set hasMore to false when there's no next page
    } else {
        nextStartAfter = data.nextStartAfter;
    }

    for (const objekt of data.objekts) {
        const objektElem = createObjektElem(objekt);
        gridElem.appendChild(objektElem);
    }

    loading = false;
}

// Reset variables and reload objekts when a filter changes
function handleFilterChange() {
    // Clear previous objekts from the grid
    gridElem.innerHTML = '';

    // Reset pagination and loading status
    hasMore = true;
    nextStartAfter = null;
    loadObjekts();
}

// Initialization
document.addEventListener('DOMContentLoaded', function() {
    // Populate dropdowns using the existing logic, e.g.:
    members.forEach(member => {
        let option = document.createElement('option');
        option.value = member;
        option.innerText = member;
        document.getElementById('memberFilter').appendChild(option);
    });

    seasons.forEach(season => {
        let option = document.createElement('option');
        option.value = season;
        option.innerText = season;
        document.getElementById('seasonFilter').appendChild(option);
    });

    classes.forEach(cls => {
        let option = document.createElement('option');
        option.value = cls;
        option.innerText = cls;
        document.getElementById('classFilter').appendChild(option);
    });

    // Attach event listeners to the filters
    document.getElementById('memberFilter').addEventListener('change', handleFilterChange);
    document.getElementById('seasonFilter').addEventListener('change', handleFilterChange);
    document.getElementById('classFilter').addEventListener('change', handleFilterChange);
    document.getElementById('transferableFilter').addEventListener('change', handleFilterChange);

    // Load initial objekts
    const queryString = window.location.pathname.split('/');
    const userQuery = queryString[queryString.length - 1];
    fetchAddress(userQuery).then(addr => {
        address = addr;
        console.log(address)
        loadObjekts();

        // Directly display the userQuery as the user's name
        document.getElementById('userName').textContent = userQuery;
    }).catch(error => {
        console.error(error);
        alert("Failed to fetch address. Please try again later.");
    });
});

// Handle infinite scroll
window.onscroll = function() {
    if ((window.innerHeight + window.scrollY) >= document.body.offsetHeight) {
        loadObjekts();
    }
};
