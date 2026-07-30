const loginCard = document.getElementById('loginCard');
const adminCard = document.getElementById('adminCard');
const loginBtn = document.getElementById('loginBtn');
const logoutBtn = document.getElementById('logoutBtn');
const adminPasswordInput = document.getElementById('adminPassword');
const loginMessage = document.getElementById('loginMessage');
const adminMessage = document.getElementById('adminMessage');
const reservasCount = document.getElementById('reservasCount');
const reservasTable = document.getElementById('reservasTable');
const refreshBtn = document.getElementById('refreshBtn');
const filterEstado = document.getElementById('filterEstado');
const filterEstadoPago = document.getElementById('filterEstadoPago');
const filterEmail = document.getElementById('filterEmail');
const clearFiltersBtn = document.getElementById('clearFiltersBtn');
const calendarGrid = document.getElementById('calendarGrid');
const calendarMonthLabel = document.getElementById('calendarMonthLabel');
const prevMonthBtn = document.getElementById('prevMonthBtn');
const nextMonthBtn = document.getElementById('nextMonthBtn');
const calendarMessage = document.getElementById('calendarMessage');

const ADMIN_STORAGE_KEY = 'campo-malar-admin-password';
const API_BASE_URL = 'https://campomalar-backend.vercel.app';

const getAuthHeaders = () => {
    const password = localStorage.getItem(ADMIN_STORAGE_KEY);
    return {
        'Content-Type': 'application/json',
        'x-admin-password': password || ''
    };
};

const showMessage = (element, text, type = 'error') => {
    element.textContent = text;
    element.className = `message ${type}`;
    element.style.display = 'block';
};

const clearMessage = (element) => {
    element.textContent = '';
    element.style.display = 'none';
};

const setLoggedIn = () => {
    loginCard.style.display = 'none';
    adminCard.style.display = 'block';
    logoutBtn.style.display = 'inline-flex';
    clearMessage(loginMessage);
};

const setLoggedOut = () => {
    localStorage.removeItem(ADMIN_STORAGE_KEY);
    loginCard.style.display = 'block';
    adminCard.style.display = 'none';
    logoutBtn.style.display = 'none';
    clearMessage(adminMessage);
    reservasTable.innerHTML = '';
    reservasCount.textContent = 'Inicia sesión para ver las reservas';
};

const packDetails = {
    pack1: { nombre: 'Entrada General', base: 10000, detalles: ['Acceso completo', 'Senderos autoguiados', 'Información sobre flora y fauna', 'Horarios flexibles'] },
    pack2: { nombre: 'Entrada + Trekking', base: 15000, detalles: ['Acceso completo', 'Guía especializado', 'Zonas exclusivas', 'Equipo básico', 'Información del ecosistema'] },
    pack3: { nombre: 'Alojamiento', base: 1500, detalles: ['Camping o Casillas'] },
    pack4: { nombre: 'Guías Externos', base: 8000, detalles: ['Tarifa especial', 'Acceso preferencial', 'Descuentos adicionales', 'Coordinación local'] },
    pack5: { nombre: 'Socio Prestador', base: 10000, detalles: ['Cuota mensual', 'Ingreso sin cargo con grupos'] }
};

const buildFilterQuery = () => {
    const params = new URLSearchParams();
    if (filterEstado.value) params.append('estado', filterEstado.value);
    if (filterEstadoPago.value) params.append('estadoPago', filterEstadoPago.value);
    if (filterEmail.value.trim()) params.append('email', filterEmail.value.trim());
    return params.toString() ? `?${params.toString()}` : '';
};

let calendarDate = new Date();

const formatMonthLabel = (date) => {
    return date.toLocaleDateString('es-AR', { year: 'numeric', month: 'long' });
};

const pad = (value) => String(value).padStart(2, '0');

