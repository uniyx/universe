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
    imgElem.src = objekt.frontImage; // Starting with the frontImage
    imgElem.alt = `Objekt ${objekt.objektNo}`;

    // Toggle the img source between frontImage and backImage when clicked
    imgElem.addEventListener('click', function() {
        if (imgElem.src === objekt.frontImage) {
            imgElem.src = objekt.backImage;
        } else {
            imgElem.src = objekt.frontImage;
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
    const memberValues = Array.from(document.querySelectorAll('#memberFilter input:checked'))
    .map(input => input.value);
    if (memberValues.length > 0) {
        apiUrl += `&member=${memberValues.join(',')}`;
    }

    const seasonValues = Array.from(document.getElementById('seasonFilter').selectedOptions)
        .map(option => option.value);
    if (seasonValues.length > 0) {
        apiUrl += `&season=${seasonValues.join(',')}`;
    }

    const classValues = Array.from(document.getElementById('classFilter').selectedOptions)
        .map(option => option.value);
    if (classValues.length > 0) {
        apiUrl += `&class=${classValues.join(',')}`;
    }

    const transferableValue = document.getElementById('transferableFilter').value;
    if (transferableValue !== "") {
        apiUrl += `&transferable=${transferableValue}`;
    }


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
    // Populate the multi-select dropdown for members
    members.forEach(member => {
        let li = document.createElement('li');
        let input = document.createElement('input');
        input.type = 'checkbox';
        input.id = `member-${member}`;
        input.value = member;
        input.classList.add('form-check-input');  // Bootstrap class

        let label = document.createElement('label');
        label.htmlFor = `member-${member}`;
        label.innerText = member;
        label.classList.add('form-check-label');  // Bootstrap class

        li.appendChild(input);
        li.appendChild(label);
        document.getElementById('memberFilter').appendChild(li);
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