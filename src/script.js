const fps = 30;
const platformButton = document.getElementById("platformButton");
const audienceButton = document.getElementById("audienceButton");
const chaosButton = document.getElementById("chaosButton");
const chaosEnableButton = document.getElementById("chaosEnableButton");
const scrambleAudio = document.getElementById("scramble");
const scrambleNoCoinAudio = document.getElementById("scramble-no-coin");
const menuButtons = document.querySelectorAll(".menuButton");
const uxdesignButton = document.getElementById("uxdesignButton");
let selectedTheme = "digitalDesign";
let challengeData;
let chaosEnabled = false;

let platformId = document
  .querySelector(".platform-text")
  .getAttribute("data-id");

async function fetchChallenges() {
  try {
    const response = await fetch("/assets/data/challenges.json");
    if (!response.ok) {
      throw new Error("Network response was not ok " + response.statusText);
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("There was a problem with the fetch operation:", error);
  }
}

chaosButton.style.display = "none";

// Fetch the data and assign it to challengeData
(async () => {
  challengeData = await fetchChallenges();

  uxdesignButton.classList.add("active");

  displayElement("platform");
  displayElement("audience");
})();

menuButtons.forEach((button) => {
  button.addEventListener("click", function () {
    selectedTheme = button.getAttribute("data-category");

    removeActiveButtons();
    button.classList.add("active");

    if (selectedTheme == "") {
      return;
    }

    displayElement("platform");
    displayElement("audience");

    if (chaosEnabled) {
      displayElement("chaos");
    }
  });
});

function removeActiveButton() {
  menuButtons.forEach((button) => {
    if (button.classList.contains("active")) {
      button.classList.remove("active");
    }
  });
}

function removeActiveButtons() {
  menuButtons.forEach((button) => {
    removeActiveButton(button);
  });
}

function scramble(word, callback) {
  let strarray = word.split("");
  let originalWord = word;

  const duration = 3600;
  const startTime = performance.now();
  const endTime = startTime + duration;

  function scrambleStep(currentTime) {
    // Calculate progress as a percentage (0 to 1)
    const progress = (currentTime - startTime) / duration;

    if (currentTime < endTime) {
      // Scramble letters
      let j = Math.floor(Math.random() * strarray.length);
      let k = Math.floor(Math.random() * strarray.length);
      let temp = strarray[j];
      strarray[j] = strarray[k];
      strarray[k] = temp;

      callback(strarray.join(""));

      // Continue the animation
      requestAnimationFrame(scrambleStep);
    } else {
      // Animation complete, show original word
      callback(originalWord);
    }
  }

  // Start the animation
  requestAnimationFrame(scrambleStep);
}

function displayElement(type) {
  if (challengeData) {
    const typeMap = {
      platform: "platforms",
      audience: "audiences",
      chaos: "chaosModifiers",
    };

    const elementType = typeMap[type];
    let randomIndex = Math.floor(
      Math.random() * challengeData[selectedTheme][elementType].length,
    );

    // Special handling for platform to avoid repeats
    if (type === "platform" && randomIndex === platformId) {
      randomIndex = randomIndex + 1;
      if (randomIndex >= challengeData[selectedTheme][elementType].length) {
        randomIndex = 0;
      }
    }

    let randomWord =
      challengeData[selectedTheme][elementType][randomIndex].title;
    const textElement = document.querySelector(`.${type}-text`);
    textElement.innerHTML = randomWord;

    scramble(randomWord, function (scrambledWord) {
      textElement.innerHTML = scrambledWord;
      if (type === "platform") {
        const id = challengeData[selectedTheme][elementType][randomIndex].id;
        textElement.setAttribute("data-id", id);
      }
    });
  } else {
    console.log("Challenge data is not yet available.");
  }
}

platformButton.addEventListener("click", function () {
  displayElement("platform");
});

audienceButton.addEventListener("click", function () {
  displayElement("audience");
});

chaosButton.addEventListener("click", function () {
  displayElement("chaos");
});

chaosEnableButton.addEventListener("click", function () {
  chaosEnabled = true;

  if (chaosEnabled) {
    chaosEnableButton.style.display = "none";
    chaosButton.style.display = "flex";
    document.querySelector(".chaos").style.display = "flex";
    displayElement("chaos");
  }
});
