const beep = new Audio('https://assets.mixkit.co/active_storage/sfx/2568/2568-preview.mp3');

// Check Barcode
// Check Barcode and Auto-Transition
// 1. Updated checkBarcode to handle the auto-jump
async function checkBarcode() {
    const inputField = document.getElementById("barcodeInput");
    const code = inputField.value.trim();
    
    if (!code) return; 
    
    try {
        const res = await fetch(`/check/${code}`);
        const data = await res.json();

        // If barcode doesn't exist in the 'barcodes' table
        if (data.length === 0) {
            const userChoice = confirm(`Barcode "${code}" not recognized. Add to system and create New Donation?`);
            
            if (userChoice) {
                // Register it so the system knows it's a valid barcode
                await fetch("/register-barcode", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ barcode_number: code })
                });

                proceedToEntryForm(code);
            }
            inputField.value = ""; // Clear the scanner field
        } else {
            // Check if it's already in 'donations' (live inventory)
            const invRes = await fetch("/inventory");
            const invData = await invRes.json();
            const exists = invData.some(item => item.barcode_number === code);

            if (exists) {
                alert("⚠️ This item is already in the live inventory!");
                inputField.value = "";
            } else {
                proceedToEntryForm(code);
                inputField.value = "";
            }
        }
    } catch (err) {
        console.error("Scanning error:", err);
    }
}
// 2. The Jump Function
// Fixed: Moves data from Scan tab to Donation tab
function proceedToEntryForm(code) {
    const donationMenuItem = document.querySelector('a[onclick*="donation-box"]');
    showSection('donation-box', donationMenuItem);
    
    const donationBarcodeField = document.getElementById("donationBarcode");
    if (donationBarcodeField) {
        donationBarcodeField.value = code; // Pre-fill with scanned code 
        donationBarcodeField.readOnly = true; // Lock for database integrity
    }

    setTimeout(() => {
        const donorInput = document.getElementById("donor");
        if(donorInput) donorInput.focus(); // Jump to next editable field [cite: 185]
    }, 300);
}
// Fixed: Saves data using the new ID
async function saveDonation() {
    // FIX: Match IDs with your HTML inputs
    const barcode_number = document.getElementById("donationBarcode").value.trim();
    const donor_name = document.getElementById("donor").value.trim();
    const item_name = document.getElementById("donationItem").value.trim(); // Added 'donation' prefix
    const quantity = document.getElementById("donationQty").value;         // Added 'donation' prefix
    const expiration_date = document.getElementById("donationExp").value;   // Added 'donation' prefix

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
        if (data.error) alert(data.error);
        else {
            alert("✅ Donation Saved!");
            loadInventory();
            showSection('inventory-box', document.querySelector('a[onclick*="inventory-box"]'));
        }
    } catch (err) { alert("Server Error"); }
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
async function loadInventory(sortBy = 'all') {
    try {
        const res = await fetch("/inventory");
        let data = await res.json();

        // --- SORTING LOGIC ---
        if (sortBy !== 'all') {
            data.sort((a, b) => {
                if (sortBy === 'expiry-asc') return new Date(a.expiration_date) - new Date(b.expiration_date);
                if (sortBy === 'expiry-desc') return new Date(b.expiration_date) - new Date(a.expiration_date);
                if (sortBy === 'stock-high') return b.quantity - a.quantity;
                if (sortBy === 'stock-low') return a.quantity - b.quantity;
                return 0;
            });
        }

        const tableBody = document.querySelector("#inventoryTable tbody");
        tableBody.innerHTML = "";
        
        data.forEach(item => {
            const today = new Date();
            const exp = new Date(item.expiration_date);
            const diffDays = Math.ceil((exp - today) / (1000 * 60 * 60 * 24));
            
            // Professional Color Logic
            let statusColor = diffDays <= 0 ? "#da0000" : diffDays <= 14 ? "#f97316" : diffDays <= 30 ? "#eab308" : "#22c55e";
            let statusLabel = diffDays <= 0 ? "EXPIRED" : diffDays <= 14 ? "URGENT" : diffDays <= 30 ? "EXPIRING" : "GOOD";

            const row = `
                <tr style="border-left: 4px solid ${statusColor};">
                    <td><span class="code-badge" style="font-family: monospace; background: #f1f5f9; padding: 4px 8px; border-radius: 4px;">${item.barcode_number}</span></td>
                    <td style="font-weight: 600; color: #1e293b;">${item.item_name}</td> <td style="color: #64748b; font-size: 0.85rem;">${item.donor_name || 'Anonymous'}</td>
                    <td style="font-weight: 700; color: #1e293b;">${item.quantity}</td>
                    <td>
                        <div style="font-size: 0.85rem; font-weight: 500;">${exp.toLocaleDateString()}</div>
                        <span style="font-size: 0.7rem; color: ${statusColor}; font-weight: 800; text-transform: uppercase;">
                            ${statusLabel} ${diffDays <= 0 ? '!' : '('+diffDays+'d)'}
                        </span>
                    </td>
                    <td style="text-align: right;">
                        <button class="btn-edit" style="background: #f1f5f9; color: #475569; border: 1px solid #e2e8f0; padding: 6px 12px; border-radius: 6px; cursor: pointer;" 
                                onclick="editItem('${item.barcode_number}', '${item.item_name}', ${item.quantity}, '${item.expiration_date}', '${item.donor_name}')">Edit</button>
                        <button class="btn-confirm" style="background: #22c55e; color: white; border: none; padding: 6px 12px; border-radius: 6px; cursor: pointer; margin-left: 5px;" 
                                onclick="confirmUse('${item.barcode_number}', '${item.item_name}')">Used</button>
                    </td>
                </tr>`;
            tableBody.innerHTML += row;
        });
    } catch (err) {
        console.error("Inventory Load Error:", err);
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
        
        // Target the new explicit ID
        const historyBody = document.getElementById("history-list-body");
        if (!historyBody) return;

        historyBody.innerHTML = ""; // Clear old data

        if (data.length === 0) {
            historyBody.innerHTML = `<tr><td colspan="4" style="text-align:center; padding:20px; color:#94a3b8;">No history records found.</td></tr>`;
            return;
        }

        data.forEach(item => {
            // Make the date readable
            const dateUsed = new Date(item.usage_date).toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            });

            const tr = document.createElement("tr");
            tr.style.background = "rgba(0,0,0,0.01)";
            tr.style.borderBottom = "1px solid #f1f5f9";

            tr.innerHTML = `
                <td><span class="code-badge" style="background:#f1f5f9; padding:2px 8px; border-radius:4px; font-family:monospace;">${item.barcode_number}</span></td>
                <td style="font-weight:600; color:#1e293b;">${item.item_name}</td>
                <td>${item.quantity}</td>
                <td style="color: #64748b; font-size: 0.85rem;">${dateUsed}</td>
            `;
            historyBody.appendChild(tr);
        });
    } catch (err) { 
        console.error("History Load Error:", err);
    }
}
// FUNCTION: Edit Item (Sends data back to the donation form)
// Open the Modal and fill it with current data
function editItem(barcode, name, qty, exp, donor) {
    document.getElementById("editBarcode").value = barcode;
    document.getElementById("editItem").value = name;
    document.getElementById("editQty").value = qty;
    document.getElementById("editDonor").value = donor || "";
    
    // Format date for the input field (YYYY-MM-DD)
    const formattedDate = new Date(exp).toISOString().split('T')[0];
    document.getElementById("editExp").value = formattedDate;

    document.getElementById("editModal").style.display = "flex";
}

