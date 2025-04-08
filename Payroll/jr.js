document.addEventListener('DOMContentLoaded', () => {
    // Grab elements
    const projectDurationInput = document.getElementById('pd');
    const totalPriceInput = document.getElementById('tp');
    const materialExpensesInput = document.getElementById('material');
    const otherExpensesInput = document.getElementById('oe');
    const calculateBtn = document.getElementById('calculateBtn');
    const printButton = document.getElementById('printButton');
    const bppField = document.getElementById('bpp');
    const jobBustMessage = document.getElementById('jobBustMessage');
  
    // Helper to retrieve labor input values
    const getLaborValues = () => {
      return {
        day1: parseFloat(document.getElementById('day1').value) || 0,
        day2: parseFloat(document.getElementById('day2').value) || 0,
        day3: parseFloat(document.getElementById('day3').value) || 0,
        day4: parseFloat(document.getElementById('day4').value) || 0,
        day5: parseFloat(document.getElementById('day5').value) || 0,
        additionalHours: parseFloat(document.getElementById('ah').value) || 0,
        overtimeHours: parseFloat(document.getElementById('toh').value) || 0
      };
    };
  
    // Validate and round project duration
    function validateDuration() {
      let duration = parseFloat(projectDurationInput.value) || 0;
      if (duration < 1) {
        alert("Project Duration cannot be less than 1 hour.");
        projectDurationInput.value = 1;
      } else {
        projectDurationInput.value = roundDuration(duration);
      }
    }
  
    function roundDuration(duration) {
      if (duration >= 1.1 && duration <= 1.49) return 1.5;
      if (duration >= 1.51 && duration <= 1.99) return 2;
      if (duration >= 2.1 && duration <= 2.49) return 2.5;
      if (duration >= 2.51 && duration <= 2.99) return 3;
      for (let i = 3; i <= 100; i++) {
        if (duration >= i + 0.1 && duration <= i + 0.49) return (i + 0.5).toFixed(1);
        if (duration >= i + 0.51 && duration <= i + 0.99) return (i + 1).toFixed(1);
      }
      return duration;
    }
  
    projectDurationInput.addEventListener("change", validateDuration);
  
    // Main calculation function
    function calculateReport() {
      const totalPrice = parseFloat(totalPriceInput.value) || 0;
      const materialExpenses = parseFloat(materialExpensesInput.value) || 0;
      const otherExpenses = parseFloat(otherExpensesInput.value) || 0;
      const projectDuration = parseFloat(projectDurationInput.value) || 0;
      const { day1, day2, day3, day4, day5, additionalHours, overtimeHours } = getLaborValues();
  
      const totalHours = day1 + day2 + day3 + day4 + day5 + additionalHours + (1.5 * overtimeHours);
      document.getElementById('totalHours').value = totalHours.toFixed(2);
  
      // Gross amount before commission and overheads
      const grossAmount = totalPrice - (materialExpenses * 1.2) - (totalHours * 75) - otherExpenses;
      const salesCommission = totalPrice * 0.1; // 10% commission
      const overheads = projectDuration * 246;
      const profitBeforeKicker = grossAmount - overheads - salesCommission;
      const initialBpp = totalPrice !== 0 ? ((profitBeforeKicker / totalPrice) * 100).toFixed(2) : '0.00';
  
      // Display JOB BUST message if profit is very low
      if (parseFloat(initialBpp) < 10) {
        jobBustMessage.textContent = "RESULT: JOB BUST";
      } else {
        jobBustMessage.textContent = "";
      }
  
      // Kicker calculation (only if initial BP% is at least 30%)
      let kicker = 0;
      let computedKicker = 0;
      if (parseFloat(initialBpp) >= 30) {
        if (parseFloat(initialBpp) >= 35.01 && parseFloat(initialBpp) <= 39.99) {
          computedKicker = 0.010 * totalPrice;
        } else if (parseFloat(initialBpp) >= 40.01 && parseFloat(initialBpp) <= 49.99) {
          computedKicker = 0.015 * totalPrice;
        } else if (parseFloat(initialBpp) >= 50.01 && parseFloat(initialBpp) <= 59.99) {
          computedKicker = 0.020 * totalPrice;
        } else if (parseFloat(initialBpp) >= 60.01) {
          computedKicker = 0.025 * totalPrice;
        }
        let allowedKicker = profitBeforeKicker - (0.30 * totalPrice);
        if (allowedKicker < 0) allowedKicker = 0;
        kicker = Math.min(computedKicker, allowedKicker);
      }
  
      document.getElementById('kicker').textContent = `$${kicker.toFixed(2)}`;
  
      // Recalculate profit after kicker and show the real BP%
      const profitAfterKicker = profitBeforeKicker - kicker;
      const realBpp = totalPrice !== 0 ? ((profitAfterKicker / totalPrice) * 100).toFixed(2) : '0.00';
  
      // Display BP% with emoji feedback
      let realBppDisplay = '';
      const realBppValue = parseFloat(realBpp);
      if (realBppValue < 10) {
        realBppDisplay = `👎: JOB BUST. PLEASE SEE GM`;
      } else if (realBppValue >= 10 && realBppValue <= 19.99) {
        realBppDisplay = `😬: MARGINAL PROFIT`;
      } else if (realBppValue >= 20 && realBppValue <= 29.99) {
        realBppDisplay = `👍: GOOD WORK`;
      } else if (realBppValue >= 30 && realBppValue <= 39.99) {
        realBppDisplay = `😀: NICE WORK`;
      } else if (realBppValue >= 40 && realBppValue <= 49.99) {
        realBppDisplay = `⭐: GREAT WORK`;
      } else if (realBppValue >= 50) {
        realBppDisplay = `🌟: EXCELLENT WORK`;
      }
      bppField.value = realBppDisplay;
  
      // Calculate SW, WH, and RD percentages (all the same calculation)
      const sw = totalPrice !== 0 ? ((materialExpenses * 1.2) / totalPrice) * 100 : 0;
      document.getElementById('sw').value = sw.toFixed(2);
      document.getElementById('wh').value = sw.toFixed(2);
      document.getElementById('rd').value = sw.toFixed(2);
    }
  
    // Recalculate when "Generate Report" is clicked or any input changes
    calculateBtn.addEventListener("click", calculateReport);
    document.querySelectorAll('input').forEach(input => {
      input.addEventListener('input', calculateReport);
    });
  
    // Custom print confirmation and functionality
    printButton.addEventListener('click', (event) => {
      event.preventDefault();
      const userConfirmed = confirm("I HEREBY CONFIRM THAT ALL THE CONTENTS OF THIS DOCUMENT ARE CORRECT AND I TAKE FULL RESPONSIBILITY OF THIS DOCUMENT.");
      if (userConfirmed) {
        openPrintWindow();
      }
    });

    function openPrintWindow() {
        // First, run calculateReport() to ensure all values are up to date
        calculateReport();
      
        // Compute the absolute base URL for payrollprint.css
        const fullPath = window.location.href;
        const baseUrl = fullPath.substring(0, fullPath.lastIndexOf('/') + 1);
      
        // Gather data from the form
        const reportData = {
          jobAddress: document.getElementById('ja').value,
          totalPrice: document.getElementById('tp').value,
          materialExpenses: document.getElementById('material').value,
          otherExpenses: document.getElementById('oe').value,
          projectDuration: document.getElementById('pd').value,
          notes: document.getElementById('notes').value,
          labor: {
            day1: document.getElementById('day1').value,
            day2: document.getElementById('day2').value,
            day3: document.getElementById('day3').value,
            day4: document.getElementById('day4').value,
            day5: document.getElementById('day5').value,
            additionalHours: document.getElementById('ah').value,
            overtimeHours: document.getElementById('toh').value,
            totalHours: document.getElementById('totalHours').value
          },
          officeUse: {
            sw: document.getElementById('sw').value,
            wh: document.getElementById('wh').value,
            rd: document.getElementById('rd').value,
            bpp: document.getElementById('bpp').value
          },
          kicker: document.getElementById('kicker').textContent
        };
      
        // Build the print HTML using the same structure/classes as htech.js
        const printHTML = `
          <!DOCTYPE html>
          <html lang="en">
          <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Project Report - Bayshore Plumbers</title>
            <link rel="stylesheet" href="${baseUrl}payrollprint.css" type="text/css" media="print">
          </head>
          <body>
            <div class="top-bar">
              <div class="logo-container">
                <img src="BP.png" alt="Bayshore Plumbers Logo" class="logo">
              </div>
              <h1>PROJECT REPORT</h1>
            </div>
            <div class="container">
              <div class="no-break details-section">
                <h3>DETAILS:</h3>
                <table class="input-data">
                  <tr><th>Job Address</th><td>${reportData.jobAddress}</td></tr>
                  <tr><th>Total Price</th><td>${reportData.totalPrice}</td></tr>
                  <tr><th>Material Expenses</th><td>${reportData.materialExpenses}</td></tr>
                  <tr><th>Other Expenses</th><td>${reportData.otherExpenses}</td></tr>
                  <tr><th>Project Duration</th><td>${reportData.projectDuration}</td></tr>
                  <tr><th>Job Description</th><td>${reportData.notes}</td></tr>
                </table>
              </div>
              <div class="no-break">
                <h3>LABOR DETAILS:</h3>
                <table class="input-data">
                  <tr>
                    <th>Day 1</th>
                    <th>Day 2</th>
                    <th>Day 3</th>
                    <th>Day 4</th>
                    <th>Day 5</th>
                  </tr>
                  <tr>
                    <td>${reportData.labor.day1}</td>
                    <td>${reportData.labor.day2}</td>
                    <td>${reportData.labor.day3}</td>
                    <td>${reportData.labor.day4}</td>
                    <td>${reportData.labor.day5}</td>
                  </tr>
                  <tr>
                    <th>Additional Hours</th>
                    <th>Overtime Hours</th>
                    <th>Total Hours</th>
                    <th colspan="2"></th>
                  </tr>
                  <tr>
                    <td>${reportData.labor.additionalHours}</td>
                    <td>${reportData.labor.overtimeHours}</td>
                    <td>${reportData.labor.totalHours}</td>
                    <td colspan="2"></td>
                  </tr>
                </table>
              </div>
              <div class="no-break">
                <h3>FOR OFFICE USE ONLY:</h3>
                <table class="input-data">
                  <tr>
                    <th>SW21/RP21</th><th>WH32</th><th>RD15/UL15</th><th>BP%</th>
                  </tr>
                  <tr>
                    <td>${reportData.officeUse.sw}</td>
                    <td>${reportData.officeUse.wh}</td>
                    <td>${reportData.officeUse.rd}</td>
                    <td>${reportData.officeUse.bpp}</td>
                  </tr>
                </table>
              </div>
              <div class="no-break kicker-section">
                <h3>KICKER DETAILS:</h3>
                <table class="input-data">
                  <tr><th>Kicker</th><td>${reportData.kicker}</td></tr>
                </table>
              </div>
            </div>
          </body>
          </html>
        `;
      
        const printWindow = window.open('', '', 'width=800,height=600');
        printWindow.document.open();
        printWindow.document.write(printHTML);
        printWindow.document.close();
        printWindow.focus();
        printWindow.print();
      }
    });      