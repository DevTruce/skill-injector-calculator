"use strict";

//// DOM Elements
const container = document.querySelector(".container");
const generateTotalButton = document.querySelector(".generateTotal");
const userGoalSP = document.querySelector("#goalSP");
const userCurrentSP = document.querySelector("#currentSP");
const showResult = document.querySelector(".showResult");
const closeResult = document.querySelector(".closeResult");
const displayMessages = document.querySelector(".displayMessages");
const displayInjectorNeeds = document.querySelector(".displayInjectorNeeds");
const displayIskNeeds = document.querySelector(".displayIskNeeds");
const displayMessage = document.querySelector(".displayMessage");
const displayMessagesHeader = document.querySelector(".displayMessagesHeader");

//// Preset Variables
const SKILL_POINT_MAX = 425000000;
const SKILL_INJECTOR_PRICE = 890000000; // use eve api to get price?
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
    condition: (goalSP, currentSP) => goalSP <= currentSP,
    errorMessage: "Goal SP must be greater than Current SP",
  },
  {
    condition: (goalSP, currentSP) =>
      goalSP > SKILL_POINT_MAX || currentSP > SKILL_POINT_MAX,
    errorMessage: `Max Skill Points = ${formatNumber(SKILL_POINT_MAX)}`,
  },
  {
    condition: (goalSP, currentSP) => isNaN(goalSP) || isNaN(currentSP),
    errorMessage: "Please Enter a Number",
  },
];

const validateInput = function (goalSP, currentSP) {
  for (const rule of validationRules) {
    if (rule.condition(goalSP, currentSP)) {
      showInvalidPopUpWindow("Invalid Input", rule.errorMessage);
      return false; // Validation failed
    }
  }
  return true; // Validation passed
};

//// Calculate Skill Injectors and Costs From Current SP to Goal SP
const skillInjectorCalculator = function (currentSP, goalSP) {
  let skillInjectorsNeeded = 0; // counter

  // Function to calc skill points within a specified range
  const calculateRange = (range, injected) => {
    while (currentSP < goalSP && currentSP < range) {
      currentSP += injected;
      skillInjectorsNeeded++;
    }
  };

  // Validate user inputs
  if (!validateInput(goalSP, currentSP)) {
    return;
  }

  // Calc skill points within a specified range
  calculateRange(
    DIMINISHING_RETURNS.T1.spRange,
    DIMINISHING_RETURNS.T1.spInjected
  );
  calculateRange(
    DIMINISHING_RETURNS.T2.spRange[1],
    DIMINISHING_RETURNS.T2.spInjected
  );
  calculateRange(
    DIMINISHING_RETURNS.T3.spRange[1],
    DIMINISHING_RETURNS.T3.spInjected
  );

  // Calc skill points in T4 range (80M+)
  if (currentSP >= DIMINISHING_RETURNS.T4.spRange) {
    while (currentSP < goalSP) {
      currentSP += DIMINISHING_RETURNS.T4.spInjected;
      skillInjectorsNeeded++;
    }
  }

  // Calculate isk costs
  const iskCost = skillInjectorsNeeded * SKILL_INJECTOR_PRICE;

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
// Automatically Update Result Dimensions on Window Resize
window.addEventListener("resize", runUpdateDimensions);

// Execute Skill Injector Calculator on Button Click
generateTotalButton.addEventListener("click", function (e) {
  e.stopPropagation(); // Stop the click event from propagating to the document
  const userCurrentSP_data = parseFloat(userCurrentSP.value);
  const userGoalSP_data = parseFloat(userGoalSP.value);

  skillInjectorCalculator(userCurrentSP_data, userGoalSP_data);
  userInputReset();
});

// Reset & Close Result Window
closeResult.addEventListener("click", function () {
  hidePopUpWindow();
});

document.addEventListener("keydown", function (e) {
  if (e.key === "Escape" && !showResult.classList.contains("hidden")) {
    hidePopUpWindow();
  }
});

document.addEventListener("click", function (event) {
  const isClickInsideTarget = showResult.contains(event.target);

  if (!isClickInsideTarget && !showResult.classList.contains("hidden")) {
    hidePopUpWindow();
  }
});
