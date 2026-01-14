
const qrcodereader_scanner = new Html5Qrcode("qrcodereader_camera_view");
let recentCodes = JSON.parse(localStorage.getItem('qrcodereader_recent_codes')) || [];

const showResult = (elementId, text) => {
  const el = document.getElementById(elementId);
  const isURL = text.startsWith('http://') || text.startsWith('https://');

  el.innerHTML = `
    <div class="qrcodereader_result_label">Your Result:</div>
    ${isURL ? `<a href="${text}" target="_blank">${text}</a>` : `<div>${text}</div>`}
    <div class="qrcodereader_copy_btn" onclick="copyQRCodeResult(this, '${text}')">Copy</div>
  `;
  el.classList.add('show');

  addToRecent(text);
};

function copyQRCodeResult(btn, text) {
  navigator.clipboard.writeText(text).then(() => {
    btn.textContent = 'Copied';
    setTimeout(() => btn.textContent = 'Copy', 2000);
  });
}

function addToRecent(text) {
  if (recentCodes.includes(text)) return;

  recentCodes.unshift(text);
  if (recentCodes.length > 5) recentCodes = recentCodes.slice(0, 5);

  localStorage.setItem('qrcodereader_recent_codes', JSON.stringify(recentCodes));
  renderRecentCodes();
}

function deleteRecentItem(index) {
  recentCodes.splice(index, 1);
  localStorage.setItem('qrcodereader_recent_codes', JSON.stringify(recentCodes));
  renderRecentCodes();
}

function clearAllRecent() {
  recentCodes = [];
  localStorage.removeItem('qrcodereader_recent_codes');
  renderRecentCodes();
}

function renderRecentCodes() {
  const container = document.getElementById('qrcodereader_recent');
  container.innerHTML = '';
  if (recentCodes.length === 0) return;

  container.innerHTML += `<div class="qrcodereader_result_label">Recently Scanned:</div>`;
  recentCodes.forEach((code, index) => {
    const isURL = code.startsWith('http://') || code.startsWith('https://');
    container.innerHTML += `
      <div class="qrcodereader_recent_item">
        <span class="qrcodereader_recent_text">
          ${isURL ? `<a href="${code}" target="_blank">${code}</a>` : `<div>${code}</div>`}
        </span>
        <div class="qrcodereader_copy_btn" onclick="copyQRCodeResult(this, '${code}')">Copy</div>
        <div class="qrcodereader_delete_btn" onclick="deleteRecentItem(${index})">✖</div>
      </div>
    `;
  });

  container.innerHTML += `<button class="qrcodereader_clear_all" onclick="clearAllRecent()">Clear All Recent</button>`;
}

let qrcodereader_currentCamera = "environment";

function startQrCamera(cameraFacing) {
  document.getElementById('qrcodereader_camera_wrapper').style.display = 'block';
  document.getElementById('qrcodereader_stop_btn').style.display = 'inline-block';
  document.getElementById('qrcodereader_switch_btn').style.display = 'inline-block';

  qrcodereader_scanner.start(
    { facingMode: cameraFacing },
    { fps: 10, qrbox: 250 },
    decodedText => {
      showResult('qrcodereader_camera_result', decodedText);
      qrcodereader_scanner.stop();
      document.getElementById('qrcodereader_stop_btn').style.display = 'none';
      document.getElementById('qrcodereader_switch_btn').style.display = 'none';
    }
  ).catch(err => {
    alert("Camera error: " + err);
  });
}

document.getElementById('qrcodereader_start_btn').addEventListener('click', function () {
  startQrCamera(qrcodereader_currentCamera);
});

document.getElementById('qrcodereader_stop_btn').addEventListener('click', function () {
  qrcodereader_scanner.stop().then(() => {
    document.getElementById('qrcodereader_camera_wrapper').style.display = 'none';
    this.style.display = 'none';
    document.getElementById('qrcodereader_switch_btn').style.display = 'none';
  });
});

