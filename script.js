let emergencyContacts = JSON.parse(localStorage.getItem("contato_emergencia")) || [];
let currentLocation = null;
let selectedEmergencyType = localStorage.getItem("selectedEmergencyType") || "medical";
let alertRecords = JSON.parse(localStorage.getItem("registros_alertas")) || [];

let pairedBluetoothDevice = null;
let bluetoothServer = null;
let sosCharacteristic = null;
let isDeviceSOSListenerActive = false;

let currentLanguage = localStorage.getItem("clicksafe_language") || "pt-BR";
let fontScale = parseFloat(localStorage.getItem("fontScale")) || 1;

let recognitionInstance = null;
let isListening = false;

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

const translations = {
  "pt-BR": {
    app_title: "Click Safe",
    current_location_label: "Localização atual",
    current_location_value: "Toque no ícone para obter sua localização",
    accessibility_title: "Acessibilidade",
    language_label: "Idioma",
    font_size_label: "Tamanho da letra",
    read_screen: "Ouvir a tela",
    stop_reading: "Parar leitura",
    voice_command: "Comando de voz",
    stop_voice_command: "Parar comando de voz",
    voice_status_idle: "Áudio e voz prontos para uso.",
    voice_status_speaking: "Lendo o conteúdo da tela.",
    voice_status_stopped: "Leitura interrompida.",
    voice_status_listening: "Ouvindo comando de voz...",
    voice_status_not_supported: "Comando de voz não disponível neste navegador.",
    voice_status_recognized: "Comando reconhecido:",
    voice_status_error: "Não foi possível reconhecer o comando de voz.",
    hero_title: "Você está em uma emergência?",
    hero_text: "Pressione o botão SOS e compartilhe sua localização com seus contatos de emergência.",
    how_to_use_button: "Como usar o aplicativo",
    how_to_use_title: "Como usar",
    tutorial_step_1: "Cadastre seu perfil e pelo menos um contato de emergência.",
    tutorial_step_2: "Emparelhe o chaveiro Bluetooth e ative a escuta do botão SOS.",
    tutorial_step_3: "Toque no botão de localização para visualizar o mapa.",
    tutorial_step_4: "Selecione o tipo de emergência e toque no botão SOS ou use o chaveiro.",
    sos_button_text: "Toque para enviar",
    emergency_type_title: "Qual é a emergência?",
    emergency_medical: "Médica",
    emergency_fire: "Incêndio",
    emergency_disaster: "Desastre",
    emergency_accident: "Acidente",
    emergency_violence: "Violência",
    emergency_rescue: "Resgate",
    map_title: "Localização no mapa",
    open_google_maps: "Abrir no Google Maps",
    map_placeholder: "Seu mapa aparecerá aqui após você permitir o acesso à localização.",
    support_points_title: "Pontos de apoio",
    contacts_title: "Contatos de emergência",
    contact_name_placeholder: "Nome do contato",
    contact_phone_placeholder: "Número do celular",
    contact_relationship_placeholder: "Grau de parentesco",
    contact_priority_placeholder: "Ordem de prioridade",
    save_contact: "Salvar contato",
    profile_title: "Perfil",
    full_name_placeholder: "Nome completo",
    email_placeholder: "E-mail",
    password_placeholder: "Senha",
    mobile_placeholder: "Telefone celular",
    blood_type_placeholder: "Tipo sanguíneo",
    medical_info_placeholder: "Informações médicas",
    save_update_profile: "Salvar / Atualizar perfil",
    edit_profile: "Editar perfil",
    delete_profile: "Excluir perfil",
    bluetooth_title: "Chaveiro SOS",
    pair_device: "Emparelhar chaveiro",
    device_status_placeholder: "Situação do chaveiro",
    activate_keychain_sos: "Ativar botão SOS do chaveiro",
    stop_keychain_listener: "Parar escuta",
    disconnect_device: "Desconectar",
    alert_history_title: "Histórico de alertas",
    nav_home: "Início",
    nav_contacts: "Contatos",
    nav_map: "Mapa",
    nav_profile: "Perfil",
    empty_profile: "Nenhum perfil salvo ainda.",
    empty_contacts: "Nenhum contato de emergência salvo ainda.",
    empty_alerts: "Nenhum alerta registrado ainda.",
    empty_support: "Nenhum ponto de apoio cadastrado.",
    empty_keychain: "Nenhum chaveiro conectado no momento.",
    full_name: "Nome completo",
    email: "E-mail",
    mobile: "Celular",
    blood_type: "Tipo sanguíneo",
    medical_info: "Informações médicas",
    contact_mobile: "Celular",
    contact_relationship: "Parentesco",
    contact_priority: "Prioridade",
    alert_user: "Usuário",
    alert_datetime: "Data e hora",
    alert_latitude: "Latitude",
    alert_longitude: "Longitude",
    alert_send_mode: "Modo de envio",
    alert_status: "Situação",
    resolved: "Resolvido",
    pending: "Pendente",
    support_service_type: "Tipo de serviço",
    support_address: "Endereço",
    support_phone: "Telefone",
    support_latitude: "Latitude",
    support_longitude: "Longitude",
    keychain_connected: "Chaveiro conectado",
    keychain_connecting: "Conectando ao chaveiro...",
    keychain_disconnected: "Chaveiro desconectado",
    keychain_listener_active: "Escuta do botão SOS ativada",
    keychain_listener_inactive: "Escuta do botão SOS desativada",
    keychain_button_pressed: "Botão do chaveiro acionado",
    keychain_reconnecting: "Tentando reconectar o chaveiro...",
    keychain_reconnected: "Chaveiro reconectado com sucesso",
    keychain_reconnect_failed: "Não foi possível reconectar o chaveiro",
    keychain_bluetooth_unavailable: "Bluetooth indisponível no dispositivo",
    keychain_bluetooth_unsupported: "Bluetooth não compatível neste navegador",
    keychain_pair_failed: "Falha ao emparelhar o chaveiro",
    keychain_listener_failed: "Não foi possível ativar a escuta do botão SOS",
    alert_emergency_activated: "Emergência ativada",
    alert_sos_sent_type: "SOS enviado. Tipo:",
    confirm_delete_profile: "Tem certeza de que deseja excluir os dados do perfil?",
    saved_profile_success: "Perfil salvo ou atualizado com sucesso.",
    loaded_profile_edit: "Os dados do perfil foram carregados para edição.",
    deleted_profile_success: "Os dados do perfil foram excluídos com sucesso.",
    save_contact_success: "Contato de emergência salvo com sucesso.",
    paired_keychain_success: "Chaveiro emparelhado com sucesso.",
    keychain_listener_success: "Escuta do botão SOS ativada com sucesso.",
    keychain_listener_stopped: "Escuta do botão SOS desativada.",
    reconnect_failed: "Não foi possível reconectar ao chaveiro.",
    bluetooth_not_supported: "Bluetooth não é compatível com este navegador. Use HTTPS e, de preferência, Chrome ou Edge em dispositivo compatível.",
    bluetooth_not_available: "O Bluetooth não está disponível neste dispositivo no momento.",
    pair_bluetooth_failed: "Não foi possível emparelhar o chaveiro Bluetooth.",
    no_device_session: "Nenhum chaveiro foi emparelhado nesta sessão.",
    no_connected_device: "Nenhum chaveiro conectado no momento.",
    fill_contact_fields: "Preencha todos os campos do contato de emergência.",
    fill_user_required: "Preencha os campos obrigatórios do usuário.",
    no_saved_profile: "Nenhum perfil foi salvo ainda.",
    geolocation_unsupported: "Seu navegador não oferece suporte à geolocalização.",
    geolocation_failed: "Não foi possível acessar sua localização.",
    get_location_first: "Primeiro obtenha sua localização.",
    need_emergency_contact: "Cadastre pelo menos um contato de emergência.",
    sos_location_failed: "Não foi possível obter sua localização para enviar o SOS.",
    emergency_activated_message: "Emergência ativada.\n\n1. A notificação local foi exibida.\n2. O som de alerta foi acionado.\n3. O sistema tentou abrir o envio para os contatos cadastrados por prioridade.",
    sos_message_type: "Tipo",
    sos_message_help: "Preciso de ajuda.",
    sos_message_location: "Minha localização atual é"
  },
  en: {
    app_title: "Click Safe",
    current_location_label: "Current location",
    current_location_value: "Tap the icon to get your location",
    accessibility_title: "Accessibility",
    language_label: "Language",
    font_size_label: "Font size",
    read_screen: "Read screen",
    stop_reading: "Stop reading",
    voice_command: "Voice command",
    stop_voice_command: "Stop voice command",
    voice_status_idle: "Audio and voice are ready to use.",
    voice_status_speaking: "Reading screen content.",
    voice_status_stopped: "Reading stopped.",
    voice_status_listening: "Listening for voice command...",
    voice_status_not_supported: "Voice command is not available in this browser.",
    voice_status_recognized: "Recognized command:",
    voice_status_error: "Could not recognize the voice command.",
    hero_title: "Are you in an emergency?",
    hero_text: "Press the SOS button and share your location with your emergency contacts.",
    how_to_use_button: "How to use the app",
    how_to_use_title: "How to use",
    tutorial_step_1: "Register your profile and at least one emergency contact.",
    tutorial_step_2: "Pair the Bluetooth keychain and activate the SOS button listener.",
    tutorial_step_3: "Tap the location button to view the map.",
    tutorial_step_4: "Select the emergency type and tap the SOS button or use the keychain.",
    sos_button_text: "Tap to send",
    emergency_type_title: "What is the emergency?",
    emergency_medical: "Medical",
    emergency_fire: "Fire",
    emergency_disaster: "Disaster",
    emergency_accident: "Accident",
    emergency_violence: "Violence",
    emergency_rescue: "Rescue",
    map_title: "Location on map",
    open_google_maps: "Open in Google Maps",
    map_placeholder: "Your map will appear here after you allow location access.",
    support_points_title: "Support points",
    contacts_title: "Emergency contacts",
    contact_name_placeholder: "Contact name",
    contact_phone_placeholder: "Mobile number",
    contact_relationship_placeholder: "Relationship",
    contact_priority_placeholder: "Priority order",
    save_contact: "Save contact",
    profile_title: "Profile",
    full_name_placeholder: "Full name",
    email_placeholder: "Email",
    password_placeholder: "Password",
    mobile_placeholder: "Mobile phone",
    blood_type_placeholder: "Blood type",
    medical_info_placeholder: "Medical information",
    save_update_profile: "Save / Update profile",
    edit_profile: "Edit profile",
    delete_profile: "Delete profile",
    bluetooth_title: "SOS Keychain",
    pair_device: "Pair keychain",
    device_status_placeholder: "Keychain status",
    activate_keychain_sos: "Enable keychain SOS button",
    stop_keychain_listener: "Stop listening",
    disconnect_device: "Disconnect",
    alert_history_title: "Alert history",
    nav_home: "Home",
    nav_contacts: "Contacts",
    nav_map: "Map",
    nav_profile: "Profile",
    empty_profile: "No profile saved yet.",
    empty_contacts: "No emergency contacts saved yet.",
    empty_alerts: "No alerts recorded yet.",
    empty_support: "No support points registered.",
    empty_keychain: "No keychain connected at the moment.",
    full_name: "Full name",
    email: "Email",
    mobile: "Mobile",
    blood_type: "Blood type",
    medical_info: "Medical information",
    contact_mobile: "Mobile",
    contact_relationship: "Relationship",
    contact_priority: "Priority",
    alert_user: "User",
    alert_datetime: "Date and time",
    alert_latitude: "Latitude",
    alert_longitude: "Longitude",
    alert_send_mode: "Send mode",
    alert_status: "Status",
    resolved: "Resolved",
    pending: "Pending",
    support_service_type: "Service type",
    support_address: "Address",
    support_phone: "Phone",
    support_latitude: "Latitude",
    support_longitude: "Longitude",
    keychain_connected: "Keychain connected",
    keychain_connecting: "Connecting to keychain...",
    keychain_disconnected: "Keychain disconnected",
    keychain_listener_active: "SOS button listener enabled",
    keychain_listener_inactive: "SOS button listener disabled",
    keychain_button_pressed: "Keychain button pressed",
    keychain_reconnecting: "Trying to reconnect keychain...",
    keychain_reconnected: "Keychain reconnected successfully",
    keychain_reconnect_failed: "Could not reconnect keychain",
    keychain_bluetooth_unavailable: "Bluetooth unavailable on device",
    keychain_bluetooth_unsupported: "Bluetooth not supported in this browser",
    keychain_pair_failed: "Failed to pair keychain",
    keychain_listener_failed: "Could not enable SOS button listener",
    alert_emergency_activated: "Emergency activated",
    alert_sos_sent_type: "SOS sent. Type:",
    confirm_delete_profile: "Are you sure you want to delete the profile data?",
    saved_profile_success: "Profile saved or updated successfully.",
    loaded_profile_edit: "Profile data loaded for editing.",
    deleted_profile_success: "Profile data deleted successfully.",
    save_contact_success: "Emergency contact saved successfully.",
    paired_keychain_success: "Keychain paired successfully.",
    keychain_listener_success: "SOS button listener enabled successfully.",
    keychain_listener_stopped: "SOS button listener stopped.",
    reconnect_failed: "Could not reconnect to the keychain.",
    bluetooth_not_supported: "Bluetooth is not supported in this browser. Use HTTPS and preferably Chrome or Edge on a compatible device.",
    bluetooth_not_available: "Bluetooth is not available on this device right now.",
    pair_bluetooth_failed: "Could not pair the Bluetooth keychain.",
    no_device_session: "No keychain has been paired in this session.",
    no_connected_device: "No keychain connected at the moment.",
    fill_contact_fields: "Fill in all emergency contact fields.",
    fill_user_required: "Fill in the required user fields.",
    no_saved_profile: "No profile has been saved yet.",
    geolocation_unsupported: "Your browser does not support geolocation.",
    geolocation_failed: "Could not access your location.",
    get_location_first: "Get your location first.",
    need_emergency_contact: "Please add at least one emergency contact.",
    sos_location_failed: "Could not get your location to send SOS.",
    emergency_activated_message: "Emergency activated.\n\n1. Local notification was shown.\n2. Alert sound was played.\n3. The system tried to open sending to the registered contacts by priority.",
    sos_message_type: "Type",
    sos_message_help: "I need help.",
    sos_message_location: "My current location is"
  },
  es: {
    app_title: "Click Safe",
    current_location_label: "Ubicación actual",
    current_location_value: "Toque el ícono para obtener su ubicación",
    accessibility_title: "Accesibilidad",
    language_label: "Idioma",
    font_size_label: "Tamaño de letra",
    read_screen: "Escuchar pantalla",
    stop_reading: "Detener lectura",
    voice_command: "Comando de voz",
    stop_voice_command: "Detener comando de voz",
    voice_status_idle: "Audio y voz listos para usar.",
    voice_status_speaking: "Leyendo el contenido de la pantalla.",
    voice_status_stopped: "Lectura detenida.",
    voice_status_listening: "Escuchando comando de voz...",
    voice_status_not_supported: "El comando de voz no está disponible en este navegador.",
    voice_status_recognized: "Comando reconocido:",
    voice_status_error: "No fue posible reconocer el comando de voz.",
    hero_title: "¿Está en una emergencia?",
    hero_text: "Presione el botón SOS y comparta su ubicación con sus contactos de emergencia.",
    how_to_use_button: "Cómo usar la aplicación",
    how_to_use_title: "Cómo usar",
    tutorial_step_1: "Registre su perfil y al menos un contacto de emergencia.",
    tutorial_step_2: "Empareje el llavero Bluetooth y active la escucha del botón SOS.",
    tutorial_step_3: "Toque el botón de ubicación para ver el mapa.",
    tutorial_step_4: "Seleccione el tipo de emergencia y toque el botón SOS o use el llavero.",
    sos_button_text: "Toque para enviar",
    emergency_type_title: "¿Cuál es la emergencia?",
    emergency_medical: "Médica",
    emergency_fire: "Incendio",
    emergency_disaster: "Desastre",
    emergency_accident: "Accidente",
    emergency_violence: "Violencia",
    emergency_rescue: "Rescate",
    map_title: "Ubicación en el mapa",
    open_google_maps: "Abrir en Google Maps",
    map_placeholder: "Su mapa aparecerá aquí después de permitir el acceso a la ubicación.",
    support_points_title: "Puntos de apoyo",
    contacts_title: "Contactos de emergencia",
    contact_name_placeholder: "Nombre del contacto",
    contact_phone_placeholder: "Número de celular",
    contact_relationship_placeholder: "Parentesco",
    contact_priority_placeholder: "Orden de prioridad",
    save_contact: "Guardar contacto",
    profile_title: "Perfil",
    full_name_placeholder: "Nombre completo",
    email_placeholder: "Correo electrónico",
    password_placeholder: "Contraseña",
    mobile_placeholder: "Teléfono celular",
    blood_type_placeholder: "Tipo de sangre",
    medical_info_placeholder: "Información médica",
    save_update_profile: "Guardar / Actualizar perfil",
    edit_profile: "Editar perfil",
    delete_profile: "Eliminar perfil",
    bluetooth_title: "Llavero SOS",
    pair_device: "Emparejar llavero",
    device_status_placeholder: "Estado del llavero",
    activate_keychain_sos: "Activar botón SOS del llavero",
    stop_keychain_listener: "Detener escucha",
    disconnect_device: "Desconectar",
    alert_history_title: "Historial de alertas",
    nav_home: "Inicio",
    nav_contacts: "Contactos",
    nav_map: "Mapa",
    nav_profile: "Perfil",
    empty_profile: "Todavía no hay un perfil guardado.",
    empty_contacts: "Todavía no hay contactos de emergencia guardados.",
    empty_alerts: "Todavía no hay alertas registradas.",
    empty_support: "No hay puntos de apoyo registrados.",
    empty_keychain: "No hay ningún llavero conectado en este momento.",
    full_name: "Nombre completo",
    email: "Correo electrónico",
    mobile: "Celular",
    blood_type: "Tipo de sangre",
    medical_info: "Información médica",
    contact_mobile: "Celular",
    contact_relationship: "Parentesco",
    contact_priority: "Prioridad",
    alert_user: "Usuario",
    alert_datetime: "Fecha y hora",
    alert_latitude: "Latitud",
    alert_longitude: "Longitud",
    alert_send_mode: "Modo de envío",
    alert_status: "Estado",
    resolved: "Resuelto",
    pending: "Pendiente",
    support_service_type: "Tipo de servicio",
    support_address: "Dirección",
    support_phone: "Teléfono",
    support_latitude: "Latitud",
    support_longitude: "Longitud",
    keychain_connected: "Llavero conectado",
    keychain_connecting: "Conectando al llavero...",
    keychain_disconnected: "Llavero desconectado",
    keychain_listener_active: "Escucha del botón SOS activada",
    keychain_listener_inactive: "Escucha del botón SOS desactivada",
    keychain_button_pressed: "Botón del llavero presionado",
    keychain_reconnecting: "Intentando reconectar el llavero...",
    keychain_reconnected: "Llavero reconectado con éxito",
    keychain_reconnect_failed: "No fue posible reconectar el llavero",
    keychain_bluetooth_unavailable: "Bluetooth no disponible en el dispositivo",
    keychain_bluetooth_unsupported: "Bluetooth no compatible en este navegador",
    keychain_pair_failed: "Error al emparejar el llavero",
    keychain_listener_failed: "No fue posible activar la escucha del botón SOS",
    alert_emergency_activated: "Emergencia activada",
    alert_sos_sent_type: "SOS enviado. Tipo:",
    confirm_delete_profile: "¿Está seguro de que desea eliminar los datos del perfil?",
    saved_profile_success: "Perfil guardado o actualizado con éxito.",
    loaded_profile_edit: "Los datos del perfil fueron cargados para edición.",
    deleted_profile_success: "Los datos del perfil fueron eliminados con éxito.",
    save_contact_success: "Contacto de emergencia guardado con éxito.",
    paired_keychain_success: "Llavero emparejado con éxito.",
    keychain_listener_success: "Escucha del botón SOS activada con éxito.",
    keychain_listener_stopped: "Escucha del botón SOS desactivada.",
    reconnect_failed: "No fue posible reconectar el llavero.",
    bluetooth_not_supported: "Bluetooth no es compatible con este navegador. Use HTTPS y preferentemente Chrome o Edge en un dispositivo compatible.",
    bluetooth_not_available: "Bluetooth no está disponible en este dispositivo en este momento.",
    pair_bluetooth_failed: "No fue posible emparejar el llavero Bluetooth.",
    no_device_session: "No se ha emparejado ningún llavero en esta sesión.",
    no_connected_device: "No hay ningún llavero conectado en este momento.",
    fill_contact_fields: "Complete todos los campos del contacto de emergencia.",
    fill_user_required: "Complete los campos obligatorios del usuario.",
    no_saved_profile: "Todavía no se ha guardado ningún perfil.",
    geolocation_unsupported: "Su navegador no admite geolocalización.",
    geolocation_failed: "No fue posible acceder a su ubicación.",
    get_location_first: "Primero obtenga su ubicación.",
    need_emergency_contact: "Registre al menos un contacto de emergencia.",
    sos_location_failed: "No fue posible obtener su ubicación para enviar el SOS.",
    emergency_activated_message: "Emergencia activada.\n\n1. Se mostró la notificación local.\n2. Se activó el sonido de alerta.\n3. El sistema intentó abrir el envío a los contactos registrados por prioridad.",
    sos_message_type: "Tipo",
    sos_message_help: "Necesito ayuda.",
    sos_message_location: "Mi ubicación actual es"
  }
};

