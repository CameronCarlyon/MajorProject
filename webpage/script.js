try {
  const disclaimer = document.querySelector("#disclaimer-modal");
  const featureUnavailable = document.querySelector(
    "#feature-unavailable-modal"
  );
  const seatUnavailable = document.querySelector("#seat-unavailable-modal");
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
} catch (Exception) {
  console.log("No modals found.");
}

function defaultTab() {
  document.getElementById("defaultTab").click();
}

function scrollToTop() {
  window.scrollTo({
    top: 0,
    behavior: "smooth",
  });
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
  scrollToTop();
}

// Passenger Information Section
document.addEventListener("DOMContentLoaded", () => {
  const addPassengerIcon = document.getElementById("add-icon");
  const passengerSectionContainer = document.getElementById(
    "passenger-info-container"
  );

  addPassengerIcon.addEventListener("click", () => {
    console.log("Pressed new passenger button");

    // Get the number of current passenger sections
    const passengerCount = passengerSectionContainer.children.length;

    // Clone the passenger info box
    const newPassengerSection = document
      .getElementById("passenger-info-box")
      .cloneNode(true);

    // Update the id and header for the new passenger section
    const newPassengerId = `passenger-info-box-${passengerCount + 1}`;
    newPassengerSection.id = newPassengerId;
    newPassengerSection.querySelector("h3").innerText = `Passenger ${
      passengerCount + 1
    }`;

    // Optionally, reset input values in the cloned section
    const inputs = newPassengerSection.querySelectorAll("input, select");
    inputs.forEach((input) => {
      if (input.tagName.toLowerCase() === "input") {
        input.value = "";
      } else if (input.tagName.toLowerCase() === "select") {
        input.selectedIndex = 0;
      }
    });

    // Append the new passenger section to the parent container
    passengerSectionContainer.appendChild(newPassengerSection);

    // Remove the button from all but the last passenger-info-box
    const passengerBoxes =
      passengerSectionContainer.querySelectorAll(".booking-window");
    passengerBoxes.forEach((box, index) => {
      const buttonContainer = box.querySelector(".button-container");
      if (buttonContainer) {
        buttonContainer.remove();
      }
      if (index === passengerBoxes.length - 1) {
        // Ensure the last one has the button container
        const newButtonContainer = document.createElement("div");
        newButtonContainer.classList.add("button-container");
        const newButton = document.createElement("button");
        newButton.textContent = "Continue to Seating";
        newButton.setAttribute("onclick", "openTab(event,'seating')");
        newButtonContainer.appendChild(newButton);
        box.appendChild(newButtonContainer);
      }
    });
  });
});

// Seat unavailable to preview

document.addEventListener("DOMContentLoaded", () => {
  // Function to change the ID of seats 19A and above
  function updateSeatIds() {
    const seatElements = document.querySelectorAll(".seat");
    seatElements.forEach((seat) => {
      const seatId = seat.id;
      const seatNumber = parseInt(seatId.match(/\d+/)[0]); // Extract the seat number

      if (seatNumber >= 23) {
        seat.id = "feature-unavailable";
      }
    });
  }

  // Call the function to update seat IDs
  updateSeatIds();
});