const fetchCalendarData = async () => {
    try {
        calendarMessage.style.display = 'none';
        const monthKey = `${calendarDate.getFullYear()}-${pad(calendarDate.getMonth() + 1)}`;
        const response = await fetch(`${API_BASE_URL}/api/admin/calendar-data?month=${monthKey}`, {
            headers: getAuthHeaders()
        });

        if (!response.ok) {
            const errorText = await response.text();
            if (response.status === 401) {
                setLoggedOut();
                showMessage(loginMessage, 'Contraseña incorrecta o sesión expirada.', 'error');
                return;
            }
            throw new Error(`Error al cargar datos del calendario (${response.status}): ${errorText}`);
        }

        const data = await response.json();
        renderCalendar(data.reservasPorFecha, data.bloqueadas);
    } catch (error) {
        console.error('Error fetching calendar data:', error);
        calendarMessage.textContent = error.message;
        calendarMessage.className = 'message error';
        calendarMessage.style.display = 'block';
    }
};

const renderCalendar = (reservasPorFecha = {}, bloqueadas = []) => {
    calendarMonthLabel.textContent = formatMonthLabel(calendarDate);
    calendarGrid.innerHTML = '';

    const weekDays = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
    weekDays.forEach((day) => {
        const label = document.createElement('div');
        label.className = 'calendar-day';
        label.style.fontWeight = '700';
        label.style.background = 'transparent';
        label.style.border = 'none';
        label.style.cursor = 'default';
        label.textContent = day;
        calendarGrid.appendChild(label);
    });

    const year = calendarDate.getFullYear();
    const month = calendarDate.getMonth();
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    for (let i = 0; i < firstDay; i++) {
        const emptyCell = document.createElement('div');
        emptyCell.className = 'calendar-day';
        emptyCell.style.opacity = '0';
        emptyCell.style.pointerEvents = 'none';
        calendarGrid.appendChild(emptyCell);
    }

    const todayKey = new Date().toISOString().split('T')[0];

    for (let day = 1; day <= daysInMonth; day++) {
        const dateKey = `${year}-${pad(month + 1)}-${pad(day)}`;
        const count = reservasPorFecha[dateKey] || 0;
        const blocked = bloqueadas.includes(dateKey);
        const cell = document.createElement('div');
        cell.className = 'calendar-day';
        if (blocked) cell.classList.add('blocked');
        else if (count > 0) cell.classList.add('reserved');
        if (dateKey === todayKey) cell.classList.add('today');

        cell.innerHTML = `
            <div class="day-number">${day}</div>
            ${count ? `<div class="day-badge">${count} reserva${count > 1 ? 's' : ''}</div>` : ''}
            ${blocked ? `<div class="day-blocked">BLOQUEADA</div>` : ''}
        `;
        cell.addEventListener('click', () => toggleBlockedDate(dateKey, blocked));
        calendarGrid.appendChild(cell);
    }
};

const toggleBlockedDate = async (fecha, currentlyBlocked) => {
    try {
        const method = currentlyBlocked ? 'DELETE' : 'POST';
        const url = currentlyBlocked ? `${API_BASE_URL}/api/admin/disabled-dates/${encodeURIComponent(fecha)}` : `${API_BASE_URL}/api/admin/disabled-dates`;
        const options = {
            method,
            headers: getAuthHeaders()
        };
        if (!currentlyBlocked) {
            options.headers['Content-Type'] = 'application/json';
            options.body = JSON.stringify({ fecha });
        }

        const response = await fetch(url, options);
        if (!response.ok) {
            if (response.status === 401) {
                setLoggedOut();
                showMessage(loginMessage, 'Contraseña incorrecta o sesión expirada.', 'error');
                return;
            }
            throw new Error('No se pudo actualizar la fecha bloqueada');
        }

        showMessage(adminMessage, currentlyBlocked ? 'Fecha desbloqueada.' : 'Fecha bloqueada.', 'success');
        fetchCalendarData();
    } catch (error) {
        console.error('Error toggling blocked date:', error);
        showMessage(adminMessage, error.message, 'error');
    }
};

const updateCalendar = () => {
    calendarMonthLabel.textContent = formatMonthLabel(calendarDate);
    fetchCalendarData();
};

prevMonthBtn.addEventListener('click', () => {
    calendarDate.setMonth(calendarDate.getMonth() - 1);
    updateCalendar();
});

nextMonthBtn.addEventListener('click', () => {
    calendarDate.setMonth(calendarDate.getMonth() + 1);
    updateCalendar();
});

