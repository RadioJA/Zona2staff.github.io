// Función para verificar si hay una sesión activa
function checkSession() {
    const currentUser = sessionStorage.getItem('currentUser');
    if (!currentUser) {
        window.location.href = '../index_Login.html';
        return false;
    }
    return JSON.parse(currentUser);
}

// Función para cerrar sesión
function logout() {
    sessionStorage.removeItem('currentUser');
    window.location.href = '../index_Login.html';
}

// Función para mostrar elementos según el rol
function setupUI() {
    const user = checkSession();
    if (!user) return;

    // Mostrar el nombre de usuario
    const userInfoElement = document.getElementById('userInfo');
    if (userInfoElement) {
        userInfoElement.textContent = `Usuario: ${user.username}`;
    }

    // Mostrar/ocultar elementos según el rol
    if (user.role === 'admin') {
        const adminElements = document.querySelectorAll('.admin-only');
        adminElements.forEach(el => {
            el.style.display = 'inline-block';
            if (el.classList.contains('btn')) {
                el.style.marginLeft = '5px';
            }
        });
    } else {
        const adminElements = document.querySelectorAll('.admin-only');
        adminElements.forEach(el => el.style.display = 'none');
    }

    // Configurar temporizador de sesión (30 minutos)
    setupSessionTimer();
}

// Función para configurar el temporizador de sesión
function setupSessionTimer() {
    let inactivityTime = 0;
    const maxInactivityTime = 30 * 60 * 1000; // 30 minutos

    function resetTimer() {
        inactivityTime = 0;
    }

    setInterval(() => {
        inactivityTime += 1000;
        if (inactivityTime >= maxInactivityTime) {
            logout();
        }
    }, 1000);

    // Resetear el temporizador en cualquier actividad del usuario
    ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart'].forEach(
        event => document.addEventListener(event, resetTimer, true)
    );
}

// Inicializar la UI cuando el documento esté listo
document.addEventListener('DOMContentLoaded', setupUI);