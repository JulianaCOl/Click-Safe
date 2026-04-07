let emergencyContacts = JSON.parse(localStorage.getItem("contato_emergencia")) || [];
let currentLocation = null;
let selectedEmergencyType = "Emergência";
let alertRecords = JSON.parse(localStorage.getItem("registros_alertas")) || [];
let bluetoothDeviceData = JSON.parse(localStorage.getItem("dispositivo_bluetooth")) || null;
let pairedBluetoothDevice = null;

const supportPoints = [
  {
    ID_Ponto: 1,
    nome_local: "Hospital Central",
    tipo_servico: "Hospital",
    latitude: -23.55052,
    longitude: -46.633308,
    endereco_completo: "Rua Exemplo, 100 - Centro",
    telefone_local: "1130000001"
  },
  {
    ID_Ponto: 2,
    nome_local: "Delegacia da Mulher",
    tipo_servico: "Delegacia",
    latitude: -23.552,
    longitude: -46.635,
    endereco_completo: "Avenida Exemplo, 250 - Centro",
    telefone_local: "1130000002"
  }
];

function toggleTutorial() {
  const tutorialBox = document.getElementById("tutorialBox");
  tutorialBox.classList.toggle("hidden");
}

function scrollToSection(sectionId, clickedButton) {
  const section = document.getElementById(sectionId);

  if (section) {
    section.scrollIntoView({
      behavior: "smooth",
      block: "start"
    });
  }

  document.querySelectorAll(".nav-item").forEach((item) => {
    item.classList.remove("active");
  });

  if (clickedButton) {
    clickedButton.classList.add("active");
  }
}

function selectEmergencyType(button, type) {
  selectedEmergencyType = type;

  document.querySelectorAll(".type-pill").forEach((item) => {
    item.classList.remove("selected");
  });

  button.classList.add("selected");
}

function saveEmergencyContact() {
  const nome_contato = document.getElementById("nome_contato").value.trim();
  const celular = document.getElementById("celular_contato").value.trim();
  const parentesco = document.getElementById("parentesco").value.trim();
  const ordem_prioridade = document.getElementById("ordem_prioridade").value.trim();

  if (!nome_contato || !celular || !parentesco || !ordem_prioridade) {
    alert("Preencha todos os campos do contato de emergência.");
    return;
  }

  const savedUser = JSON.parse(localStorage.getItem("usuarios"));

  const newContact = {
    ID_Contato: Date.now(),
    ID_Usuario: savedUser ? savedUser.ID_Usuario : null,
    nome_contato,
    celular,
    parentesco,
    ordem_prioridade: Number(ordem_prioridade)
  };

  emergencyContacts.push(newContact);
  emergencyContacts.sort((a, b) => a.ordem_prioridade - b.ordem_prioridade);

  localStorage.setItem("contato_emergencia", JSON.stringify(emergencyContacts));

  document.getElementById("nome_contato").value = "";
  document.getElementById("celular_contato").value = "";
  document.getElementById("parentesco").value = "";
  document.getElementById("ordem_prioridade").value = "";

  renderEmergencyContacts();
  alert("Contato de emergência salvo com sucesso.");
}

function renderEmergencyContacts() {
  const contactsList = document.getElementById("contactsList");
  contactsList.innerHTML = "";

  if (emergencyContacts.length === 0) {
    contactsList.innerHTML = `
      <div class="empty-contact">
        Nenhum contato de emergência salvo ainda.
      </div>
    `;
    return;
  }

  emergencyContacts.forEach((contact, index) => {
    const card = document.createElement("div");
    card.className = "contact-card";

    card.innerHTML = `
      <div class="contact-info">
        <strong>${contact.nome_contato}</strong>
        <span>Celular: ${contact.celular}</span>
        <div class="contact-relation">Parentesco: ${contact.parentesco}</div>
        <div class="contact-priority">Prioridade: ${contact.ordem_prioridade}</div>
      </div>
      <button class="delete-btn" onclick="deleteEmergencyContact(${index})">Excluir</button>
    `;

    contactsList.appendChild(card);
  });
}

function deleteEmergencyContact(index) {
  emergencyContacts.splice(index, 1);
  localStorage.setItem("contato_emergencia", JSON.stringify(emergencyContacts));
  renderEmergencyContacts();
}

