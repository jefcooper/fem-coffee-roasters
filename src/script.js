let coffeeOptions = {};

function headerNavMenuClicked(evt) {
  const menuButton = evt.target.closest(".menu__toggle");
  const menu = evt.target.closest(".menu");

  const isOpen = menuButton.getAttribute("data-state") === "open";

  if (isOpen) {
    closeMenu(evt);
  } else {
    // add modal to body
    document.body.classList.add("modal");

    // set data-state to open
    menuButton.setAttribute("data-state", "open");

    // set aria-expanded to true
    menuButton.setAttribute("aira-expanded", "true");
  }
  evt.preventDefault();
  evt.stopPropagation();
}

function closeMenu(evt) {
  let menuButton;

  if (evt && evt.target.classList.contains(".menu__toggle")) {
    menuButton = evt.target.closest(".menu__toggle");
  } else {
    menuButton = document.querySelector(".menu__toggle");
  }

  // remove modal from body
  document.body.classList.remove("modal");

  // set data-state to closing
  menuButton.setAttribute("data-state", "closing");

  // set aria-expanded to false
  menuButton.setAttribute("aria-expanded", "false");

  // register event handler for animationend
  // TODO - when animation added
}

function showDialog(evt) {
  document.body.classList.add("modal-dialog");
  evt.preventDefault();
}
function hideDialog(evt) {
  document.body.classList.remove("modal-dialog");
  evt.preventDefault();
}

//
// accordionToggleClicked
//
//    Use this function in the onclick of a button controlling an
//    expanding accordion where the aria-expanded attribute is
//    used to indicate the expanded or collapsed state of the content.
//
function accordionToggleClicked(event) {
  const toggle = event.target.closest(".accordion__toggle");
  const isExpanded = toggle.getAttribute("aria-expanded") === "true";

  if (isExpanded) {
    toggle.setAttribute("aria-expanded", "false");
  } else {
    toggle.setAttribute("aria-expanded", "true");
  }
}

function accordionOptionClicked(evt) {
  // ignore all click events not bubbled from the actual input element
  if (evt.target.tagName !== "INPUT") {
    return;
  }

  const name = evt.target.name;
  const value = evt.target.value;

  coffeeOptions[name] = value;
  if (name === "format") {
    if (value == "capsule") {
      coffeeOptions["using"] = "using";
    } else {
      coffeeOptions["using"] = "as";
    }
  }
  updateOrderText();
  updatePlanOrderSubmit();
  updatePricing();
}

const pricing = {
  "250g": {
    weekly: 7.2,
    "bi-weekly": 9.6,
    monthly: 12.0,
  },
  "500g": {
    weekly: 13.0,
    "bi-weekly": 17.5,
    monthly: 22.0,
  },
  "1000g": {
    weekly: 22.0,
    "bi-weekly": 32.0,
    monthly: 42.0,
  },
};

function updatePricing() {
  const quantity = coffeeOptions["quantity"];
  const frequency = coffeeOptions["frequency"];
  let multiplier = 1;
  if (frequency === "bi-weekly") {
    multiplier = 2;
  } else if (frequency === "weekly") {
    multiplier = 4;
  }

  if (quantity && frequency) {
    const price = pricing[quantity][frequency] * multiplier;

    // obtain all elements of class order-confirmation__price and
    // replace the text node with the price text.
    const priceElements = Array.from(
      document.querySelectorAll(".order-confirmation__price")
    );
    priceElements.forEach((el) => {
      let text = [];
      if (el.classList.contains("order-confirmation__button-price")) {
        text.push(" -");
      }
      text.push(" $");
      text.push(price.toFixed(2));
      text.push(" / mo");
      el.innerHTML = text.join("");
    });
  }
}

function updateGrindCategory(selection) {
  const grindSideNav = document.querySelector(
    '.plan__side-nav li[data-category="grind"]'
  );

  if (selection === "capsule") {
    coffeeOptions["using"] = "using";
    // remove the grind category from coffeeOptions
    delete coffeeOptions["grind"];
    const grindAccordion = document.getElementById("accordion--grind");
    const grindAccordionOptions = Array.from(grindAccordion.children).find(
      (el) => el.classList.contains("accordion__option-set")
    );
    const grindOptions = Array.from(grindAccordionOptions.children);
    grindOptions.forEach((option) => {
      option.classList.remove("accordion__option--selected");
    });
    // close and disable the grind accordion
    grindAccordion.setAttribute("aria-expanded", "false");
    grindAccordion.setAttribute("disabled", "");
    grindSideNav.setAttribute("disabled", "");
  } else {
    coffeeOptions["using"] = "as";
    // enable the grind accordion
    const grindAccordion = document.getElementById("accordion--grind");
    grindAccordion.removeAttribute("disabled");
    grindSideNav.removeAttribute("disabled");
  }
}

