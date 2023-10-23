// api.js

export async function fetchAddress(query) {
    const response = await fetch(`https://api.cosmo.fans/user/v1/search?query=${query}&sort=newest`);
    const data = await response.json();

    console.log(data.results[0].address);

    return data.results[0].address;
}

export async function fetchMembers() {
    const [tripleSData, artmsData] = await Promise.all([
        fetch('https://api.cosmo.fans/artist/v1/tripleS').then(response => response.json()),
        fetch('https://api.cosmo.fans/artist/v1/artms').then(response => response.json())
    ]);

    const tripleSMembers = tripleSData.artist.members.map(member => member.name);
    const artmsMembers = artmsData.artist.members.map(member => member.name);

    return { tripleSMembers, artmsMembers };
}

export async function fetchSeasons() {
    const response = await fetch('https://api.cosmo.fans/season/v1/');
    const data = await response.json();
    return data.seasons.map(season => season.title);
}

export async function fetchObjekts(address, nextStartAfter, memberValues, seasonValues, classValues, transferableValues) {
    let apiUrl = `https://api.cosmo.fans/objekt/v1/owned-by/${address}?sort=newest`;

    if (memberValues && memberValues.length > 0) {
        apiUrl += `&member=${memberValues.join(',')}`;
    }
    if (seasonValues && seasonValues.length > 0) {
        apiUrl += `&season=${seasonValues.join(',')}`;
    }
    if (classValues && classValues.length > 0) {
        apiUrl += `&class=${classValues.join(',')}`;
    }
    if (transferableValues && transferableValues.length === 1) {
        apiUrl += `&transferable=${transferableValues[0]}`;
    }
    if (nextStartAfter) apiUrl += `&start_after=${nextStartAfter}`;

    const response = await fetch(apiUrl);
    return response.json();
}