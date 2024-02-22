$(main);

// Socket.IO
const socket = io.connect("http://10.0.1.47:8000");

// Audio
let audios = {};
let loadedAudio = false;
let currentAudio = null;

// Chat
const converter = new showdown.Converter();
const API_ENDPOINT = "us-central1-aiplatform.googleapis.com";
const PROJECT_ID = "e2ino002c-chatbot-esxu";
const MODEL_ID = "text-bison-32k@002";
const LOCATION_ID = "us-central1";
// shh...!
const API_KEY = "ya29.a0AfB_byB7v_j1KB5v7-ya9WsChQB5pyElsuxhkncuJqLY9eikgGuzmhaWW5YnTui6ClIE8zaglYLxpOwNQ22Yz3MI0sr9CF1-nbD5iavSzR246AYXWY9T1iBJqHZinTpAPyIbSdd4KRqAbsmP89kt77pPZ2Rl_d5LFrS8h3CF6p4aCgYKAUUSARMSFQHGX2Mi5VGO9jcCCU8Ql5kfMER5PA0178";
const MONTHS_NAMES = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

// Plans
let loadedPlans = null;
let outingSessions = [];

// Outing
let loadedCodes = {};
let selectedOutingSession = null;
let startedScanning = false;

// Get hash
String.prototype.hashCode = function() {
    let hash = 0, i, chr;
    if (this.length === 0) return hash;
    for (i = 0; i < this.length; i++) {
        chr = this.charCodeAt(i);
        hash = ((hash << 5) - hash) + chr;
        hash |= 0; // Convert to 32bit integer
    }
    return hash;
}

function removeDuplicates(arr) {
	let array = arr;
	array.sort();
	return [...new Set(array)];
}

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
	let	subtitle = `Your score was ${score}.`;
	if (!passed) {
		title = "Try harder next time.";
		color = "#e35619";
	}
	else if (passed && !excellentScore) {
		title = "Good job!";
		color = "#e3dc19";
	}
	else {
		title = "You did it!";
		color = "#14cc17";
	}
	let icon = `<h1 style="color: ${color}" class="musicScoreModalSubtitleIcon">
					<i class="bi bi-${passed ? "check" : "x"}-octagon-fill"></i>
				</h1>`;
	
	const scoreModal = $("#musicScoreModal");
	$("#musicScoreModalTitle").text(title);
	$("#musicScoreModalSubtitle").html(icon + subtitle);
	scoreModal.modal("show");
}

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

function main() {
    const chatInput = $("#chat-input");
    chatInput.on("keyup", function (event) {
		// Send chat message on enter
        if (event.code === "Enter")
            sendMsg();
    });
	
	fetch("res/codes.json").then(r => r.text()).then(t => {
		const res = JSON.parse(t);
		loadedCodes = res;
	})
	
	socket.on("score", score => onReceiveScore(score));
	
	socket.on("receivePlans", t => {
		const planBody = $("#plan-body");
        plan = JSON.parse(t);
		planBody.html("");
	
		// Update global variables
		loadedPlans = plan;
		
        if (plan === {}) {
            console.error("Cannot load the plan");
            return;
        }
        let idx = 0;
        for (let key in plan) {
			let descPlaceholder = "Description (Optional)";
			if (plan[key].type === "4")
				descPlaceholder = "Things to bring (Newline-separated, Optional)";
            // noinspection JSUnresolvedReference
            planBody.html(planBody.html() +
							`<div class="input-group">
								<label class="input-group-text plan-time" for="plan-${idx}-type" id="plan-${idx}-label">
									${key}
								</label>
								<select class="form-select" id="plan-${idx}-type" onchange="onPlanTypeUpdate(${idx})">
								   <option selected value="0">Event Type...</option>
								   <option value="1">Work</option>
								   <option value="2">Listen to music / Relax</option>
								   <option value="3">Rest</option>
								   <option value="4">Outing</option>
								   <option disabled value>—————————————</option>
								   <option value="5">Others</option>a
								</select>
								<textarea aria-label="Description" class="form-control"
                                   placeholder="${descPlaceholder}"
								   type="text" id="plan-${idx}-description">${plan[key].desc}</textarea>
							</div>`);
            idx++;
        }

        for (let i = 0; i < idx; i++) {
            let type = $(`#plan-${i}-type`);
            type.val(plan[Object.keys(plan)[i]].type);
        }
		
		outingSessions = getAllOutingSessions();
		const outingSessionSelect = $("#outing-session-select");
		const outingTtbList = $("#outing-ttb");
		outingSessionSelect.html(`<option value="0" selected>Select...</option>`);
		outingTtbList.html("");
		for (let idx = 0; idx < outingSessions.length; idx++) {
			outingSessionSelect.html(outingSessionSelect.html() +
									`<option value="${idx + 1}">Session ${idx + 1}: ${outingSessions[idx][0]}</option>`);
		}
	});
	
	socket.on("getBarcodes", t => {
		const codes = t.split(/\n/g);
		
		for (let idx in codes) {
			const item = codes[idx];
			if (item === "")
				continue;
			
			const hs = loadedCodes[item].hashCode();
			console.log(hs)
			$(`#o-${hs}`).prop('checked', true);
		}
	});
}