const emergencyTypeLabelMap = {
  medical: "emergency_medical",
  fire: "emergency_fire",
  disaster: "emergency_disaster",
  accident: "emergency_accident",
  violence: "emergency_violence",
  rescue: "emergency_rescue"
};

function t(key) {
  return translations[currentLanguage][key] || translations["pt-BR"][key] || key;
}

function updateVoiceStatus(text, style = "") {
  const voiceStatus = document.getElementById("voiceStatus");
  if (!voiceStatus) return;
  voiceStatus.textContent = text;
  voiceStatus.className = "voice-status";
  if (style) voiceStatus.classList.add(style);
}

function changeLanguage(language) {
  currentLanguage = language;
  localStorage.setItem("clicksafe_language", language);
  applyTranslations();
  renderEmergencyContacts();
  renderUserProfile();
  renderKeychainStatus();
  renderAlertRecords();
  renderSupportPoints();
}

function applyTranslations() {
  document.documentElement.lang = currentLanguage === "pt-BR" ? "pt-BR" : currentLanguage;
  document.title = t("app_title");

  document.querySelectorAll("[data-i18n]").forEach((element) => {
    const key = element.getAttribute("data-i18n");
    element.textContent = t(key);
  });

  document.querySelectorAll("[data-i18n-placeholder]").forEach((element) => {
    const key = element.getAttribute("data-i18n-placeholder");
    element.placeholder = t(key);
  });

  updateLocationTextDefault();
  updateVoiceStatus(t("voice_status_idle"));
}

