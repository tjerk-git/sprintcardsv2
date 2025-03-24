async function fetchChallenges() {
  try {
    const response = await fetch("/assets/data/challenges.json");
    if (!response.ok) {
      throw new Error("Network response was not ok " + response.statusText);
    }
    const data = await response.json();
    return data; // Return the fetched data
  } catch (error) {
    console.error("There was a problem with the fetch operation:", error);
  }
}

const fps = 30;
const platformButton = document.getElementById("platformButton");
const audienceButton = document.getElementById("audienceButton");
const chaosButton = document.getElementById("chaosButton");
const chaosEnableButton = document.getElementById("chaosEnableButton");
const scrambleAudio = document.getElementById("scramble");
const scrambleNoCoinAudio = document.getElementById("scramble-no-coin");
const categorySelector = document.getElementById("category_selector");
const muteAudioButton = document.getElementById("muteAudioButton");

let chaosEnabled = false;
let mute = false;

let platformId = document
  .querySelector(".platform-text")
  .getAttribute("data-id");

chaosButton.style.display = "none";

let selectedTheme = "digitalDesign";
let challengeData;

// Fetch the data and assign it to challengeData
(async () => {
  challengeData = await fetchChallenges();
  console.log(challengeData); // Verify the data is fetched
})();

muteAudioButton.addEventListener("click", function () {
  mute = !mute;

  if (mute) {
    document.getElementById("mute").style.display = "none";
    document.getElementById("unmute").style.display = "block";
  } else {
    document.getElementById("mute").style.display = "block";
    document.getElementById("unmute").style.display = "none";
  }
});

// Add event listener to category selector
categorySelector.addEventListener("change", function () {
  selectedTheme = categorySelector.value;

  document.querySelectorAll(".introduction span").forEach((span) => {
    span.style.opacity = "0";
    span.style.transition = "opacity 0.5s";
  });

  document.querySelector(".buttonContainer").style.opacity = "1";

  displayElement("platform");
  displayElement("audience");

  if (chaosEnabled) {
    displayElement("chaos");
  }
});

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

    if (!mute) {
      scrambleAudio.currentTime = 0;
      scrambleAudio.play();
    }

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
  chaosEnabled = !chaosEnabled;

  if (chaosEnabled) {
    chaosButton.style.display = "block";
    document.querySelector(".chaos").style.display = "block";
    displayElement("chaos");
  }

  if (!chaosEnabled) {
    chaosEnableButton.innerHTML = "Chaos Disabled";
    document.querySelector(".chaos-text").innerHTML = "";
    document.querySelector(".chaos").style.display = "none";
    chaosButton.style.display = "none";
  } else {
    chaosEnableButton.innerHTML = "Chaos Enabled";
  }
});
