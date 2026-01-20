// Configuración
const isProduction = window.location.hostname.includes('vercel.app') || window.location.hostname.includes('railway.app') || window.location.hostname.includes('render.com');
const API_URL = isProduction 
    ? window.location.origin + '/api'
    : window.location.origin.replace(/:\d+$/, ':3001') + '/api';
let sorteo = null;
let imagenes = [];
let imagenActual = 0;
let currentUser = null;
let authToken = null;

// Autenticación
function getAuthToken() {
    return localStorage.getItem('token');
}

async function checkAuth() {
    const token = getAuthToken();
    if (!token) {
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
        }
    } catch (error) {
        console.error('Error al verificar autenticación:', error);
    }
}

// Obtener ID del sorteo de la URL
function getSorteoId() {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get('id');
}

// Cargar sorteo
async function loadSorteo() {
    const sorteoId = getSorteoId();
    
    if (!sorteoId) {
        document.getElementById('loadingContainer').innerHTML = `
            <i class="fas fa-exclamation-triangle"></i>
            <p>ID de sorteo no válido</p>
        `;
        return;
    }

    try {
        const response = await fetch(`${API_URL}/sorteos/${sorteoId}`);
        
        if (!response.ok) {
            throw new Error('Sorteo no encontrado');
        }
        
        sorteo = await response.json();
        
        // Parsear imágenes
        if (sorteo.imagenes) {
            try {
                if (typeof sorteo.imagenes === 'string') {
                    imagenes = JSON.parse(sorteo.imagenes);
                } else if (Array.isArray(sorteo.imagenes)) {
                    imagenes = sorteo.imagenes;
                } else {
                    imagenes = [];
                }
            } catch (e) {
                console.error('Error al parsear imágenes:', e);
                imagenes = [];
            }
        } else {
            imagenes = [];
        }
        
        mostrarSorteo();
    } catch (error) {
        console.error('Error al cargar sorteo:', error);
        document.getElementById('loadingContainer').innerHTML = `
            <i class="fas fa-exclamation-triangle"></i>
            <p>Error al cargar el sorteo</p>
        `;
    }
}

