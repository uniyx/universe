// landing.js

import * as api from './api.js';

$(document).ready(function () {
    $("#nickname").on("input", async function () {
        const query = $(this).val();

        // Enforce minimum search query length of 4
        if (query.length < 4) {
            $("#searchResults").empty().removeClass('show');
            return;
        }

        try {
            const users = await api.searchUsers(query);
            if (Array.isArray(users) && users.length) {
                let htmlResults = '';
                users.slice(0, 6).forEach(user => {
                    htmlResults += `
                        <a class="dropdown-item" href="/${user.nickname}">
                            ${user.nickname}
                        </a>`;
                });

                $("#searchResults").html(htmlResults).addClass('show');
            } else {
                console.error("Received unexpected data format:", users);
            }
        } catch (error) {
            console.error("Error fetching users:", error);
        }
    });

    // Directly navigate to user's page on form submission
    $("#searchForm").on("submit", function (e) {
        e.preventDefault();
        const query = $("#nickname").val();
        window.location.href = `/${query}`;
    });
});
