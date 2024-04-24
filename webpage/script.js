const disclaimer = document.querySelector("#disclaimer-modal");
const featureUnavailable = document.querySelector("#feature-unavailable-modal");
const closeModal = document.querySelector("#close-modal");

const openDisclaimer = document.querySelector("#open-modal");
const openFeatureUnavailable = document.querySelector(".feature-unavailable");

openDisclaimer.addEventListener("click", () => {
  disclaimer.showModal();
});

openFeatureUnavailable.addEventListener("click", () => {
  featureUnavailable.showModal();
});

closeModal.addEventListener("click", () => {
  featureUnavailable.close();
});

function defaultTab() {
  document.getElementById("defaultTab").click();
}

defaultTab();

function openTab(evt, tabName) {
  let i, tabContents, tabOption;
  tabContents = document.getElementsByClassName("tabContent");
  for (i = 0; i < tabContents.length; i++) {
    tabContents[i].style.display = "none";
  }
  tabOption = document.getElementsByClassName("tabOption");
  for (i = 0; i < tabOption.length; i++) {
    tabOption[i].classList.remove("active");
  }
  console.log(tabName);
  document.getElementById(tabName).style.display = "block";
  evt.currentTarget.classList.add("active");
}
