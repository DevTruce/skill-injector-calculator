"use strict";

//// Imports
import {
  fetchMarketValue,
  largeSkillInjector,
  smallSkillInjector,
  theForge,
} from "./fetchMarketValue.js";

//// DOM Elements
const container = document.querySelector(".container");
const generateTotalButton = document.querySelector(".generateTotal");
const clearInputFieldsButton = document.querySelector(".clearInputFields");
const userGoalSP = document.querySelector("#goalSP");
const userCurrentSP = document.querySelector("#currentSP");
const showResult = document.querySelector(".showResult");
const closeResult = document.querySelector(".closeResult");
const displayMessages = document.querySelector(".displayMessages");
const displayMessagesHeader = document.querySelector(".displayMessagesHeader");
const displayInjectorNeeds = document.querySelector(".displayInjectorNeeds");
const displayIskNeeds = document.querySelector(".displayIskNeeds");
const displayMessage = document.querySelector(".displayMessage");

const SKILL_POINT_MAX = 625000000;
const DIMINISHING_RETURNS = {
  T1: { spRange: 5000000, spInjected: 500000 }, // 5M SP-
  T2: { spRange: [5000000, 50000000], spInjected: 400000 }, // 5M - 50M SP
  T3: { spRange: [50000000, 80000000], spInjected: 300000 }, // 50M - 80M SP
  T4: { spRange: 80000000, spInjected: 150000 }, // 80M SP+
};

//// Helper Functions
const formatNumber = function (number) {
  return number.toLocaleString();
};

const updateResultDimensions = function (element1, element2) {
  // get computed width and height of element1
  const element1Width = window.getComputedStyle(element1).width;
  const element1Height = window.getComputedStyle(element1).height;

  // apply the same dimensions to element2
  element2.style.width = element1Width;
  element2.style.height = element1Height;
};
const runUpdateDimensions = () => updateResultDimensions(container, showResult);
runUpdateDimensions();

const showInvalidPopUpWindow = function (header, errorMessage) {
  // set elements data
  displayMessagesHeader.innerHTML = header;
  displayMessage.innerHTML = errorMessage;

  // show window
  showResult.classList.remove("fade-out");
  showResult.classList.remove("hidden");
  showResult.classList.add("fade-in");
};

const showPopUpWindow = function (header, injectorNeeds, iskNeeds, message) {
  // set elements data
  displayMessagesHeader.innerHTML = header;
  displayInjectorNeeds.innerHTML = injectorNeeds;
  displayIskNeeds.innerHTML = iskNeeds;
  displayMessage.innerHTML = message;

  // show window
  showResult.classList.remove("fade-out");
  showResult.classList.remove("hidden");
  showResult.classList.add("fade-in");
};

const hidePopUpWindow = function () {
  // reset elements data
  displayMessagesHeader.innerHTML = ``;
  displayInjectorNeeds.innerHTML = ``;
  displayIskNeeds.innerHTML = ``;
  displayMessage.innerHTML = ``;

  // hide window
  showResult.classList.remove("fade-in");
  showResult.classList.add("fade-out");
  setTimeout(function () {
    showResult.classList.add("hidden");
  }, 500);
};

const userInputReset = function () {
  // reset input fields
  userCurrentSP.value = ``;
  userGoalSP.value = ``;
};

const validationRules = [
  {
    condition: (currentSP, goalSP) => goalSP <= currentSP,
    errorMessage: "Goal SP must be greater than Current SP",
  },
  {
    condition: (currentSP, goalSP) =>
      goalSP > SKILL_POINT_MAX || currentSP > SKILL_POINT_MAX,
    errorMessage: `Max Skill Points = ${formatNumber(SKILL_POINT_MAX)}`,
  },
  {
    condition: (currentSP, goalSP) => isNaN(goalSP) || isNaN(currentSP),
    errorMessage: "Please Enter a Number",
  },
];

const validateInput = function (currentSP, goalSP) {
  for (const rule of validationRules) {
    if (rule.condition(currentSP, goalSP)) {
      showInvalidPopUpWindow("Invalid Input", rule.errorMessage);
      return false; // Validation failed
    }
  }
  localStorage.setItem("goalSP", goalSP);
  localStorage.setItem("currentSP", currentSP);
  return true; // Validation passed
};