// Close the Modal
function closeEditModal() {
    document.getElementById("editModal").style.display = "none";
}



// SEND THE UPDATE TO THE SERVER
async function saveEdit() {
    const barcode = document.getElementById("editBarcode").value;
    const updatedData = {
        item_name: document.getElementById("editItem").value,
        quantity: document.getElementById("editQty").value,
        expiration_date: document.getElementById("editExp").value,
        donor_name: document.getElementById("editDonor").value
    };

    try {
        // This connects to the app.put('/update-inventory/:barcode') in your server.js
        const res = await fetch(`/update-inventory/${barcode}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(updatedData)
        });

        if (res.ok) {
            alert("✅ Inventory Updated!");
            closeEditModal();
            loadInventory(); // Refresh the table
        }
    } catch (err) {
        console.error("Connection Error:", err);
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
        
        // Update counter display
        const display = document.getElementById("queue-count-display");
        if(display) display.innerText = `${barcodeArray.length} Items`;
        
    } catch (err) {
        console.error(err);
        alert("Error connecting to server!");
    }
}

function removeBarcode(barcodeNumber, index) {
    // 1. Ask for confirmation locally
    if (!confirm(`Remove barcode ${barcodeNumber} from the queue?`)) return;

    // 2. Remove the item from the local array immediately
    barcodeArray.splice(index, 1); 

    // 3. Update the visual list on the screen
    updateBarcodeList(); 

    // 4. Update the "Labels in Queue" counter
    const display = document.getElementById("queue-count-display");
    if (display) {
        display.innerText = `${barcodeArray.length} Items`;
    }
}


// 1. Fixed Print Function (Matches PDF format exactly)
async function printBarcodes() {
    if (barcodeArray.length === 0) return alert("No barcodes to print!");

    const { jsPDF } = window.jspdf;
    const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
    
    const margin = 10;
    const columns = 3;
    const itemWidth = (doc.internal.pageSize.getWidth() - (margin * 2)) / columns;
    const itemHeight = 45; 

    for (let i = 0; i < barcodeArray.length; i++) {
        const code = barcodeArray[i];
        if (i > 0 && i % (columns * 6) === 0) doc.addPage();

        const col = i % columns;
        const row = Math.floor((i % (columns * 6)) / columns);
        const x = margin + (col * itemWidth);
        const y = margin + (row * itemHeight);

        // Brand Name (Same as PDF)
        doc.setFontSize(8);
        doc.text("Bethlehem House of Bread", x + (itemWidth / 2), y + 7, { align: "center" });

        const canvas = document.createElement("canvas");
        JsBarcode(canvas, code, { format: "CODE128", width: 2, height: 60, displayValue: true, fontSize: 18 });

        const imgData = canvas.toDataURL("image/png");
        doc.addImage(imgData, 'PNG', x + 2, y + 10, itemWidth - 4, 30);
    }

    doc.autoPrint();
    window.open(doc.output('bloburl'), '_blank');
}

// 2. Updated Interface Function
function updateBarcodeList() {
    const listDiv = document.getElementById("barcodeList");
    const emptyState = document.getElementById("empty-state");
    const countDisplay = document.getElementById("queue-count-display");
    
    if (!listDiv) return;
    listDiv.innerHTML = "";
    
    if (countDisplay) countDisplay.innerText = `${barcodeArray.length} Items in Buffer`;

    if (barcodeArray.length === 0) {
        if (emptyState) emptyState.style.display = "block";
        return;
    } else {
        if (emptyState) emptyState.style.display = "none";
    }

    barcodeArray.forEach((code, index) => {
        const tr = document.createElement("tr");
        tr.innerHTML = `
            <td style="color: #94a3b8; font-family: monospace;">${(index + 1).toString().padStart(2, '0')}</td>
            <td><svg id="svg-list-${index}" style="height: 30px;"></svg></td>
            <td style="font-weight: 700; color: #334155;">${code}</td>
            <td style="text-align: right;">
                <button class="btn-danger-text" style="font-size: 0.75rem;" onclick="removeBarcode('${code}', ${index})">REMOVE</button>
            </td>
        `;
        listDiv.appendChild(tr);

        JsBarcode(`#svg-list-${index}`, code, {
            format: "CODE128",
            width: 1,
            height: 30,
            displayValue: false,
            margin: 0
        });
    });
}

