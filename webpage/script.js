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
