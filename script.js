const chatInput = document.querySelector("#chat-input");
const sendButton = document.querySelector("#send-btn");
const chatContainer = document.querySelector(".chat-container");
const themeButton = document.querySelector("#theme-btn");
const deleteButton = document.querySelector("#delete-btn");

let userText = null;
const API_KEY = "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";
const initialHeight = chatInput.scrollHeight;

const loadDataFromLocalStorage = () => {
    const themeColor = localStorage.getItem("theme-color");

    document.body.classList.toggle("light-mode", themeColor === "light_mode");
    themeButton.innerText = document.body.classList.contains("light-mode") ? "dark-mode" : "light-mode"

    const defaultText = `<div class="default-text">
                            <h1>ChatGPT Clone</h1>
                            <p>Start a conversation and explore the power of AI.<br> Your chat history will be displayed here<p>
                        </div>`

    chatContainer.innerHTML = localStorage.getItem("all-chats") || defaultText;
    chatContainer.scrollTo(0, chatContainer.scrollHeight);
}

loadDataFromLocalStorage();

const creatElement = (html, className) => {
    //create new div and apply chat, specified class and set html content of div
    const chatDiv = document.createElement("div");
    chatDiv.classList.add("chat", className);
    chatDiv.innerHTML = html;
    return chatDiv; //Return the created chat div
}

const getChatResponse = async (incomingChatDiv) => {
    const API_URL = "https://api.openai.com/v1/completions";
    const pElement = document.createElement("p");

    //Define the properties and data for the API request
    const requestOptions = {
        method: "POST" ,
        headers: {
            "Content-Type" : "application/json" ,
            "Authorization" : `Bearer ${API_KEY}`
        },
        body: JSON.stringify ({
            model: "gpt-3.5-turbo-instruct",
            prompt: userText,
            max_tokens: 2048,
            temperature: 0.2,
            n: 1,
            stop: null
        })
    }

    // Send POST request to API, get response andset the response as paragraph element text
    try {
        const response = await (await fetch(API_URL, requestOptions)).json();
        pElement.textContent = response.choices[0].text.trim();
    } catch (error) {
        pElement.classList.add("error");
        pElement.textContent = "opps! something went wrong while retrieving the response. please try again."
    }

    //Remove the typing animation, append the paragragh element and save the chats to local storage
    incomingChatDiv.querySelector(".typing-animation").remove();
    incomingChatDiv.querySelector(".chat-details").appendChild(pElement);
    chatContainer.scrollTo(0, chatContainer.scrollHeight);
    localStorage.setItem("all-chats", chatContainer.innerHTML);
}

const copyResponse = (copyBtn) => {
    // copy the text content of the response to the clipboard
    const respnseTextElement = copyBtn.parentElement.querySelector("p");
    navigator.clipboard.writeText(respnseTextElement.textContent);
    copyBtn.textContent = "done";
    setTimeout(() =>  copyBtn.textContent = "content_copy" , 1000);
}

const showTypingAnimation = () => {
    const html = `<div class="chat-content">
                    <div class="chat-details">
                        <img src="gptimg/images/chatbot.jpg" alt="chatbot-img">
                        <div class="typing-animation">
                            <div class="typing-dot" style="--delay: 0.2s"></div>
                            <div class="typing-dot" style="--delay: 0.3s"></div>
                            <div class="typing-dot" style="--delay: 0.4s"></div>
                         </div>
                    </div>
                    <span onclick="copyResponse(this)" class="material-symbols-outlined">content_copy</span>
                </div>`;

    //Create an incoming chat div with typing animation and append it to chat container            
    const incomingChatDiv = creatElement (html, "incoming");
    chatContainer.appendChild(incomingChatDiv);
    chatContainer.scrollTo(0, chatContainer.scrollHeight);
    getChatResponse(incomingChatDiv);
}

const handleOutgoingChat = () => {
    userText = chatInput.value.trim(); // Get chatInput value and remove extra spaces
    if(!userText) return; //If chatInput is empty return from here  

    chatInput.value = "",
    chatInput.style.height = `${initialHeight}px`;

    const html = `<div class="chat-content">
                    <div class="chat-details">
                        <img src="gptimg/images/user.jpg" alt="user-img">
                        <p></p>
                    </div>
                </div>`;

    //Create an outgoing chat div with user's message and append it to chat container           
    const outgoingChatDiv = creatElement (html, "outgoing");
    outgoingChatDiv.querySelector("p").textContent = userText;
    chatContainer.appendChild(outgoingChatDiv);
    document.querySelector(".default-text")?.remove();
    chatContainer.scrollTo(0, chatContainer.scrollHeight);
    setTimeout(showTypingAnimation, 500);
}

themeButton.addEventListener("click", () => {
    // Toggle body's class for the theme mode and save the updated theme to the local storage
    document.body.classList.toggle("light-mode");
    localStorage.setItem("theme-color", themeButton.innerText);
    themeButton.innerText = document.body.classList.contains("light-mode") ? "dark-mode" : "light-mode"
});

deleteButton.addEventListener("click", () => {
    // Remove the chats from storage and call loadDataFromLocalStorage function 
  if(confirm ("Are you sure you want to delete all the chats")) {
      localStorage.removeItem("all-chats");
      loadDataFromLocalStorage();
  }
})


chatInput.addEventListener("input", () => {
    // Adjust the height of the field dynamically based on its content
    chatInput.style.height = `${initialHeight}px`;
    chatInput.style.height = `${chatInput.scrollHeight}px`;
});

chatInput.addEventListener ("keydown", (e) => {
    if(e.key == "Enter" && !e.shiftKey && window.innerWidth > 800) {
        //If the Enter key is pressed without shift and the window width 
        // then 800 pixels, handle the outgoing chats
        e.preventDefault ();
        handleOutgoingChat();
    }
})

sendButton.addEventListener("click", handleOutgoingChat);