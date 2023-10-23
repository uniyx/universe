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
    colElem.className = 'col mt-2';

    const cardElem = document.createElement('div');
    cardElem.className = 'objekt-card';

    const imgElem = document.createElement('img');
    imgElem.className = 'objekt-image';
    imgElem.src = objekt.frontImage.replace('/4x', '/1x'); // Use 1x resolution for the frontImage
    imgElem.alt = `Objekt ${objekt.objektNo}`;

    // Toggle the img source between frontImage and backImage when clicked
    imgElem.addEventListener('click', function () {
        if (imgElem.src === objekt.frontImage.replace('/4x', '/1x')) {
            imgElem.src = objekt.backImage.replace('/4x', '/1x');
        } else {
            imgElem.src = objekt.frontImage.replace('/4x', '/1x');
        }
    });

    // Add Member name and CollectionNo
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
    const memberValues = Array.from(document.querySelectorAll('#memberFilterList input:checked'))
        .map(input => input.value);
    if (memberValues.length > 0) {
        apiUrl += `&member=${memberValues.join(',')}`;
    }

    const seasonValues = Array.from(document.querySelectorAll('#seasonFilterList input:checked'))
        .map(option => option.value);
    if (seasonValues.length > 0) {
        apiUrl += `&season=${seasonValues.join(',')}`;
    }

    const classValues = Array.from(document.querySelectorAll('#classFilterList input:checked'))
        .map(option => option.value);
    if (classValues.length > 0) {
        apiUrl += `&class=${classValues.join(',')}`;
    }

    const transferableValues = Array.from(document.querySelectorAll('#transferableFilterList input:checked'))
        .map(input => input.value);
    console.log(transferableValues);
    if (transferableValues.length === 1) {
        apiUrl += `&transferable=${transferableValues[0]}`;
    }

    if (nextStartAfter) apiUrl += `&start_after=${nextStartAfter}`;

    // Make the API call and handle the response
    const response = await fetch(apiUrl);
    const data = await response.json();

    // Update the total objekts count
    document.getElementById('objektCount').textContent = `${data.total || 0} Objekts`;

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
document.addEventListener('DOMContentLoaded', function () {
    // Populate the multi-select dropdown for members
    function populateMultiSelectDropdown(array, elementId) {
        array.forEach(item => {
            let li = document.createElement('li');

            let input = document.createElement('input');
            input.type = 'checkbox';
            input.id = `${elementId}-${item}`;
            input.value = item;
            input.classList.add('form-check-input');  // Bootstrap class

            let label = document.createElement('label');
            label.htmlFor = `${elementId}-${item}`;
            label.innerText = item;
            label.classList.add('form-check-label');  // Bootstrap class

            li.appendChild(input);
            li.appendChild(label);
            document.getElementById(elementId).appendChild(li);
        });
    }

    populateMultiSelectDropdown(members, 'memberFilterList');
    populateMultiSelectDropdown(seasons, 'seasonFilterList');
    populateMultiSelectDropdown(classes, 'classFilterList');

    // Attach event listeners to the filters
    document.getElementById('memberFilterList').addEventListener('change', handleFilterChange);
    document.getElementById('seasonFilterList').addEventListener('change', handleFilterChange);
    document.getElementById('classFilterList').addEventListener('change', handleFilterChange);
    document.getElementById('transferableFilterList').addEventListener('change', handleFilterChange);

    // Stop click events from being propagated to parent dropdowns and prevent default Bootstrap behavior
    document.querySelectorAll('.dropdown-menu .dropdown-toggle').forEach(function (element) {
        element.addEventListener('click', function (e) {
            e.stopPropagation(); // Prevents the parent dropdown from closing
            e.preventDefault();  // Prevent default Bootstrap dropdown behavior

            let currentDropdownMenu = e.target.nextElementSibling;

            // Close all other inner dropdown-menus
            document.querySelectorAll('.dropdown-menu .dropdown-menu').forEach(innerMenu => {
                if (innerMenu !== currentDropdownMenu && innerMenu.classList.contains('show')) {
                    innerMenu.classList.remove('show');
                }
            });

            // Toggle the clicked dropdown menu
            currentDropdownMenu.classList.toggle('show');
        });
    });

    // Load initial objekts
    const queryString = window.location.pathname.split('/');
    const userQuery = queryString[queryString.length - 1];
    fetchAddress(userQuery).then(addr => {
        address = addr;
        console.log(address)
        loadObjekts();

        // Directly display the userQuery as the user's name
        document.getElementById('userName').textContent = userQuery;
        document.getElementById('userETHAddress').textContent = address;
    }).catch(error => {
        console.error(error);
        alert("Failed to fetch address. Please try again later.");
    });
});


// Handle infinite scroll
window.onscroll = function () {
    if ((window.innerHeight + window.scrollY) >= document.body.offsetHeight) {
        loadObjekts();
    }
};