function mostrarSorteo() {
    // Ocultar loading
    document.getElementById('loadingContainer').style.display = 'none';
    document.getElementById('sorteoContainer').style.display = 'block';
    
    // Imagen de portada
    const portadaContainer = document.getElementById('sorteoPortada');
    if (sorteo.imagen_portada) {
        portadaContainer.innerHTML = `<img src="${sorteo.imagen_portada}" alt="Portada ${sorteo.titulo}" class="sorteo-portada-image">`;
        portadaContainer.style.display = 'block';
    } else {
        portadaContainer.style.display = 'none';
    }
    
    // Título y badge
    document.getElementById('sorteoTitulo').textContent = sorteo.titulo;
    const badge = document.getElementById('sorteoBadge');
    badge.textContent = sorteo.estado;
    badge.className = `sorteo-badge-detalle ${sorteo.estado === 'activo' ? 'badge-activo' : 'badge-finalizado'}`;
    
    // Descripción
    document.getElementById('sorteoDescripcion').textContent = sorteo.descripcion || 'Sin descripción';
    
    // Fecha
    const fecha = new Date(sorteo.fecha_sorteo);
    document.getElementById('sorteoFecha').textContent = fecha.toLocaleDateString('es-ES', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
    
    // Premios
    const productosCount = sorteo.productos?.length || 0;
    document.getElementById('sorteoPremios').textContent = `${productosCount} premio${productosCount !== 1 ? 's' : ''}`;
    
    // Tickets - Solo mostrar si es admin
    const ticketsInfo = document.getElementById('sorteoTickets');
    if (currentUser && currentUser.rol === 'admin') {
        const ticketsVendidos = sorteo.estadisticas?.tickets_vendidos || 0;
        ticketsInfo.textContent = `${ticketsVendidos} vendidos`;
        ticketsInfo.parentElement.style.display = 'flex';
    } else {
        // Ocultar la información de tickets vendidos para clientes
        ticketsInfo.parentElement.style.display = 'none';
    }
    
    // Mostrar galería si hay imágenes
    if (imagenes.length > 0) {
        mostrarGaleria();
    }
    
    // Mostrar productos si hay
    if (sorteo.productos && sorteo.productos.length > 0) {
        mostrarProductos();
    }
    
    // Mostrar ganadores si el sorteo está finalizado
    if (sorteo.estado === 'finalizado' && sorteo.ganadores && sorteo.ganadores.length > 0) {
        mostrarGanadores();
    }
}

function mostrarGaleria() {
    const galeriaContainer = document.getElementById('galeriaContainer');
    const galeriaGrid = document.getElementById('galeriaGrid');
    
    galeriaGrid.innerHTML = imagenes.map((imagen, index) => `
        <div class="galeria-item" onclick="abrirImagen(${index})">
            <img src="${imagen}" alt="Imagen ${index + 1}">
            <div class="galeria-item-overlay">
                <i class="fas fa-search-plus"></i>
            </div>
        </div>
    `).join('');
    
    galeriaContainer.style.display = 'block';
}

function mostrarProductos() {
    const productosSection = document.getElementById('productosSection');
    const productosGrid = document.getElementById('productosGrid');
    
    productosGrid.innerHTML = sorteo.productos.map(producto => `
        <div class="producto-card">
            <span class="producto-posicion">${producto.posicion_premio}° Lugar</span>
            <h3 class="producto-nombre">${producto.nombre}</h3>
            ${producto.descripcion ? `<p class="producto-descripcion">${producto.descripcion}</p>` : ''}
        </div>
    `).join('');
    
    productosSection.style.display = 'block';
}

function mostrarGanadores() {
    const ganadoresSection = document.getElementById('ganadoresSection');
    const ganadoresContainer = document.getElementById('ganadoresContainer');
    
    // Agrupar ganadores por premio
    const ganadoresPorPremio = {};
    sorteo.ganadores.forEach(ganador => {
        const key = `${ganador.producto_id}_${ganador.posicion_premio}`;
        if (!ganadoresPorPremio[key]) {
            ganadoresPorPremio[key] = {
                producto_nombre: ganador.producto_nombre,
                posicion_premio: ganador.posicion_premio,
                numeros: []
            };
        }
        ganadoresPorPremio[key].numeros.push({
            numero: ganador.numero_ticket,
            nombre: ganador.ganador_nombre || 'Sin asignar',
            email: ganador.ganador_email || null
        });
    });
    
    // Verificar si el usuario tiene tickets ganadores
    if (currentUser) {
        const userTicketsGanadores = sorteo.ganadores.filter(g => 
            g.ganador_email === currentUser.email
        );
        
        if (userTicketsGanadores.length > 0) {
            mostrarMensajeGanador(userTicketsGanadores);
        }
    }
    
    // Crear HTML para cada premio y sus números ganadores
    ganadoresContainer.innerHTML = Object.values(ganadoresPorPremio).map(premio => {
        const numerosHTML = premio.numeros.map(num => `
            <div class="ganador-card">
                <div class="ganador-header">
                    <span class="ganador-posicion">${premio.posicion_premio}° Lugar</span>
                </div>
                <div class="ganador-numero">#${num.numero}</div>
                <div class="ganador-premio">${premio.producto_nombre}</div>
                ${num.nombre !== 'Sin asignar' ? `<div class="ganador-nombre">Ganador: ${num.nombre}</div>` : ''}
            </div>
        `).join('');
        
        return numerosHTML;
    }).join('');
    
    ganadoresSection.style.display = 'block';
}

function mostrarMensajeGanador(ganadores) {
    const ganadoresContainer = document.getElementById('ganadoresContainer');
    
    if (ganadores.length > 0) {
        const mensajeDiv = document.createElement('div');
        mensajeDiv.className = 'ganador-mensaje';
        mensajeDiv.style.gridColumn = '1 / -1';
        mensajeDiv.style.background = 'linear-gradient(135deg, #ffc107 0%, #ff9800 100%)';
        mensajeDiv.style.color = 'var(--white)';
        mensajeDiv.style.border = '3px solid #ffc107';
        mensajeDiv.style.display = 'flex';
        mensajeDiv.style.alignItems = 'center';
        mensajeDiv.style.justifyContent = 'center';
        mensajeDiv.style.gap = '1rem';
        mensajeDiv.innerHTML = `
            <i class="fas fa-trophy" style="font-size: 2.5rem;"></i>
            <div style="text-align: center;">
                <strong style="font-size: 1.3rem; display: block; margin-bottom: 8px;">¡Felicitaciones! ¡Eres Ganador!</strong>
                <p style="margin: 0; font-size: 1.1rem;">Tienes ${ganadores.length} ticket${ganadores.length > 1 ? 's' : ''} ganador${ganadores.length > 1 ? 'es' : ''}: ${ganadores.map(g => `#${g.numero_ticket}`).join(', ')}</p>
            </div>
        `;
        ganadoresContainer.insertBefore(mensajeDiv, ganadoresContainer.firstChild);
    }
}

function abrirImagen(index) {
    imagenActual = index;
    mostrarImagenModal();
}

function mostrarImagenModal() {
    const modal = document.getElementById('imagenModal');
    const img = document.getElementById('imagenModalImg');
    const counter = document.getElementById('imagenCounter');
    
    img.src = imagenes[imagenActual];
    counter.textContent = `${imagenActual + 1} / ${imagenes.length}`;
    
    modal.classList.add('active');
    
    // Actualizar botones de navegación
    document.getElementById('prevImagen').style.display = imagenActual > 0 ? 'block' : 'none';
    document.getElementById('nextImagen').style.display = imagenActual < imagenes.length - 1 ? 'block' : 'none';
}

function cerrarImagenModal() {
    document.getElementById('imagenModal').classList.remove('active');
}

function siguienteImagen() {
    if (imagenActual < imagenes.length - 1) {
        imagenActual++;
        mostrarImagenModal();
    }
}

function anteriorImagen() {
    if (imagenActual > 0) {
        imagenActual--;
        mostrarImagenModal();
    }
}

// Event Listeners
document.addEventListener('DOMContentLoaded', async () => {
    await checkAuth();
    loadSorteo();
    
    // Modal de imagen
    document.getElementById('closeImagenModal').addEventListener('click', cerrarImagenModal);
    document.getElementById('prevImagen').addEventListener('click', anteriorImagen);
    document.getElementById('nextImagen').addEventListener('click', siguienteImagen);
    
    // Cerrar modal con ESC
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            cerrarImagenModal();
        } else if (e.key === 'ArrowLeft') {
            anteriorImagen();
        } else if (e.key === 'ArrowRight') {
            siguienteImagen();
        }
    });
    
    // Cerrar modal al hacer clic fuera
    document.getElementById('imagenModal').addEventListener('click', (e) => {
        if (e.target.id === 'imagenModal') {
            cerrarImagenModal();
        }
    });
});

// Hacer funciones globales para onclick
window.abrirImagen = abrirImagen;

