function loadPlan() {
    // Already loaded plans, reload everything
    loadedPlans = {};

    const dateP = $("#plan-date");
    const planBody = $("#plan-body");

    // Update date selection
    let date = new Date();
    dateP.text(`${date.getDate()} ${MONTHS_NAMES[date.getMonth()]}, ${date.getFullYear()}`);

    let plan = {};
    // Request server for plans
    socket.emit("get_plans");
}

function onPlanTypeUpdate(idx) {
    const typeElem = $(`#plan-${idx}-type`);
    const descriptionElem = $(`#plan-${idx}-description`);
    const typeVal = typeElem.val();
    if (typeVal === "4")
        descriptionElem.attr("placeholder", "Things to bring (Newline-separated, Optional)")
    else
        descriptionElem.attr("placeholder", "Description (Optional)")
}

function savePlan() {
    if (loadedPlans === null) {
        console.error("Plans not loaded. Cannot save.");
        return;
    }

    let allPlans = {};
    for (let idx = 0; idx < Object.keys(loadedPlans).length; idx++) {
        let currentObj = {};
        const timeElem = $(`#plan-${idx}-label`);
        const typeElem = $(`#plan-${idx}-type`);
        const descriptionElem = $(`#plan-${idx}-description`);
        // Remove all spaces
        const time = timeElem.text().trim();
        const typeVal = typeElem.val();
        const description = descriptionElem.val();

        currentObj["type"] = typeVal;
        currentObj["desc"] = description;
        allPlans[time] = currentObj;
    }

    loadedPlans = allPlans;
    outingSessions = getAllOutingSessions();

    const stringifiedPlans = JSON.stringify(allPlans);
    socket.emit("save_plans", stringifiedPlans);
    return stringifiedPlans;
}