const fetchAllAdminData = () => {
    fetchReservas();
    fetchCalendarData();
};

const fetchReservas = async () => {
    try {
        clearMessage(adminMessage);
        reservasCount.textContent = 'Cargando reservas...';
        const queryString = buildFilterQuery();
        console.log('Fetching /api/admin/reservas with headers:', getAuthHeaders(), queryString);
        const response = await fetch(`${API_BASE_URL}/api/admin/reservas${queryString}`, {
            headers: getAuthHeaders()
        });

        console.log('Response status:', response.status);
        if (!response.ok) {
            const errorText = await response.text();
            if (response.status === 401) {
                setLoggedOut();
                showMessage(loginMessage, 'Contraseña incorrecta o sesión expirada.', 'error');
                return;
            }
            throw new Error(`Error al cargar reservas (${response.status}): ${errorText}`);
        }

        const reservas = await response.json();
        console.log('Reservas recibidas:', reservas);
        reservasCount.textContent = `Total de reservas: ${reservas.length}`;
        renderReservas(reservas);
    } catch (error) {
        console.error('Error fetching reservas:', error);
        reservasCount.textContent = 'Error al cargar reservas';
        showMessage(adminMessage, error.message, 'error');
    }
};

const calcularPrecioDesglose = (reserva) => {
    const pack = packDetails[reserva.pack];
    const basePrice = pack ? pack.base : 0;
    const personasTotal = basePrice * reserva.personas;
    const pernocteTotal = reserva.pernocte ? (5000 * reserva.personas * (reserva.noches || 0)) : 0;
    return { personasTotal, pernocteTotal, total: personasTotal + pernocteTotal };
};

const renderReservas = (reservas) => {
    reservasTable.innerHTML = '';
    reservas.forEach((reserva) => {
        const row = document.createElement('tr');
        const fecha = new Date(reserva.fecha).toLocaleDateString('es-AR');
        const pack = packDetails[reserva.pack] || { nombre: reserva.pack };
        const precio = calcularPrecioDesglose(reserva);
        const pdfLink = reserva.formularioPDF && reserva.formularioPDF.rutaArchivo ?
            `<a class="download-link" href="/api/descargar-formulario/${reserva._id}" target="_blank" rel="noopener">Descargar</a>` :
            '<span style="color:#999;">No hay PDF</span>';

        const estadoLabel = {
            en_proceso: 'En proceso',
            confirmada: 'Confirmada',
            cancelada: 'Cancelada',
            completada: 'Completada'
        }[reserva.estado] || reserva.estado;

        const estadoPagoLabel = {
            pendiente: 'Pendiente',
            completado: 'Completado',
            rechazado: 'Rechazado',
            fallido: 'Fallido'
        }[reserva.estadoPago] || reserva.estadoPago;

        row.classList.add(`row-${reserva.estado}`);

        row.innerHTML = `
            <td>
                <strong>${reserva.nombre}</strong><br><small>${pack.nombre}</small>
            </td>
            <td>${reserva.email}</td>
            <td>${fecha}</td>
            <td>${reserva.personas} ${reserva.pernocte ? `(+${reserva.noches}n)` : ''}</td>
            <td>
                <small>Base: $${precio.personasTotal.toLocaleString()}</small><br>
                ${reserva.pernocte ? `<small>Pernocte: $${precio.pernocteTotal.toLocaleString()}</small><br>` : ''}
                <strong>$${precio.total.toLocaleString()}</strong>
            </td>
            <td>
                <select data-field="estadoPago" data-id="${reserva._id}">
                    <option value="pendiente" ${reserva.estadoPago === 'pendiente' ? 'selected' : ''}>pendiente</option>
                    <option value="completado" ${reserva.estadoPago === 'completado' ? 'selected' : ''}>completado</option>
                    <option value="rechazado" ${reserva.estadoPago === 'rechazado' ? 'selected' : ''}>rechazado</option>
                    <option value="fallido" ${reserva.estadoPago === 'fallido' ? 'selected' : ''}>fallido</option>
                </select>
                <div><span class="status-badge pago-${reserva.estadoPago}">${estadoPagoLabel}</span></div>
            </td>
            <td>
                <select data-field="estado" data-id="${reserva._id}">
                    <option value="en_proceso" ${reserva.estado === 'en_proceso' ? 'selected' : ''}>en_proceso</option>
                    <option value="confirmada" ${reserva.estado === 'confirmada' ? 'selected' : ''}>confirmada</option>
                    <option value="cancelada" ${reserva.estado === 'cancelada' ? 'selected' : ''}>cancelada</option>
                </select>
                <div><span class="status-badge estado-${reserva.estado}">${estadoLabel}</span></div>
            </td>
            <td>
                <strong>${pack.nombre}</strong><br>
                ${pack.detalles ? `<small>${pack.detalles.slice(0,2).join(', ')}</small>` : ''}
            </td>
            <td>${pdfLink}<br><span class="status-badge">${(reserva.formularioPDF && reserva.formularioPDF.estado) || 'pendiente'}</span></td>
            <td><textarea data-field="notas" data-id="${reserva._id}" placeholder="Notas internas...">${reserva.notas || ''}</textarea></td>
            <td><button class="save-button" data-id="${reserva._id}">${reserva.estado === 'confirmada' ? 'Guardar' : 'Confirmar'}</button></td>
        `;

        reservasTable.appendChild(row);
    });

    document.querySelectorAll('.save-button').forEach(button => {
        button.addEventListener('click', async () => {
            const id = button.dataset.id;
            const row = button.closest('tr');
            const estadoPago = row.querySelector('select[data-field="estadoPago"]').value;
            const estado = row.querySelector('select[data-field="estado"]').value;
            const notas = row.querySelector('textarea[data-field="notas"]').value;

            await updateReserva(id, { estadoPago, estado, notas });
        });
    });
};