function changeFontSize(action) {
  if (action === "increase") {
    fontScale += 0.1;
  } else if (action === "decrease") {
    fontScale -= 0.1;
  } else {
    fontScale = 1;
  }

  fontScale = Math.min(Math.max(fontScale, 0.9), 1.4);

  document.documentElement.style.fontSize = fontScale + "rem";
  localStorage.setItem("fontScale", fontScale);

  updateActiveFontButton(action);
}

function updateActiveFontButton(action) {
  document.querySelectorAll(".font-btn").forEach((btn) => btn.classList.remove("active"));

  if (action === "increase") {
    document.getElementById("fontBtnIncrease")?.classList.add("active");
  } else if (action === "decrease") {
    document.getElementById("fontBtnDecrease")?.classList.add("active");
  } else {
    document.getElementById("fontBtnDefault")?.classList.add("active");
  }
}

function setInitialFontButton() {
  if (fontScale < 1) {
    updateActiveFontButton("decrease");
  } else if (fontScale > 1) {
    updateActiveFontButton("increase");
  } else {
    updateActiveFontButton("default");
  }
}

function updateLocationTextDefault() {
  if (!currentLocation) {
    const locationText = document.getElementById("locationText");
    if (locationText) locationText.textContent = t("current_location_value");
  }
}

