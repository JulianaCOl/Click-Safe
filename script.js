let contatos = JSON.parse(localStorage.getItem("contatos")) || [];
let perfil = JSON.parse(localStorage.getItem("perfil")) || null;
let currentLocation = null;
let emergencyType = "medical";

function goTo(id, btn) {
  document.getElementById("acessibilidade").classList.add("hidden-section");

  const secao = document.getElementById(id);
  if (secao) {
    secao.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  document.querySelectorAll(".nav-item").forEach((b) => b.classList.remove("active"));
  btn.classList.add("active");
}

function toggleAcess(btn) {
  const sec = document.getElementById("acessibilidade");

  document.querySelectorAll(".nav-item").forEach((b) => b.classList.remove("active"));
  btn.classList.add("active");

  sec.classList.toggle("hidden-section");

  if (!sec.classList.contains("hidden-section")) {
    sec.scrollIntoView({ behavior: "smooth", block: "start" });
  }
}

function selectEmergencyType(button, type) {
  emergencyType = type;
  document.querySelectorAll(".type-pill").forEach((item) => item.classList.remove("selected"));
  button.classList.add("selected");
}

function addContact() {
  const nome = document.getElementById("nome").value.trim();
  const tel = document.getElementById("telefone").value.trim();

  if (!nome || !tel) {
    alert("Preencha os campos.");
    return;
  }

  contatos.push({ nome, tel });
  localStorage.setItem("contatos", JSON.stringify(contatos));

  document.getElementById("nome").value = "";
  document.getElementById("telefone").value = "";

  renderContatos();
}

function renderContatos() {
  const div = document.getElementById("listaContatos");
  div.innerHTML = "";

  if (contatos.length === 0) {
    div.innerHTML = `<div class="empty-box">Nenhum contato cadastrado.</div>`;
    return;
  }

  contatos.forEach((c, index) => {
    div.innerHTML += `
      <div class="contact-card">
        <div class="contact-info">
          <strong>${c.nome}</strong>
          <span>${c.tel}</span>
        </div>
        <button class="delete-btn" onclick="removerContato(${index})">Excluir</button>
      </div>
    `;
  });
}

function removerContato(index) {
  contatos.splice(index, 1);
  localStorage.setItem("contatos", JSON.stringify(contatos));
  renderContatos();
}

function salvarPerfil() {
  perfil = {
    nome: document.getElementById("nomeUser").value.trim(),
    email: document.getElementById("emailUser").value.trim(),
    cel: document.getElementById("celUser").value.trim()
  };

  if (!perfil.nome || !perfil.email || !perfil.cel) {
    alert("Preencha todos os dados do perfil.");
    return;
  }

  localStorage.setItem("perfil", JSON.stringify(perfil));
  renderPerfil();
  alert("Perfil salvo com sucesso.");
}

function editarPerfil() {
  if (!perfil) return;

  document.getElementById("nomeUser").value = perfil.nome || "";
  document.getElementById("emailUser").value = perfil.email || "";
  document.getElementById("celUser").value = perfil.cel || "";
}

function excluirPerfil() {
  localStorage.removeItem("perfil");
  perfil = null;

  document.getElementById("nomeUser").value = "";
  document.getElementById("emailUser").value = "";
  document.getElementById("celUser").value = "";

  renderPerfil();
}

function renderPerfil() {
  const div = document.getElementById("perfilView");

  if (!perfil) {
    div.innerHTML = `<div class="empty-box">Sem dados cadastrados.</div>`;
    return;
  }

  div.innerHTML = `
    <div class="profile-item">
      <strong>Nome</strong>
      <span>${perfil.nome}</span>
    </div>
    <div class="profile-item">
      <strong>E-mail</strong>
      <span>${perfil.email}</span>
    </div>
    <div class="profile-item">
      <strong>Celular</strong>
      <span>${perfil.cel}</span>
    </div>
  `;
}

function getLocation() {
  if (!navigator.geolocation) {
    alert("Geolocalização não suportada.");
    return;
  }

  navigator.geolocation.getCurrentPosition(
    (pos) => {
      const lat = pos.coords.latitude;
      const lng = pos.coords.longitude;

      currentLocation = { lat, lng };

      document.getElementById("locationText").innerText = `${lat.toFixed(5)}, ${lng.toFixed(5)}`;

      document.getElementById("mapContainer").innerHTML = `
        <iframe
          class="map-frame"
          src="https://maps.google.com/maps?q=${lat},${lng}&z=15&output=embed"
          loading="lazy"
          allowfullscreen>
        </iframe>
      `;
    },
    () => {
      alert("Não foi possível obter a localização.");
    }
  );
}

function openInGoogleMaps() {
  if (!currentLocation) {
    alert("Primeiro obtenha sua localização.");
    return;
  }

  window.open(`https://www.google.com/maps?q=${currentLocation.lat},${currentLocation.lng}`, "_blank");
}

function speakText(text) {
  if (!("speechSynthesis" in window)) return;

  speechSynthesis.cancel();

  const msg = new SpeechSynthesisUtterance(text);
  msg.lang = "pt-BR";
  msg.rate = 0.95;
  msg.pitch = 1;
  speechSynthesis.speak(msg);
}

function openSOSConfirmation() {
  const tipoTraduzido = {
    medical: "médica",
    fire: "incêndio",
    disaster: "desastre",
    accident: "acidente",
    violence: "violência",
    rescue: "resgate"
  };

  const mensagemFalada =
    `Confirmação de envio do SOS. Tipo de emergência selecionado: ${tipoTraduzido[emergencyType]}. ` +
    `Se deseja continuar, selecione confirmar na mensagem exibida na tela.`;

  speakText(mensagemFalada);

  const confirmado = confirm(
    `Confirmar envio do SOS?\n\nTipo de emergência: ${tipoTraduzido[emergencyType]}`
  );

  speechSynthesis.cancel();

  if (confirmado) {
    sendSOS();
  }
}

function sendSOS() {
  const tipoTraduzido = {
    medical: "Médica",
    fire: "Incêndio",
    disaster: "Desastre",
    accident: "Acidente",
    violence: "Violência",
    rescue: "Resgate"
  };

  const mensagem = `SOS enviado. Tipo de emergência: ${tipoTraduzido[emergencyType]}.`;

  alert(mensagem);
  speakText(mensagem);
}

function fontSize(type, clickedButton) {
  document.querySelectorAll(".font-btn").forEach((btn) => btn.classList.remove("active"));

  if (type === "small") {
    document.body.style.fontSize = "14px";
  }

  if (type === "normal") {
    document.body.style.fontSize = "16px";
  }

  if (type === "big") {
    document.body.style.fontSize = "20px";
  }

  if (clickedButton) {
    clickedButton.classList.add("active");
  }
}

function lerTela() {
  const msg = new SpeechSynthesisUtterance(document.body.innerText);
  msg.lang = "pt-BR";
  speechSynthesis.cancel();
  speechSynthesis.speak(msg);
}

function pararLeitura() {
  speechSynthesis.cancel();
}

renderContatos();
renderPerfil();