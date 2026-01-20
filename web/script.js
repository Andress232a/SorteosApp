// Configuración
// Detectar si estamos en producción (Vercel) o desarrollo local
const isProduction = window.location.hostname.includes('vercel.app') || window.location.hostname.includes('railway.app') || window.location.hostname.includes('render.com');
const API_URL = isProduction 
    ? window.location.origin + '/api'  // En producción, usar la misma URL sin puerto
    : window.location.origin.replace(/:\d+$/, ':3001') + '/api';  // En desarrollo, usar puerto 3001
let currentFilter = 'todos';
let currentUser = null;
let socket = null;
let authToken = null;

// Autenticación
function getAuthToken() {
    return localStorage.getItem('token');
}

function setAuthToken(token) {
    authToken = token;
    if (token) {
        localStorage.setItem('token', token);
    } else {
        localStorage.removeItem('token');
    }
}

async function checkAuth() {
    const token = getAuthToken();
    if (!token) {
        updateUIForGuest();
        return;
    }

    try {
        const response = await fetch(`${API_URL}/auth/verify`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (response.ok) {
            const data = await response.json();
            currentUser = data.user;
            authToken = token;
            updateUIForUser(currentUser);
            if (socket) {
                socket.emit('authenticate', { token, userId: currentUser.id, rol: currentUser.rol });
            }
        } else {
            setAuthToken(null);
            currentUser = null;
            updateUIForGuest();
        }
    } catch (error) {
        console.error('Error al verificar autenticación:', error);
        setAuthToken(null);
        currentUser = null;
        updateUIForGuest();
    }
}

async function login(email, password) {
    try {
        const response = await fetch(`${API_URL}/auth/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ email, password })
        });

        const data = await response.json();

        if (response.ok) {
            setAuthToken(data.token);
            currentUser = data.user;
            updateUIForUser(currentUser);
            closeLoginModal();
            
            // Reconectar socket con autenticación
            if (socket) {
                socket.disconnect();
            }
            initSocket();
            
            return true;
        } else {
            showLoginError(data.error || 'Error al iniciar sesión');
            return false;
        }
    } catch (error) {
        console.error('Error en login:', error);
        showLoginError('Error de conexión. Por favor, intenta de nuevo.');
        return false;
    }
}

function logout() {
    setAuthToken(null);
    currentUser = null;
    updateUIForGuest();
    if (socket) {
        socket.disconnect();
    }
    initSocket();
}

function updateUIForUser(user) {
    const userInfo = document.getElementById('userInfo');
    const userNameDisplay = document.getElementById('userNameDisplay');
    const loginBtn = document.getElementById('loginBtn');
    const ganadoresBtn = document.getElementById('ganadoresBtn');
    
    if (userInfo && userNameDisplay) {
        userNameDisplay.textContent = user.nombre;
        if (user.rol === 'admin') {
            userNameDisplay.innerHTML = `<i class="fas fa-crown"></i> ${user.nombre} (Admin)`;
            userNameDisplay.classList.add('admin-badge');
            if (ganadoresBtn) {
                ganadoresBtn.style.display = 'flex';
            }
        } else {
            if (ganadoresBtn) {
                ganadoresBtn.style.display = 'none';
            }
        }
        userInfo.style.display = 'flex';
    }
    
    if (loginBtn) {
        loginBtn.style.display = 'none';
    }
}

function updateUIForGuest() {
    const userInfo = document.getElementById('userInfo');
    const loginBtn = document.getElementById('loginBtn');
    const ganadoresBtn = document.getElementById('ganadoresBtn');
    
    if (userInfo) {
        userInfo.style.display = 'none';
    }
    
    if (loginBtn) {
        loginBtn.style.display = 'flex';
    }
    
    if (ganadoresBtn) {
        ganadoresBtn.style.display = 'none';
    }
}

// Modal de login
function openLoginModal() {
    const modal = document.getElementById('loginModal');
    if (modal) {
        modal.classList.add('active');
    }
}

function closeLoginModal() {
    const modal = document.getElementById('loginModal');
    if (modal) {
        modal.classList.remove('active');
        const form = document.getElementById('loginForm');
        if (form) {
            form.reset();
        }
        const errorDiv = document.getElementById('loginError');
        if (errorDiv) {
            errorDiv.style.display = 'none';
        }
    }
}

function showLoginError(message) {
    const errorDiv = document.getElementById('loginError');
    if (errorDiv) {
        errorDiv.textContent = message;
        errorDiv.style.display = 'block';
    }
}

// Modal de registro
function openRegisterModal() {
    const modal = document.getElementById('registerModal');
    if (modal) {
        modal.classList.add('active');
    }
}

function closeRegisterModal() {
    const modal = document.getElementById('registerModal');
    if (modal) {
        modal.classList.remove('active');
        const form = document.getElementById('registerForm');
        if (form) {
            form.reset();
        }
        const errorDiv = document.getElementById('registerError');
        if (errorDiv) {
            errorDiv.style.display = 'none';
        }
    }
}

function showRegisterError(message) {
    const errorDiv = document.getElementById('registerError');
    if (errorDiv) {
        errorDiv.textContent = message;
        errorDiv.style.display = 'block';
    }
}

async function register(nombre, email, password, telefono) {
    try {
        const response = await fetch(`${API_URL}/auth/register`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ nombre, email, password, telefono: telefono || null })
        });

        const data = await response.json();

        if (response.ok) {
            setAuthToken(data.token);
            currentUser = data.user;
            updateUIForUser(currentUser);
            closeRegisterModal();
            
            // Reconectar socket con autenticación
            if (socket) {
                socket.disconnect();
            }
            initSocket();
            
            // Mostrar mensaje de éxito
            alert('¡Registro exitoso! Bienvenido a PremioClick');
            
            return true;
        } else {
            // Manejar errores de validación
            if (data.errors && Array.isArray(data.errors)) {
                const errorMessages = data.errors.map(err => err.msg).join(', ');
                showRegisterError(errorMessages);
            } else {
                showRegisterError(data.error || 'Error al registrarse');
            }
            return false;
        }
    } catch (error) {
        console.error('Error en registro:', error);
        showRegisterError('Error de conexión. Por favor, intenta de nuevo.');
        return false;
    }
}

// Inicializar Socket.io
function initSocket() {
    const token = getAuthToken();
    const socketUrl = isProduction 
        ? window.location.origin
        : window.location.origin.replace(/:\d+$/, ':3001');
    
    socket = io(socketUrl, {
        auth: token ? { token } : {}
    });

    socket.on('connect', () => {
        console.log('Conectado al servidor de chat');
        if (token && currentUser) {
            socket.emit('authenticate', { 
                token, 
                userId: currentUser.id, 
                rol: currentUser.rol 
            });
        }
    });

    socket.on('chat-message', (data) => {
        addMessage(data.user, data.message, data.isAdmin, data.timestamp);
    });

    socket.on('user-count', (count) => {
        updateChatBadge(count);
    });

    socket.on('disconnect', () => {
        console.log('Desconectado del servidor');
    });
}

// Cargar sorteos
async function loadSorteos(filter = 'todos') {
    const grid = document.getElementById('sorteosGrid');
    grid.innerHTML = '<div class="loading"><i class="fas fa-spinner fa-spin"></i><p>Cargando sorteos...</p></div>';

    try {
        const response = await fetch(`${API_URL}/sorteos`);
        const sorteos = await response.json();
        
        console.log('🔍 Sorteos recibidos del backend:', sorteos.length);
        if (sorteos.length > 0) {
            console.log('🔍 Primer sorteo completo:', sorteos[0]);
            console.log('🔍 Primer sorteo - imagen_portada:', sorteos[0].imagen_portada);
            console.log('🔍 Primer sorteo - tiene imagen_portada?', !!sorteos[0].imagen_portada);
        }

        let filteredSorteos = sorteos;
        if (filter === 'activo') {
            filteredSorteos = sorteos.filter(s => s.estado === 'activo');
        } else if (filter === 'finalizado') {
            filteredSorteos = sorteos.filter(s => s.estado === 'finalizado');
        }

        if (filteredSorteos.length === 0) {
            grid.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-inbox"></i>
                    <h3>No hay sorteos disponibles</h3>
                    <p>Vuelve pronto para ver nuevos sorteos</p>
                </div>
            `;
            return;
        }

        grid.innerHTML = filteredSorteos.map(sorteo => createSorteoCard(sorteo)).join('');
    } catch (error) {
        console.error('Error al cargar sorteos:', error);
        grid.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-exclamation-triangle"></i>
                <h3>Error al cargar sorteos</h3>
                <p>Por favor, intenta de nuevo más tarde</p>
            </div>
        `;
    }
}

// Crear tarjeta de sorteo
function createSorteoCard(sorteo) {
    console.log('🔍 Creando tarjeta para sorteo:', sorteo.titulo);
    console.log('🔍 imagen_portada:', sorteo.imagen_portada);
    
    const fecha = new Date(sorteo.fecha_sorteo);
    const fechaFormateada = fecha.toLocaleDateString('es-ES', { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });

    const badgeClass = sorteo.estado === 'activo' ? 'badge-activo' : 'badge-finalizado';
    const badgeText = sorteo.estado === 'activo' ? 'Activo' : 'Finalizado';

    return `
        <div class="sorteo-card" onclick="verDetalleSorteo(${sorteo.id})">
            <div class="sorteo-image">
                ${sorteo.imagen_portada ? 
                    `<img src="${sorteo.imagen_portada}" alt="${sorteo.titulo}" onerror="console.error('Error al cargar imagen_portada:', this.src); this.src='logo.png'; this.className='sorteo-logo';">` : 
                    `<img src="logo.png" alt="PremioClick" class="sorteo-logo">`
                }
            </div>
            <div class="sorteo-content">
                <div class="sorteo-header">
                    <h3 class="sorteo-title">${sorteo.titulo}</h3>
                    <span class="sorteo-badge ${badgeClass}">${badgeText}</span>
                </div>
                <p class="sorteo-description">${sorteo.descripcion || 'Sin descripción'}</p>
                <div class="sorteo-info">
                    <div class="info-item">
                        <i class="fas fa-calendar"></i>
                        <span>${fechaFormateada}</span>
                    </div>
                    <div class="info-item">
                        <i class="fas fa-gift"></i>
                        <span>${sorteo.productos?.length || 0} premios</span>
                    </div>
                </div>
                <div class="sorteo-stats">
                    <div class="stat">
                        <div class="stat-number">${sorteo.estadisticas?.tickets_vendidos || 0}</div>
                        <div class="stat-label">Vendidos</div>
                    </div>
                    <div class="stat">
                        <div class="stat-number">${sorteo.productos?.length || 0}</div>
                        <div class="stat-label">Premios</div>
                    </div>
                </div>
            </div>
        </div>
    `;
}

// Chat functions
function toggleChat() {
    const modal = document.getElementById('chatModal');
    modal.classList.toggle('active');
}

function closeChat() {
    const modal = document.getElementById('chatModal');
    modal.classList.remove('active');
}

function addMessage(user, message, isAdmin, timestamp) {
    const messagesContainer = document.getElementById('chatMessages');
    const welcomeMessage = messagesContainer.querySelector('.welcome-message');
    if (welcomeMessage) {
        welcomeMessage.remove();
    }

    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${isAdmin ? 'admin' : 'user'}`;
    
    const time = timestamp ? new Date(timestamp).toLocaleTimeString('es-ES', { 
        hour: '2-digit', 
        minute: '2-digit' 
    }) : new Date().toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });

    messageDiv.innerHTML = `
        <div class="message-header">${isAdmin ? '👑 Admin' : user}</div>
        <div>${message}</div>
        <div class="message-time">${time}</div>
    `;

    messagesContainer.appendChild(messageDiv);
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
}

