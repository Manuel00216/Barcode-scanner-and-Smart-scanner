// Check Barcode
// Check Barcode and Auto-Transition
// 1. Updated checkBarcode to handle the auto-jump
async function checkBarcode() {
    const inputField = document.getElementById("barcodeInput");
    const code = inputField.value.trim();
    
    if (!code) return; // Don't do anything if empty
    
    try {
        const res = await fetch(`/check/${code}`);
        const data = await res.json();

        if (data.length === 0) {
            // If new barcode, register and jump
            await fetch("/register-barcode", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ barcode_number: code })
            });
            proceedToEntryForm(code);
        } else if (data[0].status === "used") {
            alert("This item is already in the inventory!");
            inputField.value = "";
            inputField.focus();
        } else {
            // Valid barcode found, jump to form
            proceedToEntryForm(code);
        }
    } catch (err) {
        console.error(err);
    }
}

// 2. The Jump Function
function proceedToEntryForm(code) {
    const donationMenuItem = document.querySelector('a[onclick*="donation-box"]');
    
    // Switch UI to Donation Box
    showSection('donation-box', donationMenuItem);
    
    // Pass the barcode to the entry form's logic if needed
    // and focus on the next logical field: Donor Name
    setTimeout(() => {
        const donorInput = document.getElementById("donor");
        if(donorInput) donorInput.focus();
    }, 250); // Slight delay helps mobile keyboards behave
}

// 3. Keep the scanner ready (Optional but helpful)
// This refocuses the scan box if the user accidentally taps away
document.addEventListener("click", () => {
    const scanBox = document.getElementById("scan-box");
    if (scanBox && scanBox.style.display !== "none") {
        document.getElementById("barcodeInput").focus();
    }
});

// Save Donation
async function saveDonation() {
    const barcode_number = document.getElementById("barcodeInput").value.trim();
    const donor_name = document.getElementById("donor").value.trim();
    const item_name = document.getElementById("item").value.trim();
    const quantity = document.getElementById("qty").value;
    const expiration_date = document.getElementById("exp").value;

    if (!barcode_number || !donor_name || !item_name || !quantity || !expiration_date) {
        return alert("Please fill all fields!");
    }

    try {
        const res = await fetch("/donation", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ barcode_number, donor_name, item_name, quantity, expiration_date })
        });
        const data = await res.json();

        if (data.error) alert("Error: " + data.error);
        else {
            alert("Donation Saved!");
            loadInventory();
        }
    } catch (err) {
        console.error(err);
        alert("Error connecting to server.");
    }
}

function generateBarcode() {
    const value = document.getElementById("newBarcode").value.trim();
    if (!value) return alert("Enter a value to generate barcode");
    JsBarcode("#barcode", value, { format: "CODE128" });
}


function toggleNotifications() {
    const dropdown = document.getElementById('notif-dropdown');
    dropdown.style.display = dropdown.style.display === 'none' ? 'block' : 'none';
}

// Close dropdown if user clicks elsewhere
window.onclick = function(event) {
    if (!event.target.closest('.notification-wrapper')) {
        document.getElementById('notif-dropdown').style.display = 'none';
    }
}
// Load Inventory
async function loadInventory() {
    try {
        const res = await fetch("/inventory");
        const data = await res.json();

        const table = document.querySelector("#inventoryTable tbody");
        const alertList = document.getElementById("alert-list");
        const badge = document.getElementById("notif-badge");
        
        table.innerHTML = "";
        if (alertList) alertList.innerHTML = ""; 
        let alertCount = 0;

        data.forEach(item => {
            let today = new Date();
            let exp = new Date(item.expiration_date);
            
            // Calculate Remaining Days
            let diffTime = exp - today;
            let diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
            
            let color = "green";
            let daysText = diffDays > 0 ? `${diffDays} days left` : "EXPIRED";

            // Notification Logic
            if (diffDays <= 30) {
                alertCount++;
                if (alertList) {
                    const li = document.createElement("li");
                    li.innerHTML = `<strong>${item.item_name}</strong>: ${daysText}`;
                    alertList.appendChild(li);
                }
                color = diffDays <= 14 ? "red" : "orange";
            }

            const row = `
                <tr style="color:${color}">
                    <td>${item.barcode_number}</td>
                    <td>${item.item_name}</td>
                    <td>${item.quantity}</td>
                    <td>${item.expiration_date}</td>
                    <td class="days-left">${daysText}</td>
                    <td>
                        <button class="btn-edit" onclick="editItem('${item.barcode_number}', '${item.item_name}', ${item.quantity}, '${item.expiration_date}')">Edit</button>
                        <button class="btn-confirm" onclick="confirmUse('${item.barcode_number}', '${item.item_name}')">Used</button>
                    </td>
                </tr>`;
            table.innerHTML += row;
        });

        if (badge) {
            badge.innerText = alertCount;
            badge.style.display = alertCount > 0 ? "block" : "none";
        }

    } catch (err) {
        console.error(err);
    }
}