/* VOZ */
function getVoiceLang() {
  if (currentLanguage === "pt-BR") return "pt-BR";
  if (currentLanguage === "es") return "es-ES";
  return "en-US";
}

function getScreenSummary() {
  return [
    t("hero_title"),
    t("hero_text"),
    t("how_to_use_title"),
    t("tutorial_step_1"),
    t("tutorial_step_2"),
    t("tutorial_step_3"),
    t("tutorial_step_4"),
    t("emergency_type_title"),
    t("contacts_title"),
    t("profile_title"),
    t("bluetooth_title")
  ].join(". ");
}

function speakCurrentScreen() {
  if (!("speechSynthesis" in window)) {
    updateVoiceStatus(t("voice_status_not_supported"), "voice-status-error");
    return;
  }

  window.speechSynthesis.cancel();

  const utterance = new SpeechSynthesisUtterance(getScreenSummary());
  utterance.lang = getVoiceLang();
  utterance.rate = 0.95;
  utterance.pitch = 1;

  utterance.onstart = () => updateVoiceStatus(t("voice_status_speaking"), "voice-status-ok");
  utterance.onend = () => updateVoiceStatus(t("voice_status_idle"));
  utterance.onerror = () => updateVoiceStatus(t("voice_status_error"), "voice-status-error");

  window.speechSynthesis.speak(utterance);
}