function sendMessage() {
    const input = document.getElementById('chatInput');
    
    if (!currentUser) {
        openLoginModal();
        return;
    }

    if (input.value.trim() && socket) {
        socket.emit('chat-message', {
            message: input.value.trim()
        });
        input.value = '';
    }
}

function updateChatBadge(count) {
    const badge = document.getElementById('chatBadge');
    if (count > 0) {
        badge.textContent = count;
        badge.style.display = 'flex';
    } else {
        badge.style.display = 'none';
    }
}

// Ver detalle del sorteo
function verDetalleSorteo(sorteoId) {
    window.location.href = `detalle-sorteo.html?id=${sorteoId}`;
}

// Event Listeners
document.addEventListener('DOMContentLoaded', () => {
    // Verificar autenticación al cargar
    checkAuth();

    // Cargar sorteos
    loadSorteos();

    // Filtros
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            currentFilter = btn.dataset.filter;
            loadSorteos(currentFilter);
        });
    });

    // Login
    document.getElementById('loginBtn')?.addEventListener('click', openLoginModal);
    document.getElementById('closeLoginModal')?.addEventListener('click', closeLoginModal);
    document.getElementById('logoutBtn')?.addEventListener('click', logout);
    
    // Escoger Ganadores
    document.getElementById('ganadoresBtn')?.addEventListener('click', () => {
        window.location.href = 'escoger-ganadores.html';
    });
    
    // Cerrar modal al hacer clic fuera
    document.getElementById('loginModal')?.addEventListener('click', (e) => {
        if (e.target.id === 'loginModal') {
            closeLoginModal();
        }
    });

    // Formulario de login
    document.getElementById('loginForm')?.addEventListener('submit', async (e) => {
        e.preventDefault();
        const submitBtn = document.getElementById('loginSubmitBtn');
        const originalText = submitBtn.innerHTML;
        
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> <span>Iniciando sesión...</span>';
        
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        
        await login(email, password);
        
        submitBtn.disabled = false;
        submitBtn.innerHTML = originalText;
    });

    // Cambiar de login a registro
    document.getElementById('switchToRegister')?.addEventListener('click', (e) => {
        e.preventDefault();
        closeLoginModal();
        setTimeout(() => openRegisterModal(), 200);
    });

    // Cambiar de registro a login
    document.getElementById('switchToLogin')?.addEventListener('click', (e) => {
        e.preventDefault();
        closeRegisterModal();
        setTimeout(() => openLoginModal(), 200);
    });

    // Cerrar modal de registro
    document.getElementById('closeRegisterModal')?.addEventListener('click', closeRegisterModal);
    
    // Cerrar modal de registro al hacer clic fuera
    document.getElementById('registerModal')?.addEventListener('click', (e) => {
        if (e.target.id === 'registerModal') {
            closeRegisterModal();
        }
    });

    // Formulario de registro
    document.getElementById('registerForm')?.addEventListener('submit', async (e) => {
        e.preventDefault();
        const submitBtn = document.getElementById('registerSubmitBtn');
        const originalText = submitBtn.innerHTML;
        
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> <span>Registrando...</span>';
        
        const nombre = document.getElementById('registerNombre').value;
        const email = document.getElementById('registerEmail').value;
        const password = document.getElementById('registerPassword').value;
        const telefono = document.getElementById('registerTelefono').value;
        
        await register(nombre, email, password, telefono);
        
        submitBtn.disabled = false;
        submitBtn.innerHTML = originalText;
    });

    // Chat toggle
    document.getElementById('chatToggle')?.addEventListener('click', toggleChat);
    document.getElementById('closeChat')?.addEventListener('click', closeChat);

    // Send message
    document.getElementById('sendBtn')?.addEventListener('click', sendMessage);
    document.getElementById('chatInput')?.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            sendMessage();
        }
    });

    // Inicializar socket
    initSocket();
});