function saveUserProfile() {
  const nome_completo = document.getElementById("nome_completo").value.trim();
  const email = document.getElementById("email").value.trim();
  const senha = document.getElementById("senha").value.trim();
  const celular = document.getElementById("celular_usuario").value.trim();
  const tipo_sanguineo = document.getElementById("tipo_sanguineo").value.trim();
  const info_medica = document.getElementById("info_medica").value.trim();

  if (!nome_completo || !email || !senha || !celular) {
    alert("Preencha os campos obrigatórios do usuário.");
    return;
  }

  const usuario = {
    ID_Usuario: 1,
    nome_completo,
    email,
    senha,
    celular,
    tipo_sanguineo,
    info_medica
  };

  localStorage.setItem("usuarios", JSON.stringify(usuario));
  renderUserProfile();
  alert("Perfil salvo com sucesso.");
}

function renderUserProfile() {
  const savedProfile = JSON.parse(localStorage.getItem("usuarios"));
  const profilePreview = document.getElementById("profilePreview");

  if (!profilePreview) return;

  if (!savedProfile) {
    profilePreview.innerHTML = `
      <div class="empty-box">
        Nenhum perfil salvo ainda.
      </div>
    `;
    return;
  }

  document.getElementById("nome_completo").value = savedProfile.nome_completo || "";
  document.getElementById("email").value = savedProfile.email || "";
  document.getElementById("senha").value = savedProfile.senha || "";
  document.getElementById("celular_usuario").value = savedProfile.celular || "";
  document.getElementById("tipo_sanguineo").value = savedProfile.tipo_sanguineo || "";
  document.getElementById("info_medica").value = savedProfile.info_medica || "";

  profilePreview.innerHTML = `
    <div class="profile-item">
      <strong>Nome completo</strong>
      <span>${savedProfile.nome_completo}</span>
    </div>
    <div class="profile-item">
      <strong>E-mail</strong>
      <span>${savedProfile.email}</span>
    </div>
    <div class="profile-item">
      <strong>Celular</strong>
      <span>${savedProfile.celular}</span>
    </div>
    <div class="profile-item">
      <strong>Tipo sanguíneo</strong>
      <span>${savedProfile.tipo_sanguineo || "-"}</span>
    </div>
    <div class="profile-item">
      <strong>Informações médicas</strong>
      <span>${savedProfile.info_medica || "-"}</span>
    </div>
  `;
}

async function pairBluetoothDevice() {
  if (!navigator.bluetooth) {
    alert("Bluetooth não é compatível com este navegador. No iPhone com Safari, isso normalmente não funciona. Use Chrome ou Edge em um dispositivo compatível.");
    return;
  }

  try {
    const device = await navigator.bluetooth.requestDevice({
      acceptAllDevices: true,
      optionalServices: ["battery_service"]
    });

    pairedBluetoothDevice = device;

    const apelido = device.name || "Chaveiro Bluetooth";
    const now = new Date().toLocaleString("pt-BR");

    document.getElementById("apelido_dispositivo").value = apelido;
    document.getElementById("data_pareamento").value = now;
    document.getElementById("status_ativo").value = "true";

    let nivelBateria = "";

    try {
      const server = await device.gatt.connect();
      const service = await server.getPrimaryService("battery_service");
      const characteristic = await service.getCharacteristic("battery_level");
      const value = await characteristic.readValue();
      nivelBateria = value.getUint8(0);
      document.getElementById("nivel_bateria").value = nivelBateria;
    } catch (batteryError) {
      console.log("Não foi possível ler o nível de bateria do dispositivo.", batteryError);
    }

    alert("Dispositivo emparelhado com sucesso.");
  } catch (error) {
    console.error(error);
    alert("Não foi possível emparelhar o dispositivo Bluetooth.");
  }
}

