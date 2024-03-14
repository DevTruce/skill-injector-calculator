"use strict";

//// DOM Elements
const container = document.querySelector(".container");
const generateTotalButton = document.getElementById("generateTotal");
const showResult = document.querySelector(".showResult");
const closeResult = document.querySelector(".closeResult");
const displayInjectorNeeds = document.getElementById("displayInjectorNeeds");
const displayIskNeeds = document.getElementById("displayIskNeeds");
const displayMessage = document.getElementById("displayMessage");

//// Preset Variables
const SKILL_POINT_MAX = 425000000;
const SKILL_INJECTOR_PRICE = 890000000;
const DIMINISHING_RETURNS = {
  T1: { spRange: 5000000, spInjected: 500000 }, // 5M SP-
  T2: { spRange: [5000000, 50000000], spInjected: 400000 }, // 5M - 50M SP
  T3: { spRange: [50000000, 80000000], spInjected: 300000 }, // 50M - 80M SP
  T4: { spRange: 80000000, spInjected: 150000 }, // 80M SP+
};

//// Helper Functions
const updateResultDimensions = function (element1, element2) {
  // Get the computed width and height of element1
  const element1Width = window.getComputedStyle(element1).width;
  const element1Height = window.getComputedStyle(element1).height;

  // Apply the same dimensions to element2
  element2.style.width = element1Width;
  element2.style.height = element1Height;
};
const runUpdateDimensions = () => updateResultDimensions(container, showResult);
runUpdateDimensions(); // Initial run
window.addEventListener("resize", runUpdateDimensions);

const formatNumber = function (number) {
  return number.toLocaleString();
};

//// Calculate Skill Injectors and Costs From Current SP to Goal SP
const skillInjectorCalculator = function (currentSP, goalSP) {
  let skillInjectorsNeeded = 0;

  // Check if The Users Inputs are Valid
  if (goalSP < currentSP || goalSP === currentSP || goalSP > SKILL_POINT_MAX) {
    console.log("Invalid Inputs");
    return;
  }

  // Calculate currentSP to goalSP
  else if (goalSP > currentSP) {
    // calculate if currentSP is less than 5m
    while (currentSP < goalSP && currentSP < DIMINISHING_RETURNS.T1.spRange) {
      currentSP += DIMINISHING_RETURNS.T1.spInjected;
      skillInjectorsNeeded++;
    }

    // calculate if currentSP is between 5m and 50m
    while (
      currentSP < goalSP &&
      currentSP >= DIMINISHING_RETURNS.T2.spRange[0] &&
      currentSP < DIMINISHING_RETURNS.T2.spRange[1]
    ) {
      currentSP += DIMINISHING_RETURNS.T2.spInjected;
      skillInjectorsNeeded++;
    }

    // calculate if currentSP is between 50m and 80m
    while (
      currentSP < goalSP &&
      currentSP >= DIMINISHING_RETURNS.T3.spRange[0] &&
      currentSP < DIMINISHING_RETURNS.T3.spRange[1]
    ) {
      currentSP += DIMINISHING_RETURNS.T3.spInjected;
      skillInjectorsNeeded++;
    }
  }

  // calculate if currentSP is greater than 80M
  if (currentSP >= DIMINISHING_RETURNS.T4.spRange) {
    while (currentSP < goalSP) {
      currentSP += DIMINISHING_RETURNS.T4.spInjected;
      skillInjectorsNeeded++;
    }
  }

  // Calculate ISK Cost
  const iskCost = skillInjectorsNeeded * SKILL_INJECTOR_PRICE;

  // Display Results
  showResult.classList.remove("fade-out");
  showResult.classList.remove("hidden");
  showResult.classList.add("fade-in");

  displayInjectorNeeds.innerHTML = `Large Skill Injectors: <span class="cta";>${formatNumber(
    skillInjectorsNeeded
  )}</span>`;

  displayIskNeeds.innerHTML = `Aprx ISK Cost: <span class="cta";>${formatNumber(
    iskCost
  )}</span>`;

  displayMessage.innerHTML = `New Total SP: <span class="cta";>${formatNumber(
    currentSP
  )}</span>`;
};

//// Event Listeners
// Execute Skill Injector Calculator on Button Click
generateTotalButton.addEventListener("click", function () {
  const userCurrentSP = parseFloat(document.getElementById("currentSP").value);
  const userGoalSP = parseFloat(document.getElementById("goalSP").value);

  skillInjectorCalculator(userCurrentSP, userGoalSP);
});

// Reset & Close Result Window
closeResult.addEventListener("click", function () {
  showResult.classList.remove("fade-in");
  showResult.classList.add("fade-out");
  setTimeout(function () {
    showResult.classList.add("hidden");
  }, 500);
});
