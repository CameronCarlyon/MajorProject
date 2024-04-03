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
  // tabOption = document.getElementsByClassName("tabOption p::after");
  // for (i = 0; i < tabOption.length; i++) {
  //   tabOption[i].style.display = "none";
  // }
  console.log(tabName);
  // document.getElementById("defaultTab").click();
  document.getElementById(tabName).style.display = "block";
}
