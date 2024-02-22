function sendMsg() {
    const chatInput = $("#chat-input");
    let chatMsgBody = $("#chat-msg-body");
    const chatInputText = chatInput.val();
    chatInput.val(""); // Remove everything

    if (chatInputText === "")
        return;

    chatMsgBody.html(chatMsgBody.html() +
		"<div class='chat-your-msg'>" +
			"<p class='chat-desc'>You</p>" +
			`<p class='chat-msg-primary'>${chatInputText}</p>` +
        "</div>");
    // console.log(chatInputText);

    // Scroll to the bottom
    chatMsgBody.scrollTop = chatMsgBody.scrollHeight;
    receiveResponse(chatInputText);
}

function receiveResponse(msg) {
    let req = {
        "instances": [{"prompt": msg}],
        "parameters": {"temperature": 0.2, "maxOutputTokens": 256, "topK": 40, "topP": 0.95, "logprobs": 2}
    };

    fetch(`https://${API_ENDPOINT}/v1/projects/${PROJECT_ID}/locations/${LOCATION_ID}/publishers/google/models/${MODEL_ID}:predict`, {
        method: "POST",
        headers: {
            "Authorization": "Bearer " + API_KEY,
            "Content-Type": "application/json; charset=utf-8"
        },
        body: JSON.stringify(req)
    }).then((response) => response.json()).then(json => {
        // noinspection JSUnresolvedReference
        let content = json.predictions[0].content;
        content = converter.makeHtml(content);
        let chatMsgBody = $("#chat-msg-body");
        chatMsgBody.html(chatMsgBody.html() +
			"<div class='chat-bot-msg'>" +
				"<p class='chat-desc'>Judy (Bot)</p>" +
				`<section class='chat-msg-secondary'>${content}</section>` +
            "<br></div>");
        // Scroll to the bottom
        chatMsgBody.scrollTop = chatMsgBody.scrollHeight;
    });
}
