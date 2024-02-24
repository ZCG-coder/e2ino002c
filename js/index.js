$(main);

if ("serviceWorker" in navigator) {
  window.addEventListener("load", function() {
    navigator.serviceWorker
      .register("js/serviceWorker.js")
      .then(res => console.log("service worker registered"))
      .catch(err => console.log("service worker not registered", err))
  })
}

// Socket.IO
let socket = null;

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
const API_KEY = "<REPLACE WITH YOURS>";
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

function main() {
    loadSettings();

    const host = settings.host;
    const port = settings.port;
    socket = io.connect(`http://${host}:${port}`);

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

    // Theme
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', e => {
        const newColorScheme = e.matches ? "dark" : "light";
        if (settings.darkMode === "device")
            $(document.documentElement).attr("data-bs-theme", newColorScheme);
    });

    $(document.documentElement).attr("data-bs-theme", settings.darkMode);

    $(document.body).css("transform", `scale(${settings.zoom})`);
}
