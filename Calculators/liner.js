document.addEventListener('DOMContentLoaded', function () {
    document.querySelectorAll('input, select').forEach((element) => {
      element.addEventListener('input', calculateTotal);
    });
  
    // Add event listener for the Print button
    document.getElementById('printBtn').addEventListener('click', printEstimate);
  });
  
  function calculateTotal() {
    let length = parseInt(document.getElementById('length').value) || 0;
  
    // Validate length if a value is entered
    if (document.getElementById('length').value !== '' && length <= 0) {
      alert('Length must be a positive number.');
      return;
    }
  
    let houseCleanOut = getCheckboxValue('houseCleanOut', 1500);
    let propertyLineCleanOut = getCheckboxValue('propertyLineCleanOut', 2500);
    let landscape = parseInt(document.getElementById('landscape').value) || 0;
    let reInstate = parseInt(document.getElementById('reInstate').value) || 0;
    let buildingPermit = getCheckboxValue('buildingPermit', 350);
    let otherExpenses = parseFloat(document.getElementById('otherExpenses').value) || 0;
  
    // Calculate base price based on length
    let basePrice = calculateBasePrice(length);
  
    // Calculate total cost
    let totalCost = basePrice + houseCleanOut + propertyLineCleanOut + landscape +
      (reInstate * 1500) + buildingPermit + otherExpenses;
  
    let discountValue = 0;
    const discount = document.getElementById('discount')?.value || 'no discount';
  
    // Apply discount
    if (discount === '5%') {
      discountValue = totalCost * 0.05;
      totalCost -= discountValue;
    } else if (discount === '10%') {
      discountValue = totalCost * 0.1;
      totalCost -= discountValue;
    }
  
    // After Hours adjustment
    const afterHours = document.getElementById('afterHours').checked;
    if (afterHours) {
      totalCost += totalCost * 0.2;
    }
  
    // Format total cost as currency
    let formattedTotal = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(totalCost);
    document.getElementById('totalPrice').innerText = formattedTotal;
  
    // Display breakdown summary
    displayBreakdown(basePrice, houseCleanOut, propertyLineCleanOut, landscape, reInstate, buildingPermit, otherExpenses, discountValue);
  }
  
  function calculateBasePrice(length) {
    if (length <= 5) return 4000;
    if (length === 6) return 4000 + 385;
    if (length === 7) return 4000 + 385 * 2;
    if (length === 8) return 4000 + 385 * 3;
    if (length === 9) return 4000 + 385 * 4;
    if (length === 10) return 5000;
    if (length === 11) return 5000 + 385;
    if (length === 12) return 5000 + 385 * 2;
    if (length === 13) return 5000 + 385 * 3;
    if (length >= 14) return 385 * length;
    return 5000 + (length - 10) * 385;
  }
  
  function getCheckboxValue(id, cost) {
    return document.getElementById(id).checked ? cost : 0;
  }
  
  function displayBreakdown(basePrice, houseCleanOut, propertyLineCleanOut, landscape, reInstate, buildingPermit, otherExpenses, discountValue) {
    let breakdown = `
      <strong>ESTIMATE SUMMARY:</strong><br>
      &nbsp;&nbsp;&nbsp;&nbsp;- Base Price: $${basePrice.toFixed(2)}<br>
      &nbsp;&nbsp;&nbsp;&nbsp;- House Clean Out: $${houseCleanOut}<br>
      &nbsp;&nbsp;&nbsp;&nbsp;- Property Line Clean Out: $${propertyLineCleanOut}<br>
      &nbsp;&nbsp;&nbsp;&nbsp;- Landscape: $${landscape}<br>
      &nbsp;&nbsp;&nbsp;&nbsp;- Re-Instate (${reInstate}): $${(reInstate * 1500).toFixed(2)}<br>
      &nbsp;&nbsp;&nbsp;&nbsp;- Building Permit: $${buildingPermit}<br>
      &nbsp;&nbsp;&nbsp;&nbsp;- Other Expenses: $${otherExpenses.toFixed(2)}<br>
      &nbsp;&nbsp;&nbsp;&nbsp;- Discount Applied: -$${discountValue.toFixed(2)}
    `;
    document.getElementById('breakdown').innerHTML = breakdown;
  }
  
  /**
   * printEstimate():
   * - Parses the breakdown text (from innerText) into rows,
   * - Builds an HTML table from those rows,
   * - Opens a new window containing only the print summary,
   * - Loads "linerprint.css" to force a clean print view.
   */
  function printEstimate() {
    const logoSrc = document.querySelector('.logo').src;
    const totalPrice = document.getElementById('totalPrice').textContent;
    const breakdownText = document.getElementById('breakdown').innerText;
  
    // Split breakdownText into lines and filter out empties
    let breakdownRows = breakdownText.split('\n').filter(row => row.trim() !== '');
  
    // Remove the header line if present
    if (breakdownRows.length && breakdownRows[0].toUpperCase().includes("ESTIMATE SUMMARY:")) {
      breakdownRows.shift();
    }
  
    // Build table HTML from the breakdown rows
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
      // Remove leading dashes/spaces, then split at the first colon
      let cleanedRow = row.replace(/^[\s\-]+/, '');
      if (cleanedRow.includes(':')) {
        let parts = cleanedRow.split(':');
        let field = parts[0].trim();
        let value = parts.slice(1).join(':').trim();
        tableHTML += `<tr><td>${field}</td><td>${value}</td></tr>`;
      }
    });
    tableHTML += `</tbody></table>`;
  
    // Open a new window for print preview with only the summary content
    const printWindow = window.open('', '_blank', 'width=800,height=600');
    printWindow.document.write(`
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <title>Liner Estimate Summary</title>
        <link rel="stylesheet" href="brandprint.css" type="text/css">
      </head>
      <body>
        <div class="print-container">
          <header>
            <img src="${logoSrc}" alt="Bayshore Plumbers Logo" class="logo">
            <h1>Estimate Summary - Cured In Place (CIP) Solutions</h1>
          </header>
          <div class="summary">
            ${tableHTML}
            <p><strong>Total Price:</strong> ${totalPrice}</p>
          </div>
        </div>
      </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => {
      printWindow.print();
    }, 400);
  }
  