function stopSpeaking() {
  if ("speechSynthesis" in window) window.speechSynthesis.cancel();
  updateVoiceStatus(t("voice_status_stopped"), "voice-status-warning");
}

function initRecognition() {
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (!SpeechRecognition) return null;

  const recognition = new SpeechRecognition();
  recognition.lang = getVoiceLang();
  recognition.interimResults = false;
  recognition.maxAlternatives = 1;
  recognition.continuous = false;

  recognition.onstart = () => {
    isListening = true;
    updateVoiceStatus(t("voice_status_listening"), "voice-status-ok");
  };

  recognition.onend = () => {
    isListening = false;
    if (document.getElementById("voiceStatus").textContent === t("voice_status_listening")) {
      updateVoiceStatus(t("voice_status_idle"));
    }
  };

  recognition.onerror = () => {
    isListening = false;
    updateVoiceStatus(t("voice_status_error"), "voice-status-error");
  };

  recognition.onresult = (event) => {
    const transcript = event.results[0][0].transcript.trim().toLowerCase();
    updateVoiceStatus(`${t("voice_status_recognized")} ${transcript}`, "voice-status-ok");
    handleVoiceCommand(transcript);
  };

  return recognition;
}

function startVoiceRecognition() {
  recognitionInstance = initRecognition();

  if (!recognitionInstance) {
    updateVoiceStatus(t("voice_status_not_supported"), "voice-status-error");
    return;
  }

  recognitionInstance.lang = getVoiceLang();

  try {
    recognitionInstance.start();
  } catch (_) {
    updateVoiceStatus(t("voice_status_error"), "voice-status-error");
  }
}

function stopVoiceRecognition() {
  if (recognitionInstance && isListening) recognitionInstance.stop();
  updateVoiceStatus(t("voice_status_stopped"), "voice-status-warning");
}