// FUNCTION: Confirm Item as Used (Delete from DB)
async function confirmUse(barcode, itemName) {
    if (!confirm(`Mark "${itemName}" as used? It will move to History.`)) return;

    try {
        const res = await fetch(`/move-to-history/${barcode}`, { method: "POST" });
        if (res.ok) {
            loadInventory(); // Refresh live list
            loadHistory();   // Refresh history list
        } else {
            alert("Error: Could not move item.");
        }
    } catch (err) {
        alert("Server connection failed.");
    }
}

async function loadHistory() {
    try {
        const res = await fetch("/history");
        const data = await res.json();
        const historyBody = document.querySelector("#historyTable tbody");
        if (!historyBody) return;

        historyBody.innerHTML = "";
        data.forEach(item => {
            historyBody.innerHTML += `
                <tr style="color: #64748b; background: rgba(0,0,0,0.02);">
                    <td>${item.barcode_number}</td>
                    <td>${item.item_name}</td>
                    <td>${item.quantity}</td>
                    <td>${new Date(item.usage_date).toLocaleDateString()}</td>
                </tr>`;
        });
    } catch (err) { console.error(err); }
}

async function confirmUse(barcode, itemName) {
    if (!confirm(`Mark "${itemName}" as used?`)) return;

    try {
        const res = await fetch(`/move-to-history/${barcode}`, { 
            method: "POST",
            headers: { "Content-Type": "application/json" }
        });

        if (res.ok) {
            alert("Success: Item moved to history.");
            await loadInventory(); // Refresh the live list
            if (typeof loadHistory === "function") await loadHistory(); // Refresh history list
        } else {
            const errorData = await res.json();
            alert("Server Error: " + (errorData.error || "Could not process move."));
        }
    } catch (err) {
        console.error("Fetch error:", err);
        alert("Network Error: Could not connect to server.");
    }
}

// FUNCTION: Edit Item (Sends data back to the donation form)
function editItem(barcode, name, qty, exp) {
    // 1. Switch to the Donation Tab
    const donationMenuItem = document.querySelector('a[onclick*="donation-box"]');
    showSection('donation-box', donationMenuItem);

    // 2. Fill the form with existing data
    document.getElementById("barcodeInput").value = barcode;
    document.getElementById("item").value = name;
    document.getElementById("qty").value = qty;
    document.getElementById("exp").value = exp;

    // 3. Scroll to the top of the form
    document.getElementById("donation").scrollIntoView({ behavior: 'smooth' });
}


// Function to open/close the notification menu
function toggleNotifications() {
    const dropdown = document.getElementById('notif-dropdown');
    if (dropdown) {
        dropdown.style.display = dropdown.style.display === 'none' ? 'block' : 'none';
    }
}

// Close the notification menu if clicking outside
window.onclick = function(event) {
    if (!event.target.closest('.notification-wrapper')) {
        const dropdown = document.getElementById('notif-dropdown');
        if (dropdown) dropdown.style.display = 'none';
    }
}

// Initial call
loadInventory();


let barcodeArray = [];

// Generate random 12-digit barcode
function generateBarcodeNumber() {
    return Math.floor(100000000000 + Math.random() * 900000000000).toString();
}

// Add a new barcode and auto-save to DB
async function addBarcode() {
    const value = generateBarcodeNumber();

    if (barcodeArray.includes(value)) {
        addBarcode(); // avoid duplicates in memory
        return;
    }

    // Auto-save to DB
    try {
        const res = await fetch("/register-barcode", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ barcode_number: value })
        });
        const data = await res.json();
        if (data.error) {
            alert("Error saving barcode: " + data.error);
            return;
        }
        barcodeArray.push(value);
        updateBarcodeList();
    } catch (err) {
        console.error(err);
        alert("Error connecting to server!");
    }
}