function saveBluetoothDevice() {
  const savedUser = JSON.parse(localStorage.getItem("usuarios"));

  const apelido_dispositivo = document.getElementById("apelido_dispositivo").value.trim();
  const nivel_bateria = document.getElementById("nivel_bateria").value.trim();
  const data_pareamento = document.getElementById("data_pareamento").value.trim();
  const status_ativo = document.getElementById("status_ativo").value === "true";

  if (!apelido_dispositivo || !data_pareamento) {
    alert("Preencha pelo menos o apelido do dispositivo e a data do emparelhamento.");
    return;
  }

  bluetoothDeviceData = {
    ID_Dispositivo: 1,
    ID_Usuario: savedUser ? savedUser.ID_Usuario : null,
    apelido_dispositivo,
    nivel_bateria: nivel_bateria ? Number(nivel_bateria) : null,
    data_pareamento,
    status_ativo
  };

  localStorage.setItem("dispositivo_bluetooth", JSON.stringify(bluetoothDeviceData));
  renderBluetoothDevice();
  alert("Dispositivo salvo com sucesso.");
}

function renderBluetoothDevice() {
  const devicePreview = document.getElementById("devicePreview");
  if (!devicePreview) return;

  if (!bluetoothDeviceData) {
    devicePreview.innerHTML = `
      <div class="empty-box">
        Nenhum dispositivo Bluetooth salvo ainda.
      </div>
    `;
    return;
  }

  document.getElementById("apelido_dispositivo").value = bluetoothDeviceData.apelido_dispositivo || "";
  document.getElementById("nivel_bateria").value =
    bluetoothDeviceData.nivel_bateria ?? "";
  document.getElementById("data_pareamento").value =
    bluetoothDeviceData.data_pareamento || "";
  document.getElementById("status_ativo").value =
    String(bluetoothDeviceData.status_ativo);

  devicePreview.innerHTML = `
    <div class="profile-item">
      <strong>Apelido do dispositivo</strong>
      <span>${bluetoothDeviceData.apelido_dispositivo}</span>
    </div>
    <div class="profile-item">
      <strong>Nível de bateria</strong>
      <span>${bluetoothDeviceData.nivel_bateria ?? "-"}</span>
    </div>
    <div class="profile-item">
      <strong>Data do emparelhamento</strong>
      <span>${bluetoothDeviceData.data_pareamento}</span>
    </div>
    <div class="profile-item">
      <strong>Situação do dispositivo</strong>
      <span>${bluetoothDeviceData.status_ativo ? "Ativo" : "Inativo"}</span>
    </div>
  `;
}

function renderSupportPoints() {
  const supportPointsList = document.getElementById("supportPointsList");

  if (!supportPointsList) return;

  if (supportPoints.length === 0) {
    supportPointsList.innerHTML = `
      <div class="empty-box">
        Nenhum ponto de apoio cadastrado.
      </div>
    `;
    return;
  }

  supportPointsList.innerHTML = supportPoints
    .map(
      (point) => `
        <div class="support-item">
          <strong>${point.nome_local}</strong>
          <span>Tipo de serviço: ${point.tipo_servico}</span>
          <span>Endereço: ${point.endereco_completo}</span>
          <span>Telefone: ${point.telefone_local}</span>
          <span>Latitude: ${point.latitude}</span>
          <span>Longitude: ${point.longitude}</span>
        </div>
      `
    )
    .join("");
}

function requestNotificationPermission() {
  if (!("Notification" in window)) return;

  if (Notification.permission === "default") {
    Notification.requestPermission();
  }
}

function showEmergencyNotification(message) {
  if (!("Notification" in window)) return;

  if (Notification.permission === "granted") {
    new Notification("Emergência ativada", {
      body: message,
      icon: "https://cdn-icons-png.flaticon.com/512/564/564619.png"
    });
  }
}

function playAlertSound() {
  const alertSound = document.getElementById("alertSound");
  if (alertSound) {
    alertSound.currentTime = 0;
    alertSound.play().catch(() => {
      console.log("O navegador bloqueou o áudio automático.");
    });
  }
}

function getLocation() {
  if (!navigator.geolocation) {
    alert("Seu navegador não oferece suporte à geolocalização.");
    return;
  }

  navigator.geolocation.getCurrentPosition(
    (position) => {
      const lat = position.coords.latitude;
      const lng = position.coords.longitude;

      currentLocation = { lat, lng };

      document.getElementById("locationText").textContent =
        `${lat.toFixed(5)}, ${lng.toFixed(5)}`;

      document.getElementById("mapContainer").innerHTML = `
        <iframe
          class="map-frame"
          src="https://maps.google.com/maps?q=${lat},${lng}&z=16&output=embed"
          allowfullscreen
          loading="lazy">
        </iframe>
      `;

      const navItems = document.querySelectorAll(".nav-item");
      if (navItems[2]) {
        scrollToSection("mapa", navItems[2]);
      }
    },
    (error) => {
      console.error(error);
      alert("Não foi possível acessar sua localização.");
    }
  );
}

