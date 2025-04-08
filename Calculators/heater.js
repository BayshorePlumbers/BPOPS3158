document.addEventListener('DOMContentLoaded', function () {
    const inputFields = document.querySelectorAll('#biddingForm input, #biddingForm select');
    inputFields.forEach(function (input) {
      input.addEventListener('input', calculateFinalPrice);
      input.addEventListener('change', calculateFinalPrice);
    });
  
    document.getElementById('printBtn').addEventListener('click', printEstimate);
  
    // Initial calculation on page load
    calculateFinalPrice();
  });
  
  function calculateFinalPrice() {
    const et = parseFloat(document.getElementById('et').value) || 0;
    const material = parseFloat(document.getElementById('material').value) || 0;
    const am = parseFloat(document.getElementById('am').value) || 0;
    const others = parseFloat(document.getElementById('others').value) || 0;
    const discount = document.getElementById('discount').value;
    const permits = document.getElementById('permits').checked;
    const financingOption = document.getElementById('financing').value;
    const finalPriceSpan = document.getElementById('finalPrice');
  
    // Calculate various costs
    let materialCost = material * 1.5;
    let manpowerCost = am * et * 85;
    let othersCost = others * 1.2;
    let permitsCost = permits ? 1000 : 0;
    let estimatedTimeCost = et * 490;
  
    let totalCost = materialCost + manpowerCost + othersCost + permitsCost + estimatedTimeCost;
    let discountValue = 0;
    let finalPrice = 0;
  
    // Apply discount
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
  
    // After hours
    const afterHours = document.getElementById('afterHours').checked;
    if (afterHours) {
      finalPrice += finalPrice * 0.2; // 20% increase
    }
  
    // Show final price
    finalPriceSpan.textContent = '$' + finalPrice.toFixed(2);
  
    // Display breakdown
    displayBreakdown(materialCost, manpowerCost, othersCost, permitsCost, estimatedTimeCost, discountValue);
  }
  
  function displayBreakdown(materialCost, manpowerCost, othersCost, permitsCost, estimatedTimeCost, discountValue) {
    const breakdownHTML = `
      <strong>ESTIMATE SUMMARY:</strong><br>
      &nbsp;&nbsp;&nbsp;&nbsp;- Material Cost: $${materialCost.toFixed(2)}<br>
      &nbsp;&nbsp;&nbsp;&nbsp;- Additional Manpower Cost: $${manpowerCost.toFixed(2)}<br>
      &nbsp;&nbsp;&nbsp;&nbsp;- Other Expenses: $${othersCost.toFixed(2)}<br>
      &nbsp;&nbsp;&nbsp;&nbsp;- Permits Cost: $${permitsCost.toFixed(2)}<br>
      &nbsp;&nbsp;&nbsp;&nbsp;- Estimated Time Cost: $${estimatedTimeCost.toFixed(2)}<br>
      &nbsp;&nbsp;&nbsp;&nbsp;- Discount Applied: -$${discountValue.toFixed(2)}
    `;
    document.getElementById('breakdown').innerHTML = breakdownHTML;
  }
  
  /**
   * printEstimate()
   * - Parses #breakdown text into table rows
   * - Opens a new window with only the summary (heading, logo, table, final price)
   * - References heaterprint.css to ensure we only see the summary in print preview
   */
  function printEstimate() {
    // 1. Gather data from the current page
    const logoSrc = document.querySelector('.logo').src;
    const finalPrice = document.getElementById('finalPrice').textContent;
    const breakdownText = document.getElementById('breakdown').innerText;
  
    // Convert breakdown lines to an array, remove empty lines
    let breakdownRows = breakdownText.split('\n').filter(row => row.trim() !== '');
  
    // If first line is "ESTIMATE SUMMARY:", remove it
    if (breakdownRows.length && breakdownRows[0].toUpperCase().includes("ESTIMATE SUMMARY:")) {
      breakdownRows.shift();
    }
  
    // 2. Build an HTML table from the breakdown lines
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
      // Example row: "- Material Cost: $150.00"
      const cleanedRow = row.replace(/^[\s\-]+/, ''); // remove leading dash/spaces
      if (cleanedRow.includes(':')) {
        const parts = cleanedRow.split(':');
        const field = parts[0].trim();
        const value = parts.slice(1).join(':').trim();
        tableHTML += `<tr><td>${field}</td><td>${value}</td></tr>`;
      }
    });
    tableHTML += '</tbody></table>';
  
    // 3. Open a new window with only the summary
    const printWindow = window.open('', '_blank', 'width=800,height=600');
    printWindow.document.open();
    printWindow.document.write(`
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <title>Water Heater Estimate Summary</title>
        <link rel="stylesheet" href="brandprint.css" type="text/css">
      </head>
      <body>
        <div class="print-container">
          <header>
            <img src="${logoSrc}" alt="Bayshore Plumbers Logo" class="logo">
            <h1>Estimate Summary - Water Heater Solutions</h1>
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
  
    // 4. Trigger print after a short delay
    setTimeout(() => {
      printWindow.print();
    }, 400);
  }
  