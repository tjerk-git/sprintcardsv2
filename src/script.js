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
const goButton = document.getElementById("go");
const scrambleAudio = document.getElementById("scramble");
const scrambleNoCoinAudio = document.getElementById("scramble-no-coin");
const categorySelector = document.getElementById("category_selector");

let selectedTheme = "digitalDesign";
let challengeData;

// Fetch the data and assign it to challengeData
(async () => {
  challengeData = await fetchChallenges();
  console.log(challengeData); // Verify the data is fetched
})();

// Add event listener to category selector
categorySelector.addEventListener("change", function () {
  selectedTheme = categorySelector.value;
});

function scramble(word, callback) {
  let strarray = word.split("");
  let originalWord = word;
  let i = 0;

  function scrambleStep() {
    if (i < strarray.length) {
      let j = Math.floor(Math.random() * (i + 1));
      let k = strarray[i];
      strarray[i] = strarray[j];
      strarray[j] = k;
      i++;

      callback(strarray.join(""));

      setTimeout(() => {
        requestAnimationFrame(scrambleStep);
      }, 1000 / fps);
    } else {
      callback(originalWord);
    }
  }

  requestAnimationFrame(scrambleStep);
}

goButton.addEventListener("click", function () {
  if (challengeData) {
    console.log(selectedTheme);
    let randomIndex = Math.floor(
      Math.random() * challengeData[selectedTheme].platforms.length,
    );
    let randomWord = challengeData[selectedTheme].platforms[randomIndex].title;

    console.log(randomWord);

    document.querySelector(".text").innerHTML = randomWord;

    scramble(randomWord, function (scrambledWord) {
      document.querySelector(".text").innerHTML = scrambledWord;
    });
  } else {
    console.log("Challenge data is not yet available.");
  }
});
