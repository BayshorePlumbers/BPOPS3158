// Updated general.js

document.addEventListener('DOMContentLoaded', function () {
  const inputFields = document.querySelectorAll('input, select');
  inputFields.forEach(function (input) {
      input.addEventListener('input', calculateFinalPrice);
      input.addEventListener('change', calculateFinalPrice);
  });

  // Add event listener for the Print button
  document.getElementById('printBtn').addEventListener('click', printEstimate);

  calculateFinalPrice(); // Initial calculation on page load
});

function calculateFinalPrice() {
  const pdu = document.getElementById('pdu').value.toUpperCase();
  const epd = parseFloat(document.getElementById('epd').value) || 0;
  const material = parseFloat(document.getElementById('material').value) || 0;
  const rentals = parseFloat(document.getElementById('rentals').value) || 0;
  const am = parseInt(document.getElementById('am').value) || 0;
  const permits = Array.from(document.querySelectorAll('#permits input[name="permits"]:checked')).map(input => input.value);
  const discount = document.getElementById('discount').value;
  const financingOption = document.getElementById('financing').value;
  const finalPriceSpan = document.getElementById('finalPrice');

  let finalPrice = 0;

  // Calculate project duration cost and other fixed multipliers
  let projectDurationCost = pdu === 'DAYS' ? epd * 8 * 490 : epd * 490;
  let materialCost = material * 2;
  let rentalCost = rentals * 1.5;

  // Calculate machinery/equipment cost using checkboxes:
  let machineryCost = 0;
  let selectedMachines = [];
  const machineCheckboxes = document.querySelectorAll('.machine:checked');
  machineCheckboxes.forEach(function(checkbox) {
    const price = parseFloat(checkbox.getAttribute('data-price')) || 0;
    // If the unit is DAYS, multiply daily cost by duration; if HOURS, assume 8 hours per day conversion.
    if (pdu === 'DAYS') {
      machineryCost += price * epd;
    } else {
      machineryCost += (price / 8) * epd;
    }
    selectedMachines.push(checkbox.value);
  });

  // Calculate labor cost
  let laborCost = pdu === 'DAYS' ? am * epd * 8 * 85 : am * epd * 85;

  // Calculate permits cost
  let permitsCost = 0;
  permits.forEach(permit => {
      switch (permit) {
          case 'building':
              permitsCost += 1000;
              break;
          case 'encroachment':
              permitsCost += 3300;
              break;
          case 'sewer':
              permitsCost += 1000;
              break;
      }
  });

  // Sum up all costs to compute total cost
  let totalCost = projectDurationCost + materialCost + rentalCost + machineryCost + laborCost + permitsCost;
  let discountValue = 0;

  // Apply discounts if applicable
  if (discount === '5%') {
      discountValue = totalCost * 0.05;
      finalPrice = totalCost - discountValue;
  } else if (discount === '10%') {
      discountValue = totalCost * 0.1;
      finalPrice = totalCost - discountValue;
  } else {
      finalPrice = totalCost;
  }

  // Financing adjustments
  if (financingOption === '2611') {
      finalPrice *= 1.05;
  } else if (financingOption === '9998') {
      finalPrice *= 1.055;
  }

  // Increase by 20% if AFTER HOURS is enabled
  const afterHours = document.getElementById('afterHours').checked;
  if (afterHours) {
      finalPrice += finalPrice * 0.2;
  }

  // Update the displayed final price
  finalPriceSpan.textContent = '$' + finalPrice.toFixed(2);

  // Display the breakdown summary including selected machinery details
  displayBreakdown(projectDurationCost, materialCost, rentalCost, machineryCost, laborCost, permitsCost, discountValue, selectedMachines);
}

function displayBreakdown(projectDurationCost, materialCost, rentalCost, machineryCost, laborCost, permitsCost, discountValue, selectedMachines) {
  let machineList = selectedMachines.length ? selectedMachines.join(', ') : 'None';
  let breakdown = `
      <strong>ESTIMATE SUMMARY:</strong><br>
      &nbsp;&nbsp;&nbsp;&nbsp;- Project Duration Cost: $${projectDurationCost.toFixed(2)}<br>
      &nbsp;&nbsp;&nbsp;&nbsp;- Material Cost: $${materialCost.toFixed(2)}<br>
      &nbsp;&nbsp;&nbsp;&nbsp;- Rental Cost: $${rentalCost.toFixed(2)}<br>
      &nbsp;&nbsp;&nbsp;&nbsp;- Machinery/Equipment Cost: $${machineryCost.toFixed(2)}<br>
      &nbsp;&nbsp;&nbsp;&nbsp;- Selected Machinery/Equipment: ${machineList}<br>
      &nbsp;&nbsp;&nbsp;&nbsp;- Labor Cost: $${laborCost.toFixed(2)}<br>
      &nbsp;&nbsp;&nbsp;&nbsp;- Permits Cost: $${permitsCost.toFixed(2)}<br>
      &nbsp;&nbsp;&nbsp;&nbsp;- Discount Applied: -$${discountValue.toFixed(2)}<br>
  `;
  document.getElementById('breakdown').innerHTML = breakdown;
}

function printEstimate() {
  // Gather data from the current page
  const logoSrc = document.querySelector('.logo').src;
  const finalPrice = document.getElementById('finalPrice').textContent;
  const breakdownText = document.getElementById('breakdown').innerText;

  // Convert breakdown text into an array and remove any empty lines
  let breakdownRows = breakdownText.split('\n').filter(row => row.trim() !== '');
  
  // Remove the header line if it includes "ESTIMATE SUMMARY:"
  if (breakdownRows.length && breakdownRows[0].toUpperCase().includes("ESTIMATE SUMMARY:")) {
    breakdownRows.shift();
  }

  // Build an HTML table from the breakdown lines
  let tableHTML = `
    <table class="input-data">
      <thead>
        <tr>
          <th>Field Name</th>
          <th>Cost / Value</th>
        </tr>
      </thead>
      <tbody>
  `;
  breakdownRows.forEach(row => {
    const cleanedRow = row.replace(/^[\s\-]+/, ''); // remove leading dashes/spaces
    if (cleanedRow.includes(':')) {
      const parts = cleanedRow.split(':');
      const field = parts[0].trim();
      const value = parts.slice(1).join(':').trim();
      tableHTML += `<tr><td>${field}</td><td>${value}</td></tr>`;
    }
  });
  tableHTML += '</tbody></table>';

  // Open a new window for printing and include brandprint.css for consistent styling
  const printWindow = window.open('', '_blank', 'width=800,height=600');
  printWindow.document.open();
  printWindow.document.write(`
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <title>Estimate Summary - Bayshore Plumbers</title>
      <link rel="stylesheet" href="brandprint.css" type="text/css">
    </head>
    <body>
      <div class="print-container">
        <header>
          <img src="${logoSrc}" alt="Bayshore Plumbers Logo" class="logo">
          <h1>Estimate Summary - Bayshore Plumbers</h1>
        </header>
        <div class="summary">
          ${tableHTML}
          <p><strong>Final Bidding Price:</strong> ${finalPrice}</p>
        </div>
      </div>
    </body>
    </html>
  `);
  printWindow.document.close();
  printWindow.focus();

  // Trigger printing after a short delay
  setTimeout(() => {
    printWindow.print();
  }, 400);
}
