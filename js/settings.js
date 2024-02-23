/*
* Application settings:
* - Host
* - Port
* - Theme
*/

settings = {
    "darkMode": "device",
    "zoom": "100%",
    "host": "10.0.1.47",
    "port": 8000
};

DARK_MODE = ["device", "dark", "light"];


function loadSettings() {
    let tempSettings = Cookies.get("settings");

    // No settings
    if (tempSettings === undefined) {
        saveSettings();
        return;
    }

    settings = JSON.parse(tempSettings);

    $("#settings-host").attr("value", settings.host);
    $("#settings-port").attr("value", settings.port);
    $("#settings-dark").val(settings.darkMode);
    $("#settings-zoom").val(settings.zoom);
}

function validateIp(ip) {
    const ipParts = ip.split(/\./g);

    if (ipParts.length !== 4)
        return false;

    for (let i = 0; i < 4; i++) {
        if (ipParts[i] > 255)
            return false;
    }

    return true;
}

function isNumeric(str) {
    if (typeof str != "string") return false // we only process strings!
    return !isNaN(str) && // use type coercion to parse the _entirety_ of the string (`parseFloat` alone does not do this)...
           !isNaN(parseFloat(str)) // ...and ensure strings of whitespace fail
}

function saveSettings() {
    const darkModeElem = $("#settings-dark");
    const zoomElem = $("#settings-zoom");
    const hostElem = $("#settings-host");
    const portElem = $("#settings-port");

    if (!validateIp(hostElem.val())) {
        $("#invalid-host").show();
        return; // Do not continue validating.
    }
    else
        $("#invalid-host").hide();

    if ((!isNumeric(portElem.val())) || parseInt(portElem.val()) > 65535 || parseInt(portElem.val()) < 1) {
        $("#invalid-port").show();
        return; // Do not continue validating.
    }
    else
        $("#invalid-port").hide();

    const darkMode = darkModeElem.val();
    const zoom = zoomElem.val();
    const host = hostElem.val();
    const port = portElem.val();

    settings.darkMode = darkMode;
    settings.zoom = zoom;
    settings.host = host;
    settings.port = port;
    Cookies.set("settings", JSON.stringify(settings));

    window.location.reload();
}
