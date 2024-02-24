function loadAudio() {
    if (loadedAudio)
        return;
    const url = "res/music.json";
    fetch(url)
        .then(r => r.text())
        .then(t => {
            const jsonObj = JSON.parse(t);
            const musicList = $("#music-list");

            // noinspection JSUnresolvedReference
            for (const idx in jsonObj.songs) {
                // noinspection JSUnresolvedReference
                const songObj = jsonObj.songs[idx];
                const audio = new Audio("res/music/" + songObj.file);
                // noinspection JSUnresolvedReference
                audios[songObj.uuid] = songObj;
                audio.addEventListener("loadedmetadata", () => {
                    const formattedLength = new Date(audio.duration * 1000)
                        .toISOString()
                        .slice(14, 19);

                    // noinspection JSUnresolvedReference
                    musicList.html(musicList.html() +
                        "<li class='list-group-item d-flex justify-content-between align-items-start'>\n" +
                        "    <div class='ms-2 me-auto'>\n" +
                        `    <div class='fw-bold'><a href='javascript:void(0)' onclick='playAudio("${songObj.uuid}")'>${songObj.name}</a></div>\n` +
                        "    </div>\n" +
                        `    <span class=\"badge bg-primary rounded-pill\">${formattedLength}</span>\n` +
                        "</li>");
                });
            }

            loadedAudio = true;
        });
}

function playAudio(uuid) {
    if (currentAudio && !currentAudio.paused) {
        return;
    }
    let songObj = audios[uuid];
    let audio = new Audio("res/music/" + songObj.file);
    audio.play().then(() => {
        currentAudio = audio;
        // console.log("Playing " + songObj.name);
        socket.emit("start_face");
    });

    audio.addEventListener("ended", function () {
        audio.currentTime = 0;
        // console.log("Ended");
        socket.emit("stop_face");
    });
}

function onReceiveScore(score) {
    let cvtScore = parseInt(score);
    let passed = cvtScore >= 50;
    let excellentScore = cvtScore >= 75;
    let color, title;
    let icoName;
    let subtitle = `Your score was ${score}.`;
    if (!passed) {
        title = "Try harder next time.";
        color = "#e35619";
        icoName = "bi-x-octagon-fill";
    }
    else if (passed && !excellentScore) {
        title = "Good job!";
        color = "#e3dc19";
        icoName = "bi-check";
    }
    else {
        title = "You did it!";
        color = "#14cc17";
        icoName = "bi-check";
    }
    let icon = `<h1 style="color: ${color}" class="musicScoreModalSubtitleIcon">
                    <i class="bi ${icoName}"></i>
                </h1>`;

    const scoreModal = $("#musicScoreModal");
    $("#musicScoreModalTitle").text(title);
    $("#musicScoreModalSubtitle").html(icon + subtitle);
    scoreModal.modal("show");
}