function clearQueue() {
    if(barcodeArray.length > 0 && confirm("Clear entire production queue?")) {
        barcodeArray = [];
        updateBarcodeList();
    }
}

async function saveBarcodesAsPDF() {
    if (barcodeArray.length === 0) return alert("No barcodes to save!");
    
    const { jsPDF } = window.jspdf;
    // Use A4 size (210mm x 297mm)
    const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
    
    const pageWidth = doc.internal.pageSize.getWidth();
    const margin = 10; 
    const columns = 3; 
    // Calculate width to fill the page minus margins
    const labelWidth = (pageWidth - (margin * 2)) / columns; 
    const labelHeight = 40; 

    let xPos = margin;
    let yPos = 20; 


    for (let i = 0; i < barcodeArray.length; i++) {
        const code = barcodeArray[i];
        
        const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
        JsBarcode(svg, code, {
            format: "CODE128",
            width: 2,         
            height: 60,       
            displayValue: true,
            fontSize: 18,
            margin: 5
        });

        const svgData = new XMLSerializer().serializeToString(svg);
        const svgBlob = new Blob([svgData], { type: "image/svg+xml;charset=utf-8" });
        const url = URL.createObjectURL(svgBlob);

        await new Promise((resolve) => {
            const img = new Image();
            img.onload = () => {
                const canvas = document.createElement("canvas");
                canvas.width = img.width * 2;
                canvas.height = img.height * 2;
                const ctx = canvas.getContext("2d");
                ctx.fillStyle = "white";
                ctx.fillRect(0, 0, canvas.width, canvas.height);
                ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
                
                const imgData = canvas.toDataURL("image/png");

                // Add Brand Header
                doc.setFontSize(7);
                doc.text("Bethlehem House of Bread", xPos + (labelWidth / 2), yPos - 2, { align: "center" });

                // Add Barcode (fills column width)
                doc.addImage(imgData, "PNG", xPos, yPos, labelWidth - 2, 30);
                
                // Move to next position
                if ((i + 1) % columns === 0) {
                    xPos = margin; // Reset to left
                    yPos += labelHeight; // Move to next row
                } else {
                    xPos += labelWidth; // Move to next column
                }

                // Page Overflow Check
                if (yPos > 270 && i !== barcodeArray.length - 1) {
                    doc.addPage();
                    yPos = 20;
                    xPos = margin;
                }

                URL.revokeObjectURL(url);
                resolve();
            };
            img.src = url;
        });
    }
    doc.save("Inventory_Barcodes.pdf");
    window.open(doc.output('bloburl'), '_blank');
}

