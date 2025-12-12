// Toggle for embed password
const togglePassword = document.getElementById("togglePassword");
const passwordInput = document.getElementById("password");

if (togglePassword && passwordInput) {
  togglePassword.addEventListener("click", () => {
    const type = passwordInput.type === "password" ? "text" : "password";
    passwordInput.type = type;
    togglePassword.classList.toggle("fa-eye-slash");
  });
}

// Toggle for extract password
const toggleExtractPassword = document.getElementById("toggleExtractPassword");
const extractPasswordInput = document.getElementById("extractPassword");

if (toggleExtractPassword && extractPasswordInput) {
  toggleExtractPassword.addEventListener("click", () => {
    const type = extractPasswordInput.type === "password" ? "text" : "password";
    extractPasswordInput.type = type;
    
    toggleExtractPassword.classList.toggle("fa-eye-slash");
  });
}

// ================= EMBED =================
const embedForm = document.getElementById('embedForm');
if (embedForm) {
  const embedStatus = document.getElementById('embedStatus');
  embedForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const masterFile = document.getElementById('masterFile').files[0];
    const message = document.getElementById('message').value.trim();
    const password = document.getElementById('password').value.trim();

    if (!masterFile || !message || !password) {
      embedStatus.textContent = "Please fill all fields.";
      embedStatus.style.color = "red";
      return;
    }
    const formData = new FormData();
    formData.append('masterFile', masterFile);
    formData.append('message', message);
    formData.append('password', password);

    embedStatus.textContent = "Embedding...";
    embedStatus.style.color = "black";
    try {
      const res = await fetch('/embed', { method: 'POST', body: formData });
      if (!res.ok) throw new Error("Embedding failed");
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'stego_' + masterFile.name;
      a.click();
      embedStatus.textContent = "Message embedded successfully!";
      embedStatus.style.color = "green";
    } catch (err) {
      console.error(err);
      embedStatus.textContent = "Error embedding message.";
      embedStatus.style.color = "red";
    }
  });
}

// ================= EXTRACT =================
const extractForm = document.getElementById('extractForm');
if (extractForm) {
  const extractStatus = document.getElementById('extractStatus');
  const extractedMessage = document.getElementById('extractedMessage');

  extractForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const stegoFile = document.getElementById('stegoFile').files[0];
    const password = document.getElementById('extractPassword').value.trim();

    if (!stegoFile || !password) {
      extractStatus.textContent = "Please select a file and enter password.";
      extractStatus.style.color = "red";
      return;
    }

    const formData = new FormData();
    formData.append('stegoFile', stegoFile);
    formData.append('password', password);

    extractStatus.textContent = "Extracting...";
    extractStatus.style.color = "black";
    extractedMessage.value = "";

    try {
      const res = await fetch('/extract', { method: 'POST', body: formData });
      if (!res.ok) throw new Error("Extraction failed");
      const text = await res.text();
      extractedMessage.value = text;
      extractStatus.textContent = "Extraction successful!";
      extractStatus.style.color = "green";
    } catch (err) {
      console.error(err);
      extractStatus.textContent = "Error extracting message.";
      extractStatus.style.color = "red";
    }
  });
}