function updateBarcodeList() {
    const listDiv = document.getElementById("barcodeList");
    listDiv.innerHTML = "";

    barcodeArray.forEach((code, index) => {
        // Create SVG for barcode
        const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
        JsBarcode(svg, code, { format: "CODE128", width: 2, height: 40, displayValue: true });

        // Create delete button
        const delBtn = document.createElement("button");
        delBtn.innerText = "Delete";
        delBtn.style.marginLeft = "10px";
        delBtn.onclick = async () => {
            if (!confirm("Delete this barcode permanently?")) return;

            try {
                await fetch(`/delete-barcode/${code}`, { method: "DELETE" });
                barcodeArray.splice(index, 1);
                updateBarcodeList();
            } catch (err) {
                console.error(err);
                alert("Error deleting barcode!");
            }
        };

        // Container div
        const container = document.createElement("div");
        container.style.display = "flex";
        container.style.alignItems = "center";
        container.style.marginBottom = "10px";

        container.appendChild(svg);
        container.appendChild(delBtn);
        listDiv.appendChild(container);
    });
}

// Print or Save as PDF
function printBarcodes() {
    if (barcodeArray.length === 0) return alert("No barcodes to print!");

    // Open new window for printing
    const printWindow = window.open("", "_blank");
    printWindow.document.write("<html><head><title>Print Barcodes</title></head><body>");
    
    barcodeArray.forEach(code => {
        printWindow.document.write("<div style='margin-bottom:20px;'>");
        printWindow.document.write(`<svg id="svg_${code}"></svg>`);
        printWindow.document.write("</div>");
    });

    printWindow.document.write("</body></html>");
    printWindow.document.close();

    // Generate barcodes in the print window
    barcodeArray.forEach(code => {
        const svg = printWindow.document.getElementById(`svg_${code}`);
        JsBarcode(svg, code, { format: "CODE128", width: 10, height: 10, displayValue: true });
    });

    printWindow.focus();
    printWindow.print();
}

async function saveBarcodesAsPDF() {
    if (barcodeArray.length === 0) return alert("No barcodes to save!");

    const { jsPDF } = window.jspdf;
    const doc = new jsPDF({ orientation: "portrait", unit: "mm" });
    const pageWidth = doc.internal.pageSize.getWidth();
    let yOffset = 20; 

    for (let i = 0; i < barcodeArray.length; i++) {
        const code = barcodeArray[i];
        const labelText = code;
        const headerText = "    Bethlehem a House of Bread";

        // 1. Setup high-resolution SVG
        const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
        JsBarcode(svg, labelText, {
            format: "CODE128",
            width: 3,         // Increased width for better definition
            height: 100,       // Tall enough to be scanned easily
            displayValue: true,
            fontSize: 20,
            fontOptions: "bold",
            margin: 10,
            background: "#ffffff"
        });

        // 2. Convert SVG to High-Res Image
        const svgData = new XMLSerializer().serializeToString(svg);
        const svgBlob = new Blob([svgData], { type: "image/svg+xml;charset=utf-8" });
        const url = URL.createObjectURL(svgBlob);

        await new Promise((resolve) => {
            const img = new Image();
            img.onload = () => {
                // Use a canvas scale factor (3x) to prevent blurring
                const scale = 3;
                const canvas = document.createElement("canvas");
                canvas.width = img.width * scale;
                canvas.height = img.height * scale;
                
                const ctx = canvas.getContext("2d");
                ctx.fillStyle = "white";
                ctx.fillRect(0, 0, canvas.width, canvas.height);
                ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
                
                const imgData = canvas.toDataURL("image/png");

                // 3. Draw to PDF
                // Header text
                doc.setFont("helvetica", "bold");
                doc.setFontSize(10);
                doc.text(headerText, 20, yOffset); 

                // Barcode Image (Standard Label Size: 60mm x 30mm)
                doc.addImage(imgData, "PNG", 18, yOffset + 2, 60, 30);
                
                yOffset += 45; // Move down for the next label

                // Page management
                if (yOffset > 250 && i !== barcodeArray.length - 1) {
                    doc.addPage();
                    yOffset = 20;
                }

                URL.revokeObjectURL(url);
                resolve();
            };
            img.src = url;
        });
    }

    doc.save("Bethlehem_Barcodes.pdf");
}


function showSection(id, element) {
    // 1. Hide all tab content
    const tabs = document.querySelectorAll('.tab-content');
    tabs.forEach(tab => tab.style.display = 'none');

    // 2. Show the selected tab
    document.getElementById(id).style.display = 'block';

    // 3. Update the Page Title in the top bar
    const titles = {
        'scan-box': 'Barcode Processing',
        'donation-box': 'Donation Intake',
        'generate-box': 'Label Production',
        'inventory-box': 'Warehouse Inventory'
    };
    document.getElementById('view-title').innerText = titles[id];

    // 4. Update Sidebar Active Class
    const menuItems = document.querySelectorAll('.menu-item');
    menuItems.forEach(item => item.classList.remove('active'));
    element.classList.add('active');
}