function showSection(id, element) {
    const tabs = document.querySelectorAll('.tab-content');
    tabs.forEach(tab => tab.style.display = 'none');

    document.getElementById(id).style.display = 'block';

    const titles = {
        'scan-box': ' 🔍 Barcode Processing',
        'quick-use-box': '⚡ Quick Dispatch Mode',
        'donation-box': ' 🎁 In-Kind Donation',
        'generate-box': ' 🏷️ Generating Barcode',
        'inventory-box': ' 📊 Inventory Overview',
        'history-box': ' 📜 Usage History Archive'
    };
    
    document.getElementById('view-title').innerText = titles[id];

    // --- ADD THIS LOGIC ---
    if (id === 'history-box') {
        loadHistory(); // Re-load data every time the history tab is clicked
    }
    
    if (id === 'inventory-box') {
        loadInventory(); // Keep inventory fresh too
    }

    if (id === 'quick-use-box') {
        setTimeout(() => document.getElementById('quickUseInput').focus(), 100);
    }
    
    // Manage active menu highlights
    const menuItems = document.querySelectorAll('.menu-item');
    menuItems.forEach(item => item.classList.remove('active'));
    if (element) element.classList.add('active');
}

function filterInventory() {
    const searchTerm = document.getElementById("inventorySearch").value.toLowerCase();
    const rows = document.querySelectorAll("#inventoryTable tbody tr");

    rows.forEach(row => {
        const barcode = row.cells[0].textContent.toLowerCase();
        const itemName = row.cells[1].textContent.toLowerCase();
        const donorName = row.cells[2].textContent.toLowerCase(); // Added Donor Search
        
        if (barcode.includes(searchTerm) || itemName.includes(searchTerm) || donorName.includes(searchTerm)) {
            row.style.display = ""; 
        } else {
            row.style.display = "none"; 
        }
    });
}
async function processQuickUse() {
    const inputField = document.getElementById("quickUseInput");
    const code = inputField.value.trim();
    
    if (!code) return;

    // Lock the field so another scan doesn't happen during the save
    inputField.readOnly = true; 
    
    try {
        const response = await fetch(`/move-to-history/${code}`, { method: "POST" }); 

        if (response.ok) {
            alert(`✅ Item ${code} moved to History.`); 
            inputField.value = ""; 
            
            // These refresh your tables so you see the changes immediately
            loadInventory(); 
            loadHistory();
        } else {
            const errData = await response.json();
            alert("❌ Error: " + (errData.error || "Not found.")); 
        }
    } catch (err) {
        console.error("Quick Use Error:", err);
        alert("Server connection failed.");
    } finally {
        // Unlock the field for the next scan
        inputField.readOnly = false; 
        inputField.focus();
    }
}

function updateAlerts(data) {
    const alertList = document.getElementById('alert-list');
    const badge = document.getElementById('notif-badge');
    const countText = document.getElementById('notif-count-text');

    const today = new Date();
    let alertCount = 0;
    
    if (alertList) alertList.innerHTML = "";

    data.forEach(item => {
        const exp = new Date(item.expiration_date);
        const diffDays = Math.ceil((exp - today) / (1000 * 60 * 60 * 24));

        if (diffDays <= 30) {
            alertCount++;
            const statusLabel = diffDays <= 0 ? "EXPIRED" : `${diffDays}d left`;
            const color = diffDays <= 0 ? "#ef4444" : "#f59e0b";

            // Create list item with an onclick event to find the item
            const li = document.createElement('li');
            li.style.cursor = "pointer";
            li.style.padding = "8px 12px";
            li.style.borderBottom = "1px solid #f1f5f9";
            li.innerHTML = `
                <strong style="color: ${color}">${statusLabel}</strong>: 
                ${item.item_name}
            `;
            
            li.onclick = () => scrollToItem(item.barcode_number);
            
            if (alertList) alertList.appendChild(li);
        }
    });

    if (alertCount > 0) {
        if (badge) {
            badge.innerText = alertCount;
            badge.style.display = "flex";
        }
        if (countText) countText.innerText = `${alertCount} Items Need Attention`;
    } else {
        if (badge) badge.style.display = "none";
        if (alertList) alertList.innerHTML = '<li class="empty-msg">No urgent alerts</li>';
    }
}

