function getAllOutingSessions() {
    let sessions = [];
    for (let key in loadedPlans) {
        if (loadedPlans[key]["type"] === "4") {
            let things = loadedPlans[key]["desc"].split("\n");
            for (let idx in things)
                things[idx] = things[idx].trim();
            sessions.push([key, things]);
        }
    }

    outingSessions = sessions;
    return outingSessions;
}

function loadOuting() {
    loadPlan();
}

function onOutingSessionChanged() {
    const outingSessionSelect = $("#outing-session-select");
    const outingTtbList = $("#outing-ttb");
    outingTtbList.html("");
    const idx = parseInt(outingSessionSelect.val()) - 1;

    // Selected nothing
    if (idx === -1) {
        selectedOutingSession = null;
        return;
    }

    let ttb = outingSessions[idx][1];
    ttb = removeDuplicates(ttb);

    for (let jdx = 0; jdx < ttb.length; jdx++) { // Yeah... idx -> jdx...
        outingTtbList.html(outingTtbList.html() +
                          `<div class="form-check">
                               <input class="form-check-input" id="o-${ttb[jdx].hashCode()}" disabled
                               type="checkbox" value="${jdx}">
                               <label class="form-check-label" for="outing-${jdx}">${ttb[jdx]}</label>
                           </div>`);
    }
    selectedOutingSession = idx;
}

function toggleScanning() {
    // Selected nothing
    if (selectedOutingSession === null)
        return;

    if (!startedScanning) {
        socket.emit("start_barcode");
        $("#scanning-start-stop").text("Stop");
        $("#scanning-i").attr("class", "bi bi-pause-fill");
    } else {
        socket.emit("stop_barcode");
        $("#scanning-start-stop").text("Start");
        $("#scanning-i").attr("class", "bi bi-play-fill");
    }
    startedScanning = !startedScanning;
}