/*
### Expected bahaviour

The interactive subscription page has a number of specific behaviours, which are listed below:

- If "Capsule" is selected for the first option
  - The "Want us to grind them?" section should be disabled and not able to be opened
- Order summary texts updates
  - If "Capsule" is selected, update the order summary text to:
    - "I drink my coffee **using** Capsules"
    - Remove the grind selection text
  - If "Filter" or "Espresso" are selected, update the order summary text to:
    - "I drink my coffee **as** Filter||Espresso"
    - Keep/Add the grind selection text
  - For all other selections, add the selection title in the blank space where appropriate
- Updating per shipment price (shown in "How often should we deliver?" section at the bottom) based on weight selected
  - If 250g weight is selected
    - Every Week price per shipment is $7.20
    - Every 2 Weeks price per shipment is $9.60
    - Every Month price per shipment is $12.00
  - If 500g weight is selected
    - Every Week price per shipment is $13.00
    - Every 2 Weeks price per shipment is $17.50
    - Every Month price per shipment is $22.00
  - If 1000g weight is selected
    - Every Week price per shipment is $22.00
    - Every 2 Weeks price per shipment is $32.00
    - Every Month price per shipment is $42.00
- Calculating per month cost for the Order Summary modal
  - If Every Week is selected, the Order Summary modal should show the per shipment price multiplied by 4. For example, if 250g weight is selected, the price would be $28.80/month
  - If Every 2 Weeks is selected, the Order Summary modal should show the per shipment price multiplied by 2. For example, if 250g weight is selected, the price would be $19.20/month
  - If Every Month is selected, the Order Summary modal should show the per shipment price multiplied by 1. For example, if 250g weight is selected, the price would be $12.00/month

The designs show these differences, so you can refer to them to get an idea of what's needed for the different states.
 */

function updateOrderText() {
  const orderText = document.getElementById("order-text");
  const orderConfirmationText = document.getElementById(
    "order-confirmation-text"
  );

  let text = ["&ldquo;I drink my coffee "];
  text.push(coffeeOptions["using"] || "using");
  text.push(
    " <span class='order--highlight'>" +
      (coffeeOptions["format"] || "___") +
      "</span>"
  );
  text.push(
    ", with a <span class='order--highlight'>" +
      (coffeeOptions["type"] || "___") +
      "</span> type of bean.  "
  );
  text.push(
    "<span class='order--highlight'>" +
      (coffeeOptions["quantity"] || "___") +
      "</span> "
  );
  if (coffeeOptions["grind"]) {
    text.push(
      "ground ala <span class='order--highlight'>" +
        (coffeeOptions["grind"] || "___") +
        "</span>"
    );
  }
  text.push(
    ", sent to me <span class='order--highlight'>" +
      (coffeeOptions["frequency"] || "___") +
      "</span>.&rdquo;"
  );

  orderText.innerHTML = text.join("");
  orderConfirmationText.innerHTML = text.join("");
}

function updatePlanOrderSubmit() {
  const button = document.getElementById("plan__order-submit");
  if (
    coffeeOptions["using"] &&
    coffeeOptions["format"] &&
    coffeeOptions["type"] &&
    coffeeOptions["quantity"] &&
    (coffeeOptions["grind"] || coffeeOptions["format"] === "capsule") &&
    coffeeOptions["frequency"]
  ) {
    // enable button
    button.removeAttribute("disabled");
  } else {
    // disable button
    button.setAttribute("disabled", "");
  }
}

//
// updatePlanSideNav
//
//    Set or clear the data-selected attribute on the side-nav li element
//    to indicate the first incomplete accordion.  Leave the last delivery
//    one selected even if completed.
//
function updatePlanSideNav(category) {
  const sideNavList = document.querySelector(".plan__side-nav ul");

  Array.from(sideNavList.children).forEach((element) => {
    if (element.getAttribute("data-category") === category) {
      element.setAttribute("data-selected", "");
    } else {
      element.removeAttribute("data-selected");
    }
  });
}
