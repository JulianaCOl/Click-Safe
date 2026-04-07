let contacts = JSON.parse(localStorage.getItem("sosContacts")) || [];
let currentLocation = null;
let selectedEmergencyType = "Emergência";

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

function renderContacts() {
  const contactsList = document.getElementById("contactsList");
  contactsList.innerHTML = "";

  if (contacts.length === 0) {
    contactsList.innerHTML = `
      <div class="empty-contact">
        Nenhum contato salvo ainda. Adicione pelo menos 1 contato.
      </div>
    `;
    return;
  }

  contacts.forEach((contact, index) => {
    const card = document.createElement("div");
    card.className = "contact-card";

    card.innerHTML = `
      <div class="contact-info">
        <strong>${contact.name}</strong>
        <span>${contact.phone}</span>
      </div>
      <button class="delete-btn" onclick="deleteContact(${index})">Excluir</button>
    `;

    contactsList.appendChild(card);
  });
}

function saveContact() {
  const nameInput = document.getElementById("name");
  const phoneInput = document.getElementById("phone");

  const name = nameInput.value.trim();
  const phone = phoneInput.value.trim();

  if (!name || !phone) {
    alert("Preencha nome e telefone.");
    return;
  }

  contacts.push({ name, phone });
  localStorage.setItem("sosContacts", JSON.stringify(contacts));

  nameInput.value = "";
  phoneInput.value = "";

  renderContacts();
  alert("Contato salvo com sucesso.");
}

function deleteContact(index) {
  contacts.splice(index, 1);
  localStorage.setItem("sosContacts", JSON.stringify(contacts));
  renderContacts();
}

function getLocation() {
  if (!navigator.geolocation) {
    alert("Seu navegador não suporta geolocalização.");
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

      scrollToSection("mapa", document.querySelectorAll(".nav-item")[2]);
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

function sendSOS() {
  if (contacts.length === 0) {
    alert("Cadastre pelo menos 1 contato.");
    return;
  }

  if (!navigator.geolocation) {
    alert("Seu navegador não suporta geolocalização.");
    return;
  }

  navigator.geolocation.getCurrentPosition(
    (position) => {
      const lat = position.coords.latitude;
      const lng = position.coords.longitude;

      currentLocation = { lat, lng };

      const mapsLink = `https://www.google.com/maps?q=${lat},${lng}`;
      const firstContact = contacts[0];
      const cleanPhone = firstContact.phone.replace(/\D/g, "");
      const phoneWithCountry = cleanPhone.startsWith("55")
        ? cleanPhone
        : `55${cleanPhone}`;

      const message =
        `🚨 Tipo: ${selectedEmergencyType}. Preciso de ajuda. Minha localização atual é: ${mapsLink}`;

      window.open(
        `https://wa.me/${phoneWithCountry}?text=${encodeURIComponent(message)}`,
        "_blank"
      );
    },
    (error) => {
      console.error(error);
      alert("Não foi possível obter sua localização para enviar o SOS.");
    }
  );
}

renderContacts();