//// Calculate Skill Injectors and Costs From Current SP to Goal SP
const skillInjectorCalculator = async function (currentSP, goalSP) {
  let skillInjectorsNeeded = 0; // counter
  const originalSP = currentSP; // store original SP before calculation

  // Function to calc skill points within a specified range
  const calculateRange = (range, injected) => {
    while (currentSP < goalSP && currentSP < range) {
      currentSP += injected;
      skillInjectorsNeeded++;
    }
  };

  // Validate user inputs
  if (!validateInput(currentSP, goalSP)) {
    return;
  }

  // Calc skill points within a specified range
  // 5m and under
  calculateRange(
    DIMINISHING_RETURNS.T1.spRange,
    DIMINISHING_RETURNS.T1.spInjected
  );
  // 5m - 50m
  calculateRange(
    DIMINISHING_RETURNS.T2.spRange[1],
    DIMINISHING_RETURNS.T2.spInjected
  );
  // 50m - 80m
  calculateRange(
    DIMINISHING_RETURNS.T3.spRange[1],
    DIMINISHING_RETURNS.T3.spInjected
  );

  // Calc skill points in T4 range (80m+)
  if (currentSP >= DIMINISHING_RETURNS.T4.spRange) {
    while (currentSP < goalSP) {
      currentSP += DIMINISHING_RETURNS.T4.spInjected;
      skillInjectorsNeeded++;
    }
  }

  // Calculate approximate isk costs
  const LARGE_SKILL_INJECTOR_PRICE =
    (await fetchMarketValue(theForge, largeSkillInjector, "sell")) || 897712889;

  const SMALL_SKILL_INJECTOR_PRICE =
    (await fetchMarketValue(theForge, smallSkillInjector, "sell")) || 177978723;

  console.log(`Large Skill Injector Jita Sell:${LARGE_SKILL_INJECTOR_PRICE}`);
  console.log(`Small Skill Injector Jita Sell:${SMALL_SKILL_INJECTOR_PRICE}`);
  const iskCost = skillInjectorsNeeded * LARGE_SKILL_INJECTOR_PRICE;

  // Display results
  showPopUpWindow(
    `${formatNumber(originalSP)} SP to ${formatNumber(goalSP)} SP`,
    `Large Skill Injectors: <span class="cta";>${formatNumber(
      skillInjectorsNeeded
    )}</span>`,
    `Aprx ISK Cost: <span class="cta";>${formatNumber(iskCost)}</span>`,
    `New Total SP: <span class="cta";>${formatNumber(currentSP)}</span>`
  );
};

//// Event Listeners
// Load Local Storage Info into Input Fields
document.addEventListener("DOMContentLoaded", () => {
  if (localStorage.getItem("currentSP")) {
    userCurrentSP.value = localStorage.getItem("currentSP");
  }

  if (localStorage.getItem("goalSP")) {
    userGoalSP.value = localStorage.getItem("goalSP");
  }
});

// Automatically Update Result Dimensions on Window Resize
window.addEventListener("resize", runUpdateDimensions);

// Clear Input Fields & Local Storage Information
clearInputFieldsButton.addEventListener("click", e => {
  e.stopPropagation();

  // clear local storage info
  localStorage.removeItem("goalSP");
  localStorage.removeItem("currentSP");

  // clear input field values
  userCurrentSP.value = ``;
  userGoalSP.value = ``;
});

// Execute Skill Injector Calculator on "Generate" Button Click
generateTotalButton.addEventListener("click", function (e) {
  e.stopPropagation(); // prevent event propagation

  // gather user input data
  const userCurrentSP_data = parseFloat(userCurrentSP.value);
  const userGoalSP_data = parseFloat(userGoalSP.value);

  //execute logic & reset
  skillInjectorCalculator(userCurrentSP_data, userGoalSP_data);
  userInputReset();
});

// Reset & Close Result Window
// close on click of close button
closeResult.addEventListener("click", function () {
  hidePopUpWindow();
});

// close on escape key press
document.addEventListener("keydown", function (e) {
  if (e.key === "Escape" && !showResult.classList.contains("hidden")) {
    hidePopUpWindow();
  }
});

// close on click outside of result window
document.addEventListener("click", function (event) {
  const isClickInsideTarget = showResult.contains(event.target);

  if (!isClickInsideTarget && !showResult.classList.contains("hidden")) {
    hidePopUpWindow();
  }
});