// New helper function to redirect user to the specific item
function scrollToItem(barcode) {
    // 1. Switch to Inventory Tab
    const invTab = document.querySelector('a[onclick*="inventory-box"]');
    showSection('inventory-box', invTab);

    // 2. Wait for tab to render, then find and highlight item
    setTimeout(() => {
        const searchInput = document.getElementById("inventorySearch");
        if (searchInput) {
            searchInput.value = barcode;
            filterInventory(); // Trigger the search
            
            // Close the notification dropdown
            document.getElementById('notif-dropdown').style.display = 'none';
        }
    }, 100);
}

// --- UPDATED LOAD INVENTORY ---
async function loadInventory(sortBy = 'all') {
    try {
        const res = await fetch("/inventory");
        let data = await res.json();

        // Trigger the Alerts update whenever inventory loads
        updateAlerts(data);

        // Sorting Logic
        if (sortBy !== 'all') {
            data.sort((a, b) => {
                if (sortBy === 'expiry-asc') return new Date(a.expiration_date) - new Date(b.expiration_date);
                if (sortBy === 'expiry-desc') return new Date(b.expiration_date) - new Date(a.expiration_date);
                if (sortBy === 'stock-high') return b.quantity - a.quantity;
                if (sortBy === 'stock-low') return a.quantity - b.quantity;
                return 0;
            });
        }

        const tableBody = document.querySelector("#inventoryTable tbody");
        if (!tableBody) return;
        tableBody.innerHTML = "";

        data.forEach(item => {
            const today = new Date();
            const exp = new Date(item.expiration_date);
            const diffDays = Math.ceil((exp - today) / (1000 * 60 * 60 * 24));
            
            let statusColor = diffDays <= 0 ? "#ff0000" : diffDays <= 14 ? "#f97316" : diffDays <= 30 ? "#eab308" : "#22c55e";
            let statusLabel = diffDays <= 0 ? "EXPIRED" : diffDays <= 14 ? "URGENT" : diffDays <= 30 ? "EXPIRING" : "GOOD";

            const row = `
                <tr style="border-left: 4px solid ${statusColor};">
                    <td><span class="code-badge">${item.barcode_number}</span></td>
                    <td style="font-weight: 600; color: #1e293b;">${item.item_name}</td> 
                    <td style="color: #64748b; font-size: 0.85rem;">${item.donor_name || 'Anonymous'}</td>
                    <td style="font-weight: 700; color: #1e293b;">${item.quantity}</td>
                    <td>
                        <div style="font-size: 0.85rem; font-weight: 500;">${exp.toLocaleDateString()}</div>
                        <span style="font-size: 0.7rem; color: ${statusColor}; font-weight: 800; text-transform: uppercase;">
                            ${statusLabel} ${diffDays <= 0 ? '!' : '('+diffDays+'d)'}
                        </span>
                    </td>
                    <td style="text-align: right;">
                        <button class="btn-edit" onclick="editItem('${item.barcode_number}', '${item.item_name}', ${item.quantity}, '${item.expiration_date}', '${item.donor_name}')">Edit</button>
                        <button class="btn-confirm" onclick="confirmUse('${item.barcode_number}', '${item.item_name}')">Used</button>
                    </td>
                </tr>`;
            tableBody.innerHTML += row;
        });
    } catch (err) {
        console.error("Inventory Load Error:", err);
    }
}

function toggleDarkMode() {
    const body = document.body;
    const icon = document.getElementById('theme-icon');
    
    body.classList.toggle('dark-mode');
    
    // Save preference
    const isDark = body.classList.contains('dark-mode');
    localStorage.setItem('theme', isDark ? 'dark' : 'light');
    
    // Update Icon
    icon.innerText = isDark ? '☀️' : '🌙';
}

// Load preference on page startup
window.addEventListener('DOMContentLoaded', () => {
    if (localStorage.getItem('theme') === 'dark') {
        document.body.classList.add('dark-mode');
        document.getElementById('theme-icon').innerText = '☀️';
    }
});

