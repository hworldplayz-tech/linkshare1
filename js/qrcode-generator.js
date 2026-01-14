 // Load previous QR codes on page load
 window.onload = function() {
    loadSavedQRCodes();
    updateClearAllButtonVisibility();
  };
  
  let activeQRCode;
  
  function generateQR() {
    const text = document.getElementById("qr-text").value.trim();
    const name = document.getElementById("qr-name").value.trim() || "Unnamed QR";
  
    if (text === "") {
      alert("Please enter some text or link!");
      return;
    }
  
    if (!activeQRCode) {
      activeQRCode = new QRCode(document.getElementById("qr-code-box"), {
        text: "",
        width: 200,
        height: 200,
        colorDark : "#000000",
        colorLight : "#ffffff",
        correctLevel : QRCode.CorrectLevel.H
      });
    } else {
      activeQRCode.clear();
    }
  
    activeQRCode.makeCode(text);
    document.getElementById("qr-display").style.display = "flex";
    document.getElementById("qr-display").style.transform = "scale(0.8)";
    setTimeout(() => {
      document.getElementById("qr-display").style.transform = "scale(1)";
    }, 100);
  
    // Save after slight delay so canvas is ready
    setTimeout(() => {
      saveCurrentQR(name);
    }, 300);
  }
  
  // Add this new function to manage button visibility
  function updateClearAllButtonVisibility() {
    const savedQRCodes = JSON.parse(localStorage.getItem("qr-codes")) || [];
    const clearAllBtn = document.getElementById("clear-all-btn");
    clearAllBtn.style.display = savedQRCodes.length > 0 ? "block" : "none";
  }
  
  function saveCurrentQR(name) {
    const canvas = document.querySelector("#qr-code-box canvas");
    if (!canvas) return;
  
    const imgData = canvas.toDataURL("image/png");
  
    const qrEntry = {
      name: name,
      img: imgData
    };
  
    let savedQRCodes = JSON.parse(localStorage.getItem("qr-codes")) || [];
    savedQRCodes.unshift(qrEntry); // Add to start
    localStorage.setItem("qr-codes", JSON.stringify(savedQRCodes));
  
    addQRToRecent(qrEntry);
    updateClearAllButtonVisibility(); // Add this line
  }
  
  function addQRToRecent(qrEntry) {
    const wrapper = document.createElement("div");
    wrapper.className = "qr-recent-item";
  
    const img = document.createElement("img");
    img.src = qrEntry.img;
  
    const caption = document.createElement("span");
    caption.innerText = qrEntry.name;
  
    wrapper.appendChild(img);
    wrapper.appendChild(caption);
  
    const recentList = document.getElementById("qr-recent-list");
    recentList.prepend(wrapper);
  
    document.getElementById("qr-recent").style.display = "block";
  }
  
  function loadSavedQRCodes() {
    const savedQRCodes = JSON.parse(localStorage.getItem("qr-codes")) || [];
    if (savedQRCodes.length > 0) {
      document.getElementById("qr-recent").style.display = "block";
      savedQRCodes.forEach(entry => {
        addQRToRecent(entry);
      });
    }
    updateClearAllButtonVisibility(); // Add this line
  }
  
  function clearQR() {
    if (activeQRCode) {
      activeQRCode.clear();
    }
    document.getElementById("qr-display").style.display = "none";
  }
  
  function clearAllSavedQRCodes() {
    // Remove all saved QR codes from localStorage
    localStorage.removeItem("qr-codes");
  
    // Remove all items from the recent section
    const recentList = document.getElementById("qr-recent-list");
    recentList.innerHTML = ''; // Clear the list
  
    // Hide the "recent" section
    document.getElementById("qr-recent").style.display = "none";
    
    // Hide the "Clear All" button after click
    document.getElementById("clear-all-btn").style.display = "none"
    updateClearAllButtonVisibility(); // Add this line
  }
  
  
  