function handleVoiceCommand(command) {
  const c = command.normalize("NFD").replace(/[\u0300-\u036f]/g, "");

  if (c.includes("sos") || c.includes("socorro") || c.includes("help") || c.includes("ayuda")) {
    sendSOS();
    return;
  }

  if (c.includes("mapa") || c.includes("map") || c.includes("localizacao") || c.includes("ubicacion")) {
    const btn = document.querySelectorAll(".nav-item")[2];
    scrollToSection("mapa", btn);
    return;
  }

  if (c.includes("contato") || c.includes("contact")) {
    const btn = document.querySelectorAll(".nav-item")[1];
    scrollToSection("contatos", btn);
    return;
  }

  if (c.includes("perfil") || c.includes("profile")) {
    const btn = document.querySelectorAll(".nav-item")[3];
    scrollToSection("perfil", btn);
    return;
  }

  if (c.includes("inicio") || c.includes("home")) {
    const btn = document.querySelectorAll(".nav-item")[0];
    scrollToSection("inicio", btn);
    return;
  }

  if (c.includes("localizacao") || c.includes("location") || c.includes("ubicacion")) {
    getLocation();
  }
}

function toggleTutorial() {
  const tutorialBox = document.getElementById("tutorialBox");
  tutorialBox.classList.toggle("hidden");
}

