(function () {
    function initializeExtension() {
        const existingWidget = document.getElementById('cgpa-widget');
        if (existingWidget) {
            existingWidget.remove();
        }

        // Grade point mapping
        const gradePoints = {
            'A+': 4.00,
            'A': 3.75,
            'A-': 3.50,
            'B+': 3.25,
            'B': 3.00,
            'B-': 2.75,
            'C+': 2.50,
            'C': 2.25,
            'D': 2.00,
            'F': 0.00
        };

        // Inject required styles if not already present
        if (!document.getElementById('cgpa-calculator-styles')) {
            const styleSheet = document.createElement("style");
            styleSheet.id = 'cgpa-calculator-styles';
            styleSheet.textContent = `
                @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&display=swap');

                .cgpa-widget {
                    position: fixed;
                    top: 20px;
                    right: 20px;
                    font-family: 'Poppins', sans-serif;
                    z-index: 9999;
                    display: flex;
                    flex-direction: column;
                    gap: 10px;
                    transition: all 0.3s ease;
                }

                .cgpa-card {
                    position: relative;
                    background: linear-gradient(135deg, #2193b0, #6dd5ed);
                    border-radius: 12px;
                    padding: 20px;
                    color: white;
                    box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
                    backdrop-filter: blur(10px);
                    border: 1px solid rgba(255, 255, 255, 0.1);
                    min-width: 250px;
                }

                .close-btn {
                    position: absolute;
                    top: 0px;
                    right: 0px;
                    background: rgba(255, 255, 255, 0.2);
                    border: none;
                    color: white;
                    width: 32px;
                    height: 32px;
                    border-radius: 16px;
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 24px;
                    font-weight: 300;
                    transition: all 0.3s ease;
                    padding: 0;
                    line-height: 0;
                    text-align: center;
                    user-select: none;
                    -webkit-user-select: none;
                }

                .close-btn:hover {
                    background: rgba(255, 255, 255, 0.3);
                    transform: scale(1.1);
                }

                .close-btn:active {
                    transform: scale(0.95);
                }

                .cgpa-title {
                    font-size: 13px;
                    font-weight: 500;
                    margin-bottom: 8px;
                    text-transform: uppercase;
                    letter-spacing: 1px;
                    opacity: 0.9;
                    padding-right: 40px;
                }

                .cgpa-value {
                    font-size: 42px;
                    font-weight: 600;
                    margin: 0;
                    letter-spacing: -1px;
                }

                .termwise-card {
                    background: white;
                    border-radius: 12px;
                    padding: 20px;
                    box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
                    color: #333;
                    max-height: 400px;
                    overflow-y: auto;
                }

                .term-title {
                    font-size: 13px;
                    font-weight: 600;
                    color: #2193b0;
                    margin-bottom: 15px;
                    text-transform: uppercase;
                    letter-spacing: 1px;
                }

                .term-item {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    padding: 10px 0;
                    border-bottom: 1px solid #eee;
                }

                .term-item:last-child {
                    border-bottom: none;
                }

                .term-name {
                    font-size: 14px;
                    color: #555;
                    font-weight: 400;
                }

                .term-gpa {
                    font-size: 15px;
                    font-weight: 600;
                    color: #2193b0;
                }

                .recalculate-btn {
                    background: white;
                    color: #2193b0;
                    border: none;
                    padding: 12px 20px;
                    border-radius: 8px;
                    cursor: pointer;
                    font-family: 'Poppins', sans-serif;
                    font-size: 14px;
                    font-weight: 500;
                    transition: all 0.3s ease;
                    box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 8px;
                    letter-spacing: 0.3px;
                }

                .recalculate-btn:hover {
                    transform: translateY(-2px);
                    box-shadow: 0 6px 20px rgba(0, 0, 0, 0.15);
                }

                .recalculate-btn:active {
                    transform: translateY(0);
                }

                /* Scrollbar Styling */
                .termwise-card::-webkit-scrollbar {
                    width: 8px;
                }

                .termwise-card::-webkit-scrollbar-track {
                    background: #f1f1f1;
                    border-radius: 4px;
                }

                .termwise-card::-webkit-scrollbar-thumb {
                    background: #2193b0;
                    border-radius: 4px;
                }

                .termwise-card::-webkit-scrollbar-thumb:hover {
                    background: #1a7a8c;
                }

                /* Animation */
                @keyframes slideIn {
                    from {
                        opacity: 0;
                        transform: translateX(20px);
                    }
                    to {
                        opacity: 1;
                        transform: translateX(0);
                    }
                }

                .cgpa-widget {
                    animation: slideIn 0.5s ease-out;
                }
            `;
            document.head.appendChild(styleSheet);
        }

        // Function to wait for table updates
        function waitForTableUpdate() {
            return new Promise((resolve) => {
                setTimeout(() => {
                    resolve();
                }, 100); // Small delay to ensure table is updated
            });
        }

        async function calculateAndDisplayCGPA() {
            // Wait a moment for any table updates to complete
            await waitForTableUpdate();

            // Get the result table
            const table = document.getElementById('dynamic-table');
            if (!table) {
                alert('Could not find the result table. Please make sure you are on the correct page.');
                return;
            }

            let totalCredit = 0;
            let totalGradePoint = 0;

            // Get all rows from tbody
            const tbody = table.getElementsByTagName('tbody')[0];
            if (!tbody) return;

            const rows = tbody.getElementsByTagName('tr');

            for (let row of rows) {
                const cells = row.getElementsByTagName('td');
                if (cells.length >= 5) {  // Make sure we have enough cells
                    const credit = parseFloat(cells[1].textContent);
                    const grade = cells[4].textContent.trim();

                    if (!isNaN(credit) && gradePoints.hasOwnProperty(grade)) {
                        totalCredit += credit;
                        totalGradePoint += credit * gradePoints[grade];
                    }
                }
            }

            const cgpa = totalGradePoint / totalCredit;

            // Calculate term-wise CGPA
            const termGrades = {};

            for (let row of rows) {
                const cells = row.getElementsByTagName('td');
                if (cells.length >= 5) {  // Make sure we have enough cells
                    const credit = parseFloat(cells[1].textContent);
                    const term = cells[2].textContent.trim();
                    const grade = cells[4].textContent.trim();

                    if (!isNaN(credit) && term) {
                        if (!termGrades[term]) {
                            termGrades[term] = {
                                totalCredit: 0,
                                totalGradePoint: 0
                            };
                        }

                        if (gradePoints.hasOwnProperty(grade)) {
                            termGrades[term].totalCredit += credit;
                            termGrades[term].totalGradePoint += credit * gradePoints[grade];
                        }
                    }
                }
            }

            // Create or update the widget
            let widget = document.getElementById('cgpa-widget');
            if (!widget) {
                widget = document.createElement('div');
                widget.id = 'cgpa-widget';
                widget.className = 'cgpa-widget';
                document.body.appendChild(widget);
            }

            // Update widget content
            widget.innerHTML = `
                <div class="cgpa-card">
                    <button class="close-btn" id="close-btn">×</button>
                    <div class="cgpa-title">Overall CGPA</div>
                    <div class="cgpa-value">${cgpa.toFixed(2)}</div>
                </div>
                <div class="termwise-card">
                    <div class="term-title">Term-wise GPA</div>
                    ${Object.entries(termGrades)
                    .sort((a, b) => a[0].localeCompare(b[0]))
                    .map(([term, data]) => `
                            <div class="term-item">
                                <span class="term-name">${term}</span>
                                <span class="term-gpa">${(data.totalGradePoint / data.totalCredit).toFixed(2)}</span>
                            </div>
                        `).join('')}
                </div>
                <button class="recalculate-btn" id="recalculate-btn">
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M13.65 2.35C12.2 0.9 10.21 0 8 0C3.58 0 0 3.58 0 8C0 12.42 3.58 16 8 16C11.73 16 14.84 13.45 15.73 10H13.65C12.83 12.33 10.61 14 8 14C4.69 14 2 11.31 2 8C2 4.69 4.69 2 8 2C9.66 2 11.14 2.69 12.22 3.78L9 7H16V0L13.65 2.35Z" fill="#2193b0"/>
                    </svg>
                    Recalculate
                </button>
            `;

            // Add click event listeners
            const closeBtn = document.getElementById('close-btn');
            const recalculateBtn = document.getElementById('recalculate-btn');

            if (closeBtn) {
                closeBtn.addEventListener('click', () => {
                    widget.remove();
                });
            }

            if (recalculateBtn) {
                recalculateBtn.addEventListener('click', calculateAndDisplayCGPA);
            }
        }

        // Initial calculation
        calculateAndDisplayCGPA();
    }

    // Listen for custom event from extension icon click
    document.addEventListener('triggerCGPACalculation', initializeExtension);

    // Auto-load when page loads
    initializeExtension();
})();