document.getElementById('qrcodereader_switch_btn').addEventListener('click', function () {
  qrcodereader_scanner.stop().then(() => {
    qrcodereader_currentCamera = qrcodereader_currentCamera === "environment" ? "user" : "environment";
    startQrCamera(qrcodereader_currentCamera);
  });
});

document.getElementById('qrcodereader_file_input').addEventListener('change', function (e) {
  const file = e.target.files[0];
  if (!file) return;

  qrcodereader_scanner.scanFile(file, true)
    .then(decodedText => {
      showResult('qrcodereader_upload_result', decodedText);
    })
    .catch(err => {
      document.getElementById('qrcodereader_upload_result').innerText = `Error decoding: ${err}`;
    });
});

document.addEventListener('DOMContentLoaded', () => {
  renderRecentCodes();
});


//OLD working Script without recent wrapper
  /*const qrcodereader_scanner = new Html5Qrcode("qrcodereader_camera_view");

  const showResult = (elementId, text) => {
    const el = document.getElementById(elementId);
    const isURL = text.startsWith('http://') || text.startsWith('https://');

    el.innerHTML = `
      <div class="qrcodereader_result_label">Your Result:</div>
      ${isURL ? `<a href="${text}" target="_blank">${text}</a>` : `<div>${text}</div>`}
      <div class="qrcodereader_copy_btn" onclick="copyQRCodeResult('${text}')">Copy</div>
    `;
    el.classList.add('show');
  };

  function copyQRCodeResult(text) {
    navigator.clipboard.writeText(text).then(() => {
      const toast = document.getElementById('qrcodereader_toast');
      toast.style.display = 'block';
      setTimeout(() => toast.style.display = 'none', 1500);
    });
  }

  let qrcodereader_currentCamera = "environment"; // 📷 default to back camera

  function startQrCamera(cameraFacing) {
    document.getElementById('qrcodereader_camera_wrapper').style.display = 'block';
    document.getElementById('qrcodereader_stop_btn').style.display = 'inline-block';
    document.getElementById('qrcodereader_switch_btn').style.display = 'inline-block';

    qrcodereader_scanner.start(
      { facingMode: cameraFacing },
      { fps: 10, qrbox: 250 },
      decodedText => {
        showResult('qrcodereader_camera_result', decodedText);
        qrcodereader_scanner.stop();
        document.getElementById('qrcodereader_stop_btn').style.display = 'none';
        document.getElementById('qrcodereader_switch_btn').style.display = 'none';
      }
    ).catch(err => {
      alert("Camera error: " + err);
    });
  }

  // ▶️ Start camera
  document.getElementById('qrcodereader_start_btn').addEventListener('click', function () {
    startQrCamera(qrcodereader_currentCamera);
  });

  // ⏹️ Stop camera
  document.getElementById('qrcodereader_stop_btn').addEventListener('click', function () {
    qrcodereader_scanner.stop().then(() => {
      document.getElementById('qrcodereader_camera_wrapper').style.display = 'none';
      this.style.display = 'none';
      document.getElementById('qrcodereader_switch_btn').style.display = 'none';
    });
  });

  // 🔁 Switch camera
  document.getElementById('qrcodereader_switch_btn').addEventListener('click', function () {
    qrcodereader_scanner.stop().then(() => {
      qrcodereader_currentCamera = qrcodereader_currentCamera === "environment" ? "user" : "environment";
      startQrCamera(qrcodereader_currentCamera);
    });
  });

  // 📂 QR from file
  document.getElementById('qrcodereader_file_input').addEventListener('change', function (e) {
    const file = e.target.files[0];
    if (!file) return;

    qrcodereader_scanner.scanFile(file, true)
      .then(decodedText => {
        showResult('qrcodereader_upload_result', decodedText);
      })
      .catch(err => {
        document.getElementById('qrcodereader_upload_result').innerText = `Error decoding: ${err}`;
      });
  });*/