function openInGoogleMaps() {
  if (!currentLocation) {
    alert("Primeiro obtenha sua localização.");
    return;
  }

  const { lat, lng } = currentLocation;
  window.open(`https://www.google.com/maps?q=${lat},${lng}`, "_blank");
}

function buildSOSMessage(lat, lng) {
  const mapsLink = `https://www.google.com/maps?q=${lat},${lng}`;

  return `SOS!
Tipo: ${selectedEmergencyType}
Preciso de ajuda.
Minha localização atual é: ${mapsLink}`;
}

function saveAlertRecord(lat, lng, modo_envio) {
  const savedUser = JSON.parse(localStorage.getItem("usuarios"));

  const newAlert = {
    ID_Alerta: Date.now(),
    ID_Usuario: savedUser ? savedUser.ID_Usuario : null,
    data_hora: new Date().toISOString(),
    latitude: Number(lat.toFixed(8)),
    longitude: Number(lng.toFixed(8)),
    modo_envio,
    status_resolvido: false
  };

  alertRecords.unshift(newAlert);
  localStorage.setItem("registros_alertas", JSON.stringify(alertRecords));
  renderAlertRecords();
}

function renderAlertRecords() {
  const alertsList = document.getElementById("alertsList");
  if (!alertsList) return;

  if (alertRecords.length === 0) {
    alertsList.innerHTML = `
      <div class="empty-box">
        Nenhum alerta registrado ainda.
      </div>
    `;
    return;
  }

  alertsList.innerHTML = alertRecords
    .map(
      (alert) => `
        <div class="alert-item">
          <strong>Alerta #${alert.ID_Alerta}</strong>
          <span>Usuário: ${alert.ID_Usuario ?? "-"}</span>
          <span>Data e hora: ${alert.data_hora}</span>
          <span>Latitude: ${alert.latitude}</span>
          <span>Longitude: ${alert.longitude}</span>
          <span>Modo de envio: ${alert.modo_envio}</span>
          <span>Situação: ${alert.status_resolvido ? "Resolvido" : "Pendente"}</span>
        </div>
      `
    )
    .join("");
}

function sendToPriorityContacts(message) {
  if (emergencyContacts.length === 0) return;

  const orderedContacts = [...emergencyContacts].sort(
    (a, b) => a.ordem_prioridade - b.ordem_prioridade
  );

  orderedContacts.forEach((contact, index) => {
    const cleanPhone = String(contact.celular).replace(/\D/g, "");
    const phoneWithCountry = cleanPhone.startsWith("55")
      ? cleanPhone
      : `55${cleanPhone}`;

    setTimeout(() => {
      window.open(
        `https://wa.me/${phoneWithCountry}?text=${encodeURIComponent(message)}`,
        "_blank"
      );
    }, index * 800);
  });
}

function sendSOS() {
  if (emergencyContacts.length === 0) {
    alert("Cadastre pelo menos um contato de emergência.");
    return;
  }

  if (!navigator.geolocation) {
    alert("Seu navegador não oferece suporte à geolocalização.");
    return;
  }

  requestNotificationPermission();

  navigator.geolocation.getCurrentPosition(
    (position) => {
      const lat = position.coords.latitude;
      const lng = position.coords.longitude;

      currentLocation = { lat, lng };

      const message = buildSOSMessage(lat, lng);

      playAlertSound();
      showEmergencyNotification(`SOS enviado. Tipo: ${selectedEmergencyType}`);
      saveAlertRecord(lat, lng, "WhatsApp / navegador");
      sendToPriorityContacts(message);

      alert(
        "Emergência ativada.\n\n" +
        "1. A notificação local foi exibida.\n" +
        "2. O som de alerta foi acionado.\n" +
        "3. O sistema tentou abrir o envio para os contatos cadastrados por prioridade."
      );
    },
    (error) => {
      console.error(error);
      alert("Não foi possível obter sua localização para enviar o SOS.");
    }
  );
}

requestNotificationPermission();
renderEmergencyContacts();
renderUserProfile();
renderAlertRecords();
renderSupportPoints();
renderBluetoothDevice();