const updateReserva = async (id, body) => {
    try {
        const response = await fetch(`${API_BASE_URL}/api/admin/reservas/${id}`, {
            method: 'PATCH',
            headers: getAuthHeaders(),
            body: JSON.stringify(body)
        });

        if (!response.ok) {
            if (response.status === 401) {
                setLoggedOut();
                showMessage(loginMessage, 'Contraseña incorrecta o sesión expirada.', 'error');
                return;
            }
            throw new Error('No se pudo actualizar la reserva');
        }

        showMessage(adminMessage, 'Reserva actualizada correctamente', 'success');
        fetchReservas();
    } catch (error) {
        showMessage(adminMessage, error.message, 'error');
    }
};

const tryLogin = async (password) => {
    try {
        clearMessage(loginMessage);
        const response = await fetch(`${API_BASE_URL}/api/admin/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ password })
        });

        if (!response.ok) {
            throw new Error('Contraseña incorrecta');
        }

        localStorage.setItem(ADMIN_STORAGE_KEY, password);
        setLoggedIn();
        fetchAllAdminData();
    } catch (error) {
        showMessage(loginMessage, error.message, 'error');
    }
};

loginBtn.addEventListener('click', () => {
    const password = adminPasswordInput.value.trim();
    if (!password) {
        showMessage(loginMessage, 'Ingresa la contraseña de administrador.', 'error');
        return;
    }
    tryLogin(password);
});

logoutBtn.addEventListener('click', () => {
    setLoggedOut();
});

refreshBtn.addEventListener('click', () => {
    fetchAllAdminData();
});

filterEstado.addEventListener('change', () => {
    fetchReservas();
});

filterEstadoPago.addEventListener('change', () => {
    fetchReservas();
});

filterEmail.addEventListener('input', () => {
    if (filterEmail.value.length === 0) {
        fetchReservas();
    }
});

clearFiltersBtn.addEventListener('click', () => {
    filterEstado.value = '';
    filterEstadoPago.value = '';
    filterEmail.value = '';
    fetchReservas();
});

window.addEventListener('load', () => {
    const savedPassword = localStorage.getItem(ADMIN_STORAGE_KEY);
    if (savedPassword) {
        setLoggedIn();
        fetchAllAdminData();
    } else {
        setLoggedOut();
    }
});