function scrollToSection(sectionId, clickedButton) {
  const section = document.getElementById(sectionId);

  if (section) {
    section.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  document.querySelectorAll(".nav-item").forEach((item) => item.classList.remove("active"));
  if (clickedButton) clickedButton.classList.add("active");
}

function selectEmergencyType(button, type) {
  selectedEmergencyType = type;
  localStorage.setItem("selectedEmergencyType", type);

  document.querySelectorAll(".type-pill").forEach((item) => item.classList.remove("selected"));
  button.classList.add("selected");
}

function restoreSelectedEmergencyType() {
  const buttons = document.querySelectorAll(".type-pill");
  const order = ["medical", "fire", "disaster", "accident", "violence", "rescue"];
  const index = order.indexOf(selectedEmergencyType);
  if (buttons[index]) buttons[index].classList.add("selected");
}

function saveEmergencyContact() {
  const nome_contato = document.getElementById("nome_contato").value.trim();
  const celular = document.getElementById("celular_contato").value.trim();
  const parentesco = document.getElementById("parentesco").value.trim();
  const ordem_prioridade = document.getElementById("ordem_prioridade").value.trim();

  if (!nome_contato || !celular || !parentesco || !ordem_prioridade) {
    alert(t("fill_contact_fields"));
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
  alert(t("save_contact_success"));
}

function renderEmergencyContacts() {
  const contactsList = document.getElementById("contactsList");
  contactsList.innerHTML = "";

  if (emergencyContacts.length === 0) {
    contactsList.innerHTML = `<div class="empty-contact">${t("empty_contacts")}</div>`;
    return;
  }

  emergencyContacts.forEach((contact, index) => {
    const card = document.createElement("div");
    card.className = "contact-card";

    card.innerHTML = `
      <div class="contact-info">
        <strong>${contact.nome_contato}</strong>
        <span>${t("contact_mobile")}: ${contact.celular}</span>
        <div class="contact-relation">${t("contact_relationship")}: ${contact.parentesco}</div>
        <div class="contact-priority">${t("contact_priority")}: ${contact.ordem_prioridade}</div>
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
    alert(t("fill_user_required"));
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
  alert(t("saved_profile_success"));
}

function editUserProfile() {
  const savedProfile = JSON.parse(localStorage.getItem("usuarios"));

  if (!savedProfile) {
    alert(t("no_saved_profile"));
    return;
  }

  document.getElementById("nome_completo").value = savedProfile.nome_completo || "";
  document.getElementById("email").value = savedProfile.email || "";
  document.getElementById("senha").value = savedProfile.senha || "";
  document.getElementById("celular_usuario").value = savedProfile.celular || "";
  document.getElementById("tipo_sanguineo").value = savedProfile.tipo_sanguineo || "";
  document.getElementById("info_medica").value = savedProfile.info_medica || "";

  alert(t("loaded_profile_edit"));
}

function deleteUserProfile() {
  const confirmed = confirm(t("confirm_delete_profile"));
  if (!confirmed) return;

  localStorage.removeItem("usuarios");

  document.getElementById("nome_completo").value = "";
  document.getElementById("email").value = "";
  document.getElementById("senha").value = "";
  document.getElementById("celular_usuario").value = "";
  document.getElementById("tipo_sanguineo").value = "";
  document.getElementById("info_medica").value = "";

  renderUserProfile();
  alert(t("deleted_profile_success"));
}

function renderUserProfile() {
  const savedProfile = JSON.parse(localStorage.getItem("usuarios"));
  const profilePreview = document.getElementById("profilePreview");

  if (!profilePreview) return;

  if (!savedProfile) {
    profilePreview.innerHTML = `<div class="empty-box">${t("empty_profile")}</div>`;
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
      <strong>${t("full_name")}</strong>
      <span>${savedProfile.nome_completo}</span>
    </div>
    <div class="profile-item">
      <strong>${t("email")}</strong>
      <span>${savedProfile.email}</span>
    </div>
    <div class="profile-item">
      <strong>${t("mobile")}</strong>
      <span>${savedProfile.celular}</span>
    </div>
    <div class="profile-item">
      <strong>${t("blood_type")}</strong>
      <span>${savedProfile.tipo_sanguineo || "-"}</span>
    </div>
    <div class="profile-item">
      <strong>${t("medical_info")}</strong>
      <span>${savedProfile.info_medica || "-"}</span>
    </div>
  `;
}

/* CHAVEIRO BLUETOOTH */
function setKeychainStatusText(text, visual = "warning") {
  const statusInput = document.getElementById("status_dispositivo_texto");
  if (!statusInput) return;

  statusInput.value = text;
  statusInput.classList.remove("device-status-ok", "device-status-warning", "device-status-error");

  if (visual === "ok") statusInput.classList.add("device-status-ok");
  if (visual === "warning") statusInput.classList.add("device-status-warning");
  if (visual === "error") statusInput.classList.add("device-status-error");
}

async function pairBluetoothDevice() {
  if (!navigator.bluetooth) {
    setKeychainStatusText(t("keychain_bluetooth_unsupported"), "error");
    alert(t("bluetooth_not_supported"));
    return;
  }

  try {
    const available = await navigator.bluetooth.getAvailability();
    if (!available) {
      setKeychainStatusText(t("keychain_bluetooth_unavailable"), "error");
      alert(t("bluetooth_not_available"));
      return;
    }
  } catch (_) {}

  try {
    const device = await navigator.bluetooth.requestDevice({
      acceptAllDevices: true,
      optionalServices: ["0000ffe0-0000-1000-8000-00805f9b34fb"]
    });

    pairedBluetoothDevice = device;
    pairedBluetoothDevice.addEventListener("gattserverdisconnected", handleBluetoothDisconnection);

    setKeychainStatusText(t("keychain_connecting"), "warning");
    bluetoothServer = await pairedBluetoothDevice.gatt.connect();
    setKeychainStatusText(t("keychain_connected"), "ok");

    renderKeychainStatus();
    alert(t("paired_keychain_success"));
  } catch (_) {
    setKeychainStatusText(t("keychain_pair_failed"), "error");
    alert(t("pair_bluetooth_failed"));
  }
}

async function startDeviceSOSListener() {
  if (!pairedBluetoothDevice || !pairedBluetoothDevice.gatt) {
    alert(t("no_connected_device"));
    return;
  }

  try {
    if (!pairedBluetoothDevice.gatt.connected) {
      bluetoothServer = await pairedBluetoothDevice.gatt.connect();
    }

    setKeychainStatusText(t("keychain_connecting"), "warning");

    const sosServiceUuid = "0000ffe0-0000-1000-8000-00805f9b34fb";
    const sosCharacteristicUuid = "0000ffe1-0000-1000-8000-00805f9b34fb";

    const service = await bluetoothServer.getPrimaryService(sosServiceUuid);
    sosCharacteristic = await service.getCharacteristic(sosCharacteristicUuid);

    await sosCharacteristic.startNotifications();
    sosCharacteristic.addEventListener("characteristicvaluechanged", handleDeviceSOSPressed);

    isDeviceSOSListenerActive = true;
    setKeychainStatusText(t("keychain_listener_active"), "ok");
    renderKeychainStatus();
    alert(t("keychain_listener_success"));
  } catch (_) {
    setKeychainStatusText(t("keychain_listener_failed"), "error");
    alert(t("keychain_listener_failed"));
  }
}

async function stopDeviceSOSListener() {
  try {
    if (sosCharacteristic) {
      await sosCharacteristic.stopNotifications();
      sosCharacteristic.removeEventListener("characteristicvaluechanged", handleDeviceSOSPressed);
    }

    sosCharacteristic = null;
    isDeviceSOSListenerActive = false;
    setKeychainStatusText(t("keychain_listener_inactive"), "warning");
    renderKeychainStatus();
    alert(t("keychain_listener_stopped"));
  } catch (_) {
    setKeychainStatusText(t("keychain_listener_failed"), "error");
    alert(t("keychain_listener_failed"));
  }
}

function handleDeviceSOSPressed(event) {
  try {
    const value = event.target.value;
    const pressed = value.getUint8(0) === 1;

    if (pressed) {
      setKeychainStatusText(t("keychain_button_pressed"), "ok");
      sendSOS();
    }
  } catch (_) {
    setKeychainStatusText(t("keychain_listener_failed"), "error");
  }
}

function handleBluetoothDisconnection() {
  sosCharacteristic = null;
  isDeviceSOSListenerActive = false;
  setKeychainStatusText(t("keychain_disconnected"), "error");
  renderKeychainStatus();
  tryAutoReconnect();
}

async function tryAutoReconnect() {
  if (!pairedBluetoothDevice) return;

  setKeychainStatusText(t("keychain_reconnecting"), "warning");

  for (let attempt = 1; attempt <= 3; attempt++) {
    try {
      bluetoothServer = await pairedBluetoothDevice.gatt.connect();
      setKeychainStatusText(t("keychain_reconnected"), "ok");
      renderKeychainStatus();
      return;
    } catch (_) {
      await new Promise((resolve) => setTimeout(resolve, 1500));
    }
  }

  setKeychainStatusText(t("keychain_reconnect_failed"), "error");
}

function disconnectBluetoothDevice() {
  if (sosCharacteristic) {
    try {
      sosCharacteristic.removeEventListener("characteristicvaluechanged", handleDeviceSOSPressed);
    } catch (_) {}
  }

  sosCharacteristic = null;
  isDeviceSOSListenerActive = false;

  if (pairedBluetoothDevice && pairedBluetoothDevice.gatt && pairedBluetoothDevice.gatt.connected) {
    pairedBluetoothDevice.gatt.disconnect();
  }

  pairedBluetoothDevice = null;
  bluetoothServer = null;

  setKeychainStatusText(t("keychain_disconnected"), "error");
  renderKeychainStatus();
}

function renderKeychainStatus() {
  const devicePreview = document.getElementById("devicePreview");
  if (!devicePreview) return;

  if (!pairedBluetoothDevice) {
    devicePreview.innerHTML = `<div class="empty-box">${t("empty_keychain")}</div>`;
    return;
  }

  const deviceName = pairedBluetoothDevice.name || "Bluetooth";
  const connectionStatus =
    pairedBluetoothDevice.gatt && pairedBluetoothDevice.gatt.connected
      ? t("keychain_connected")
      : t("keychain_disconnected");

  const listenerStatus = isDeviceSOSListenerActive
    ? t("keychain_listener_active")
    : t("keychain_listener_inactive");

  devicePreview.innerHTML = `
    <div class="profile-item">
      <strong>${t("bluetooth_title")}</strong>
      <span>${deviceName}</span>
    </div>
    <div class="profile-item">
      <strong>${t("device_status_placeholder")}</strong>
      <span>${connectionStatus}</span>
    </div>
    <div class="profile-item">
      <strong>${t("activate_keychain_sos")}</strong>
      <span>${listenerStatus}</span>
    </div>
  `;
}

function renderSupportPoints() {
  const supportPointsList = document.getElementById("supportPointsList");
  if (!supportPointsList) return;

  if (supportPoints.length === 0) {
    supportPointsList.innerHTML = `<div class="empty-box">${t("empty_support")}</div>`;
    return;
  }

  supportPointsList.innerHTML = supportPoints
    .map(
      (point) => `
        <div class="support-item">
          <strong>${point.nome_local}</strong>
          <span>${t("support_service_type")}: ${point.tipo_servico}</span>
          <span>${t("support_address")}: ${point.endereco_completo}</span>
          <span>${t("support_phone")}: ${point.telefone_local}</span>
          <span>${t("support_latitude")}: ${point.latitude}</span>
          <span>${t("support_longitude")}: ${point.longitude}</span>
        </div>
      `
    )
    .join("");
}

function requestNotificationPermission() {
  if (!("Notification" in window)) return;
  if (Notification.permission === "default") Notification.requestPermission();
}

function showEmergencyNotification(message) {
  if (!("Notification" in window)) return;

  if (Notification.permission === "granted") {
    new Notification(t("alert_emergency_activated"), {
      body: message,
      icon: "https://cdn-icons-png.flaticon.com/512/564/564619.png"
    });
  }
}

function playAlertSound() {
  const alertSound = document.getElementById("alertSound");
  if (alertSound) {
    alertSound.currentTime = 0;
    alertSound.play().catch(() => {});
  }
}

function getLocation() {
  if (!navigator.geolocation) {
    alert(t("geolocation_unsupported"));
    return;
  }

  navigator.geolocation.getCurrentPosition(
    (position) => {
      const lat = position.coords.latitude;
      const lng = position.coords.longitude;

      currentLocation = { lat, lng };

      document.getElementById("locationText").textContent = `${lat.toFixed(5)}, ${lng.toFixed(5)}`;

      document.getElementById("mapContainer").innerHTML = `
        <iframe
          class="map-frame"
          src="https://maps.google.com/maps?q=${lat},${lng}&z=16&output=embed"
          allowfullscreen
          loading="lazy">
        </iframe>
      `;

      const navItems = document.querySelectorAll(".nav-item");
      if (navItems[2]) scrollToSection("mapa", navItems[2]);
    },
    () => {
      alert(t("geolocation_failed"));
    }
  );
}

function openInGoogleMaps() {
  if (!currentLocation) {
    alert(t("get_location_first"));
    return;
  }

  const { lat, lng } = currentLocation;
  window.open(`https://www.google.com/maps?q=${lat},${lng}`, "_blank");
}

function getSelectedEmergencyTypeLabel() {
  return t(emergencyTypeLabelMap[selectedEmergencyType] || "emergency_medical");
}

function buildSOSMessage(lat, lng) {
  const mapsLink = `https://www.google.com/maps?q=${lat},${lng}`;

  return `SOS!
${t("sos_message_type")}: ${getSelectedEmergencyTypeLabel()}
${t("sos_message_help")}
${t("sos_message_location")}: ${mapsLink}`;
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
    alertsList.innerHTML = `<div class="empty-box">${t("empty_alerts")}</div>`;
    return;
  }

  alertsList.innerHTML = alertRecords
    .map(
      (alert) => `
        <div class="alert-item">
          <strong>Alerta #${alert.ID_Alerta}</strong>
          <span>${t("alert_user")}: ${alert.ID_Usuario ?? "-"}</span>
          <span>${t("alert_datetime")}: ${alert.data_hora}</span>
          <span>${t("alert_latitude")}: ${alert.latitude}</span>
          <span>${t("alert_longitude")}: ${alert.longitude}</span>
          <span>${t("alert_send_mode")}: ${alert.modo_envio}</span>
          <span>${t("alert_status")}: ${alert.status_resolvido ? t("resolved") : t("pending")}</span>
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
    const phoneWithCountry = cleanPhone.startsWith("55") ? cleanPhone : `55${cleanPhone}`;

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
    alert(t("need_emergency_contact"));
    return;
  }

  if (!navigator.geolocation) {
    alert(t("geolocation_unsupported"));
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
      showEmergencyNotification(`${t("alert_sos_sent_type")} ${getSelectedEmergencyTypeLabel()}`);
      saveAlertRecord(lat, lng, "WhatsApp / navegador");
      sendToPriorityContacts(message);

      alert(t("emergency_activated_message"));
    },
    () => {
      alert(t("sos_location_failed"));
    }
  );
}

function initializeAccessibility() {
  document.getElementById("languageSelector").value = currentLanguage;
  document.documentElement.style.fontSize = fontScale + "rem";
  setInitialFontButton();
  applyTranslations();
}

requestNotificationPermission();
initializeAccessibility();
renderEmergencyContacts();
renderUserProfile();
renderAlertRecords();
renderSupportPoints();
renderKeychainStatus();
restoreSelectedEmergencyType();