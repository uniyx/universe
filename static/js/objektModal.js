// objektModal.js

export function displayObjektModal(objekt) {
    // Set objekt thumbnail
    const thumbnail = document.getElementById('objektThumbnail');
    thumbnail.src = objekt.frontImage;

    // Set title for the left panel
    const objektTitle = document.getElementById('objektTitle');
    objektTitle.innerText = `${objekt.member} - ${objekt.collectionNo}`;

    // Set objekt details
    const artistsElem = document.getElementById('objektArtists');
    artistsElem.innerText = objekt.artists.join(', ');

    const memberElem = document.getElementById('objektMember');
    memberElem.innerText = objekt.member;

    const seasonElem = document.getElementById('objektSeason');
    seasonElem.innerText = objekt.season;

    const classElem = document.getElementById('objektClass');
    classElem.innerText = objekt.class;

    const collectionElem = document.getElementById('objektCollection');
    collectionElem.innerText = objekt.collectionNo;

    const serialElem = document.getElementById('objektSerial');
    serialElem.innerText = objekt.objektNo;

    // Populate token information details
    const tokenIdElem = document.getElementById('objektTokenId');
    tokenIdElem.innerText = objekt.tokenId;

    const transferableElem = document.getElementById('objektTransferable');
    transferableElem.innerText = objekt.transferable ? 'Yes' : 'No';

    // Display the modal using vanilla JavaScript
    const modalElem = document.getElementById('objektModal');
    const modalInstance = new bootstrap.Modal(modalElem);
    modalInstance.show();
}


// Listen for objekt click events. This logic can be integrated where you handle the objekts in the UI.
document.addEventListener('click', function(event) {
    const target = event.target;

    // Assuming objekts have a specific class or data attribute to identify them
    if (target.classList.contains('objekt-class-name') || target.dataset.objektId) {
        // Fetch the objekt details, either from the DOM or an API call
        const objektDetails = {/* ... */};

        // Display the modal with the details
        showObjektModal(objektDetails);
    }
});
