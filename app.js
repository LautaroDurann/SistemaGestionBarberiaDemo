/* ============================================================
   NOVA BARBERÍA — Sistema de gestión
   Datos persistidos en localStorage (cortes, clientes, turnos,
   personal y gastos). Los ingresos surgen de los turnos
   marcados como completados.
   ============================================================ */

const DIA_MS = 86400000;

/* ---------- helpers de fecha (zona local, seguros) ---------- */
function aISO(d) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const da = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${da}`;
}
function parseISO(iso) {
  const [y, m, d] = String(iso).split('-').map(Number);
  return new Date(y, m - 1, d);
}
function hoyISO() {
  return aISO(new Date());
}
function sumarDiasISO(iso, dias) {
  const d = parseISO(iso);
  d.setDate(d.getDate() + dias);
  return aISO(d);
}
function diasHastaISO(iso) {
  const hoy = new Date(); hoy.setHours(0, 0, 0, 0);
  const t = parseISO(iso);
  return Math.round((t - hoy) / DIA_MS);
}
const fmtFecha = (iso) => {
  if (!iso) return '—';
  const [y, m, d] = iso.split('-');
  return `${d}/${m}/${y}`;
};
const fmtDia = (iso) => {
  if (!iso) return '—';
  return new Intl.DateTimeFormat('es-AR', { weekday: 'short', day: 'numeric', month: 'short' }).format(parseISO(iso));
};
const fmtHora = (mins) => {
  if (mins === null || mins === undefined || mins === '') return '—';
  const m = Number(mins);
  const h = String(Math.floor(m / 60)).padStart(2, '0');
  const mm = String(m % 60).padStart(2, '0');
  return `${h}:${mm}`;
};

/* ---------- catálogos ---------- */
const ROLES = {
  barbero: 'Barbero/a',
  secretario: 'Secretario/a',
  dueno: 'Dueño/a',
};

const CATEGORIAS_CORTE = {
  clasico: 'Clásico',
  fade: 'Fade',
  barba: 'Barba',
  combo: 'Corte + Barba',
  color: 'Color / Tinte',
  otros: 'Otros',
};

const ESTADOS_TURNO = {
  pendiente: { label: 'Pendiente', badge: 'badge-proxima' },
  confirmado: { label: 'Confirmado', badge: 'badge-aldia' },
  en_proceso: { label: 'En proceso', badge: 'badge-proceso' },
  completado: { label: 'Completado', badge: 'badge-aldia' },
  cancelado: { label: 'Cancelado', badge: 'badge-vencida' },
};

const CATEGORIAS_GASTO = {
  alquiler: 'Alquiler',
  servicios: 'Servicios (luz, agua, internet)',
  sueldos: 'Liquidación de sueldos',
  insumos: 'Insumos (productos)',
  equipamiento: 'Equipamiento',
  marketing: 'Marketing',
  otros: 'Otros',
};

/* ---------- cortes base ---------- */
const CORTES_BASE = [
  { id: 'clasico', nombre: 'Corte clásico', categoria: 'clasico', descripcion: 'El corte de siempre: prolijo, versátil y con acabado perfecto.', precio: 6000, duracion: 30 },
  { id: 'fade', nombre: 'Fade', categoria: 'fade', descripcion: 'Degradado de precisión con navaja. Diseño moderno y marcado.', precio: 8000, duracion: 40 },
  { id: 'barba', nombre: 'Arreglo de barba', categoria: 'barba', descripcion: 'Delineado a navaja, perfilado y terminación con toalla caliente.', precio: 5000, duracion: 25 },
  { id: 'combo', nombre: 'Corte + barba', categoria: 'combo', descripcion: 'Experiencia completa: corte a elección y barba delineada.', precio: 12000, duracion: 60 },
  { id: 'navaja', nombre: 'Corte a navaja', categoria: 'clasico', descripcion: 'Técnica clásica con navaja y afeitado tradicional.', precio: 7500, duracion: 35 },
  { id: 'kids', nombre: 'Corte infantil', categoria: 'otros', descripcion: 'Corte prolijo para los más chicos, rápido y sin vueltas.', precio: 4500, duracion: 25 },
  { id: 'tinte', nombre: 'Tinte / color', categoria: 'color', descripcion: 'Coloración o tinte para cambiar de look con asesoramiento.', precio: 10000, duracion: 60 },
  { id: 'maquina', nombre: 'Máquina + delineado', categoria: 'fade', descripcion: 'Corte a máquina con delinear filo de navaja.', precio: 6500, duracion: 30 },
];

const PERSONAL_BASE = [
  { id: 1, nombre: 'Marcelo', apellido: 'Torres', rol: 'dueno', telefono: '+54 9 3644 100001', email: 'marcelo@novabarber.com', horario: 'Atención general', sueldo: 0, fechaIngreso: '2019-08-01', activo: true, notas: 'Dueño y fundador.' },
  { id: 2, nombre: 'Juan', apellido: 'Ríos', rol: 'barbero', telefono: '+54 9 3644 100002', email: 'juan@novabarber.com', horario: 'Mar a Sáb 9-13 y 16-21', sueldo: 160000, fechaIngreso: '2021-03-10', activo: true, notas: 'Especialista en fades y navaja.' },
  { id: 3, nombre: 'Lucas', apellido: 'Fernández', rol: 'barbero', telefono: '+54 9 3644 100003', email: 'lucas@novabarber.com', horario: 'Lun a Vie 14-21 · Sáb 9-13', sueldo: 150000, fechaIngreso: '2022-06-15', activo: true, notas: 'Cortes clásicos y barba.' },
  { id: 4, nombre: 'Agustina', apellido: 'Vega', rol: 'secretario', telefono: '+54 9 3644 100004', email: 'agustina@novabarber.com', horario: 'Lun a Sáb 9-13 y 16-21', sueldo: 120000, fechaIngreso: '2023-01-09', activo: true, notas: 'Maneja turnos y caja.' },
];

/* ---------- generación de datos demo ---------- */
function barberoDe(personal) {
  const b = personal.filter((p) => p.rol === 'barbero');
  return b[Math.floor(Math.random() * b.length)];
}

function generarDemoClientes() {
  const hoy = hoyISO();
  const dias = (n) => sumarDiasISO(hoy, n);
  const base = [
    { id: 1, nombre: 'Luciana', apellido: 'Ramírez', telefono: '+54 9 3644 100001', email: 'luciana@mail.com', direccion: 'Av. San Martín 120', nacimiento: '1994-03-12', notas: 'Prefiere fades bien marcados.' },
    { id: 2, nombre: 'Marcos', apellido: 'Ferreyra', telefono: '+54 9 3644 100002', email: 'marcos@mail.com', direccion: 'Belgrano 45', nacimiento: '2001-07-25', notas: 'Turno tarde.' },
    { id: 3, nombre: 'Diego', apellido: 'Pérez', telefono: '+54 9 3644 100003', email: 'diego@mail.com', direccion: 'Rivadavia 890', nacimiento: '1988-11-02', notas: '' },
    { id: 4, nombre: 'Franco', apellido: 'Gómez', telefono: '+54 9 3644 100004', email: 'franco@mail.com', direccion: 'Sarmiento 2030', nacimiento: '1995-05-18', notas: 'Barba abundante.' },
    { id: 5, nombre: 'Sofía', apellido: 'Maidana', telefono: '+54 9 3644 100005', email: 'sofia@mail.com', direccion: 'Pellegrini 77', nacimiento: '1999-09-30', notas: 'Corte + tinte.' },
    { id: 6, nombre: 'Iván', apellido: 'Ríos', telefono: '+54 9 3644 100006', email: 'ivan@mail.com', direccion: 'Santa Fe 301', nacimiento: '2003-01-14', notas: 'Nuevo cliente.' },
    { id: 7, nombre: 'Joaquín', apellido: 'Aguirre', telefono: '+54 9 3644 100007', email: 'joaquin@mail.com', direccion: 'Junín 520', nacimiento: '1992-02-22', notas: 'Cliásico + barba.' },
    { id: 8, nombre: 'Martina', apellido: 'López', telefono: '+54 9 3644 100008', email: 'martina@mail.com', direccion: 'Moreno 14', nacimiento: '2000-12-05', notas: '' },
  ];
  const cortes = ['clasico', 'fade', 'barba', 'combo', 'fade', 'clasico', 'combo', 'kids'];
  return base.map((c, i) => ({ ...c, corteFavoritoId: cortes[i % cortes.length], createdAt: dias(-(20 + i * 4)) }));
}

function generarDemoTurnos(clientes, personal, cortes) {
  const hoy = hoyISO();
  const dias = (n) => sumarDiasISO(hoy, n);
  const turnos = [];
  let id = 1;
  const barberos = personal.filter((p) => p.rol === 'barbero');

  // historial completado (aprox. los últimos 4 meses)
  for (let off = -115; off <= -2; off += 3) {
    const cuantos = 2 + ((off * 7) % 3);
    for (let k = 0; k < cuantos; k++) {
      const c = clientes[Math.floor(Math.random() * clientes.length)];
      const cte = cortes[Math.floor(Math.random() * cortes.length)];
      const b = barberos[Math.floor(Math.random() * barberos.length)];
      turnos.push({
        id: id++,
        fecha: dias(off),
        hora: 570 + Math.floor(Math.random() * 24) * 30,
        clienteId: c.id, barberoId: b.id, corteId: cte.id,
        estado: 'completado', fechaCompletado: dias(off),
        notas: '', precio: cte.precio,
      });
    }
  }

  // hoy: mezcla de estados
  const hoyEst = ['completado', 'completado', 'en_proceso', 'en_proceso', 'pendiente', 'confirmado'];
  for (let k = 0; k < 6; k++) {
    const c = clientes[Math.floor(Math.random() * clientes.length)];
    const cte = cortes[Math.floor(Math.random() * cortes.length)];
    const b = barberos[Math.floor(Math.random() * barberos.length)];
    const estado = hoyEst[k];
    turnos.push({
      id: id++,
      fecha: hoy,
      hora: 570 + k * 90,
      clienteId: c.id, barberoId: b.id, corteId: cte.id,
      estado,
      fechaCompletado: estado === 'completado' ? hoy : null,
      notas: '', precio: cte.precio,
    });
  }

  // próximos 7 días
  for (let off = 1; off <= 7; off++) {
    const cuantos = 2 + (off % 2);
    for (let k = 0; k < cuantos; k++) {
      const c = clientes[Math.floor(Math.random() * clientes.length)];
      const cte = cortes[Math.floor(Math.random() * cortes.length)];
      const b = barberos[Math.floor(Math.random() * barberos.length)];
      turnos.push({
        id: id++,
        fecha: dias(off),
        hora: 540 + Math.floor(Math.random() * 26) * 30,
        clienteId: c.id, barberoId: b.id, corteId: cte.id,
        estado: Math.random() < 0.5 ? 'pendiente' : 'confirmado',
        fechaCompletado: null,
        notas: '', precio: cte.precio,
      });
    }
  }

  return turnos.sort((a, b) => (a.fecha === b.fecha ? a.hora - b.hora : String(a.fecha).localeCompare(String(b.fecha))));
}

function generarDemoGastos() {
  const hoy = hoyISO();
  const d = (off) => sumarDiasISO(hoy, off);
  return [
    { id: 1,  fecha: d(0),   categoria: 'sueldos', descripcion: 'Liquidación de sueldo — Juan Ríos (barbero)', monto: 160000 },
    { id: 2,  fecha: d(0),   categoria: 'sueldos', descripcion: 'Liquidación de sueldo — Lucas Fernández (barbero)', monto: 150000 },
    { id: 3,  fecha: d(0),   categoria: 'sueldos', descripcion: 'Liquidación de sueldo — Agustina Vega (secretaria)', monto: 120000 },
    { id: 4,  fecha: d(-2),  categoria: 'servicios', descripcion: 'Luz', monto: 46200 },
    { id: 5,  fecha: d(-3),  categoria: 'alquiler', descripcion: 'Alquiler del local', monto: 180000 },
    { id: 6,  fecha: d(-6),  categoria: 'insumos', descripcion: 'Shampoo, tintes y productos para barba', monto: 38500 },
    { id: 7,  fecha: d(-9),  categoria: 'servicios', descripcion: 'Internet y cámaras', monto: 21800 },
    { id: 8,  fecha: d(-12), categoria: 'equipamiento', descripcion: 'Juego de máquinas y tijeras nuevas', monto: 145000 },
    { id: 9,  fecha: d(-16), categoria: 'marketing', descripcion: 'Publicidad en redes', monto: 12000 },
    { id: 10, fecha: d(-30), categoria: 'alquiler', descripcion: 'Alquiler del local', monto: 180000 },
    { id: 11, fecha: d(-30), categoria: 'sueldos', descripcion: 'Liquidación de sueldo — Juan Ríos (barbero)', monto: 160000 },
    { id: 12, fecha: d(-30), categoria: 'sueldos', descripcion: 'Liquidación de sueldo — Lucas Fernández (barbero)', monto: 150000 },
    { id: 13, fecha: d(-30), categoria: 'sueldos', descripcion: 'Liquidación de sueldo — Agustina Vega (secretaria)', monto: 120000 },
    { id: 14, fecha: d(-32), categoria: 'servicios', descripcion: 'Luz', monto: 44100 },
    { id: 15, fecha: d(-60), categoria: 'alquiler', descripcion: 'Alquiler del local', monto: 180000 },
    { id: 16, fecha: d(-60), categoria: 'insumos', descripcion: 'Reposición de toallas y descartables', monto: 21400 },
    { id: 17, fecha: d(-90), categoria: 'alquiler', descripcion: 'Alquiler del local', monto: 180000 },
    { id: 18, fecha: d(-90), categoria: 'equipamiento', descripcion: 'Sillón de barbería nuevo', monto: 320000 },
  ];
}

/* ---------- componente principal ---------- */
document.addEventListener('alpine:init', () => {
  Alpine.data('barberApp', () => ({
    /* navegación */
    view: 'inicio',
    mobileOpen: false,
    toast: null,
    toastTimer: null,
    confirmState: null,
    reporteAbierto: false,

    /* cortes */
    cortes: [],
    filtroCorte: 'todas',
    corteFormAbierto: false,
    editandoCorte: null,
    formCorte: null,

    /* clientes */
    clientes: [],
    buscarCliente: '',
    formAbierto: false,
    editando: null,
    form: null,
    detalle: null,
    eliminarPendiente: null,

    /* personal */
    personal: [],
    filtroRol: 'todos',
    personalFormAbierto: false,
    editandoPersonal: null,
    formPersonal: null,
    eliminarPersonalPendiente: null,

    /* turnos */
    turnos: [],
    filtroEstadoTurno: 'todos',
    filtroFechaTurno: 'proximos',
    filtroBarbero: 'todos',
    buscarTurno: '',
    turnoFormAbierto: false,
    editandoTurno: null,
    formTurno: null,

    /* finanzas */
    gastos: [],
    mesFiltro: 'todos',
    gastoFormAbierto: false,
    editandoGasto: null,
    formGasto: null,
    liquidacionDe: null,

    init() {
      this.formCorte = this.nuevoFormCorte();
      this.form = this.nuevoForm();
      this.formPersonal = this.nuevoFormPersonal();
      this.formTurno = this.nuevoFormTurno();
      this.formGasto = this.nuevoFormGasto();

      const h = (location.hash || '').replace('#', '');
      if (['cortes', 'clientes', 'turnos', 'personal', 'finanzas'].includes(h)) this.view = h;

      const rawC = localStorage.getItem('nova_barber_cortes_v1');
      if (rawC) { try { this.cortes = JSON.parse(rawC); } catch { this.cortes = []; } }
      if (!this.cortes.length) this.cortes = JSON.parse(JSON.stringify(CORTES_BASE));

      const rawP = localStorage.getItem('nova_barber_personal_v1');
      if (rawP) { try { this.personal = JSON.parse(rawP); } catch { this.personal = []; } }
      if (!this.personal.length) this.personal = JSON.parse(JSON.stringify(PERSONAL_BASE));

      const rawCli = localStorage.getItem('nova_barber_clientes_v1');
      if (rawCli) { try { this.clientes = JSON.parse(rawCli); } catch { this.clientes = []; } }

      const rawT = localStorage.getItem('nova_barber_turnos_v1');
      if (rawT) { try { this.turnos = JSON.parse(rawT); } catch { this.turnos = []; } }

      const rawG = localStorage.getItem('nova_barber_gastos_v1');
      if (rawG) { try { this.gastos = JSON.parse(rawG); } catch { this.gastos = []; } }
    },

    /* --------------- navegación --------------- */
    irA(v) {
      this.view = v;
      this.mobileOpen = false;
      if (history.replaceState) history.replaceState(null, '', v === 'inicio' ? '#' : '#' + v);
      window.scrollTo({ top: 0, behavior: 'instant' });
    },
    anclar(id) {
      if (this.view !== 'inicio') {
        this.view = 'inicio';
        setTimeout(() => {
          const el = document.getElementById(id);
          if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 60);
      } else {
        const el = document.getElementById(id);
        if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    },
    mostrarToast(msg) {
      this.toast = msg;
      clearTimeout(this.toastTimer);
      this.toastTimer = setTimeout(() => (this.toast = null), 2600);
    },
    confirmar(titulo, mensaje, onOk, opts) {
      this.confirmState = { titulo, mensaje, onOk, peligroso: !!(opts && opts.peligroso) };
    },
    confirmOk() {
      const cb = this.confirmState && this.confirmState.onOk;
      this.confirmState = null;
      if (typeof cb === 'function') cb();
    },
    confirmCancel() {
      this.confirmState = null;
    },

    /* --------------- utilidades --------------- */
    slugObj(v) {
      return String(v || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim();
    },
    cortePorId(id) { return this.cortes.find((c) => c.id === id) || null; },
    clientePorId(id) { return this.clientes.find((c) => c.id === id) || null; },
    personalPorId(id) { return this.personal.find((p) => p.id === id) || null; },
    clienteNombre(id) { const c = this.clientePorId(id); return c ? `${c.nombre} ${c.apellido}` : 'Cliente eliminado'; },
    clienteIniciales(id) {
      const c = this.clientePorId(id);
      return c ? (c.nombre[0] || '') + (c.apellido[0] || '') : '?';
    },
    clienteTelefono(id) {
      const c = this.clientePorId(id);
      return c ? (c.telefono || 'Sin teléfono') : '—';
    },
    personalNombre(id) { const p = this.personalPorId(id); return p ? `${p.nombre} ${p.apellido}` : 'Personal eliminado'; },
    corteNombre(id) { const c = this.cortePorId(id); return c ? c.nombre : 'Servicio eliminado'; },

    /* --------------- cortes --------------- */
    categoriasCortes() {
      const set = {};
      this.cortes.forEach((c) => {
        const slug = c.categoria;
        if (slug && !set[slug]) set[slug] = CATEGORIAS_CORTE[slug] || slug;
      });
      return Object.entries(set).map(([slug, label]) => ({ slug, label }));
    },
    cortesFiltrados() {
      if (this.filtroCorte === 'todas') return this.cortes;
      return this.cortes.filter((c) => c.categoria === this.filtroCorte);
    },
    categoriaCorteLabel(cat) { return CATEGORIAS_CORTE[cat] || cat; },
    nuevoFormCorte() {
      return { nombre: '', categoria: 'clasico', descripcion: '', precio: null, duracion: 30 };
    },
    abrirFormCorte(c) {
      this.editandoCorte = c;
      this.formCorte = c
        ? { nombre: c.nombre, categoria: c.categoria, descripcion: c.descripcion || '', precio: c.precio, duracion: c.duracion || 30 }
        : this.nuevoFormCorte();
      this.corteFormAbierto = true;
    },
    guardarCorte() {
      const f = this.formCorte;
      if (!f.nombre.trim()) { this.mostrarToast('Completá el nombre del corte.'); return; }
      const precio = Number(f.precio);
      if (!precio || precio <= 0) { this.mostrarToast('Ingresá un precio válido.'); return; }
      const datos = {
        nombre: f.nombre.trim(),
        categoria: f.categoria,
        descripcion: (f.descripcion || '').trim(),
        precio,
        duracion: Number(f.duracion) || 30,
      };
      if (this.editandoCorte) {
        Object.assign(this.editandoCorte, datos);
        this.mostrarToast('Corte actualizado');
      } else {
        this.cortes.unshift({ id: 'c' + Date.now(), ...datos });
        this.mostrarToast('Corte creado');
      }
      this.persistirCortes();
      this.corteFormAbierto = false;
    },
    eliminarCorte(c) {
      this.confirmar('Eliminar servicio', `¿Eliminar el servicio "${c.nombre}"? Los turnos ya agendados conservan su importe.`, () => {
        this.cortes = this.cortes.filter((x) => x.id !== c.id);
        this.persistirCortes();
        this.mostrarToast('Servicio eliminado');
      }, { peligroso: true });
    },
    restaurarCortes() {
      this.confirmar('Restaurar cortes base', 'Se descartan los cambios y se vuelven a cargar los servicios predeterminados.', () => {
        this.cortes = JSON.parse(JSON.stringify(CORTES_BASE));
        this.persistirCortes();
        this.mostrarToast('Servicios base restaurados');
      });
    },
    agendarParaCorte(c) {
      this.view = 'turnos';
      this.formTurno = this.nuevoFormTurno({ corteId: c.id });
      this.editandoTurno = null;
      this.turnoFormAbierto = true;
    },

    /* --------------- clientes --------------- */
    visitasCliente(c) {
      return this.turnos.filter((t) => t.clienteId === c.id && t.estado === 'completado').length;
    },
    ultimaVisitaCliente(c) {
      const fechas = this.turnos
        .filter((t) => t.clienteId === c.id && t.estado === 'completado')
        .map((t) => t.fechaCompletado || t.fecha)
        .filter(Boolean)
        .sort()
        .reverse();
      return fechas[0] || null;
    },
    proximoTurnoCliente(c) {
      const hoy = hoyISO();
      const turnos = this.turnos
        .filter((t) => t.clienteId === c.id && t.estado !== 'completado' && t.estado !== 'cancelado' && t.fecha >= hoy)
        .sort((a, b) => (a.fecha === b.fecha ? a.hora - b.hora : String(a.fecha).localeCompare(String(b.fecha))));
      return turnos[0] || null;
    },
    statsClientes() {
      const hoy = hoyISO();
      const mes = hoy.slice(0, 7);
      const nuevos = this.clientes.filter((c) => (c.createdAt || '').slice(0, 7) === mes).length;
      const conTurnoProximo = this.clientes.filter((c) => this.proximoTurnoCliente(c)).length;
      return { total: this.clientes.length, nuevos, conTurno: conTurnoProximo, visitasMes: this.turnos.filter((t) => t.estado === 'completado' && (t.fechaCompletado || t.fecha || '').slice(0, 7) === mes).length };
    },
    clientesFiltrados() {
      const q = this.buscarCliente.trim().toLowerCase();
      if (!q) return this.clientes;
      return this.clientes.filter((c) => `${c.nombre} ${c.apellido} ${c.telefono} ${c.email}`.toLowerCase().includes(q));
    },
    nuevoForm() {
      return { nombre: '', apellido: '', telefono: '', email: '', direccion: '', nacimiento: '', corteFavoritoId: '', notas: '' };
    },
    abrirForm(cl) {
      this.editando = cl;
      this.form = cl
        ? { nombre: cl.nombre, apellido: cl.apellido, telefono: cl.telefono || '', email: cl.email || '', direccion: cl.direccion || '', nacimiento: cl.nacimiento || '', corteFavoritoId: cl.corteFavoritoId || '', notas: cl.notas || '' }
        : this.nuevoForm();
      this.formAbierto = true;
    },
    guardarCliente() {
      const f = this.form;
      if (!f.nombre.trim() || !f.apellido.trim()) { this.mostrarToast('Completá nombre y apellido.'); return; }
      const datos = {
        nombre: f.nombre.trim(), apellido: f.apellido.trim(),
        telefono: (f.telefono || '').trim(), email: (f.email || '').trim(),
        direccion: (f.direccion || '').trim(), nacimiento: f.nacimiento || '',
        corteFavoritoId: f.corteFavoritoId || '', notas: (f.notas || '').trim(),
      };
      if (this.editando) {
        Object.assign(this.editando, datos);
        this.persistirClientes();
        this.mostrarToast('Cliente actualizado');
      } else {
        this.clientes.unshift({ id: Date.now(), ...datos, createdAt: hoyISO() });
        this.persistirClientes();
        this.mostrarToast('Cliente creado');
      }
      this.formAbierto = false;
    },
    pedirEliminar(c) { this.eliminarPendiente = c; },
    eliminarCliente() {
      const el = this.eliminarPendiente;
      if (!el) return;
      this.clientes = this.clientes.filter((c) => c.id !== el.id);
      this.turnos = this.turnos.filter((t) => t.clienteId !== el.id);
      this.persistirClientes();
      this.persistirTurnos();
      this.mostrarToast('Cliente eliminado (y sus turnos)');
      this.eliminarPendiente = null;
      if (this.detalle && this.detalle.id === el.id) this.detalle = null;
    },
    abrirDetalle(c) { this.detalle = c; },
    fichaDatosCliente(c) {
      if (!c) return [];
      const out = [];
      const add = (label, valor) => {
        if (valor !== undefined && valor !== null && String(valor).trim() !== '') out.push({ label, valor: String(valor) });
      };
      add('Teléfono', c.telefono);
      add('Email', c.email);
      add('Domicilio', c.direccion);
      add('Nacimiento', c.nacimiento ? fmtFecha(c.nacimiento) : '');
      add('Corte preferido', c.corteFavoritoId ? this.corteNombre(c.corteFavoritoId) : '');
      add('Notas', c.notas);
      return out;
    },
    turnosCliente(c) {
      return this.turnos
        .filter((t) => t.clienteId === c.id)
        .sort((a, b) => (a.fecha === b.fecha ? a.hora - b.hora : String(b.fecha).localeCompare(String(a.fecha))));
    },
    visitasFechaCliente(c) {
      return this.turnos
        .filter((t) => t.clienteId === c.id && t.estado === 'completado')
        .map((t) => t.fechaCompletado || t.fecha)
        .filter(Boolean)
        .sort();
    },
    gastoTotalCliente(c) {
      return this.turnos
        .filter((t) => t.clienteId === c.id && t.estado === 'completado')
        .reduce((s, t) => s + (t.precio || 0), 0);
    },
    gastoPromedioCliente(c) {
      const n = this.visitasCliente(c);
      return n ? this.gastoTotalCliente(c) / n : 0;
    },
    frecuenciaCliente(c) {
      const fechas = [...new Set(this.visitasFechaCliente(c))];
      if (fechas.length < 2) return null;
      let suma = 0;
      for (let i = 1; i < fechas.length; i++) {
        suma += Math.abs(diasHastaISO(fechas[i]) - diasHastaISO(fechas[i - 1]));
      }
      return Math.round(suma / (fechas.length - 1));
    },
    frecuenciaClienteLabel(c) {
      const g = this.frecuenciaCliente(c);
      if (g === null) return 'Sin datos suficientes';
      if (g <= 3) return 'Casi a diario';
      if (g >= 25) return 'Aprox. 1 vez al mes';
      return `Cada ~${g} días`;
    },
    ultimoCorteCliente(c) {
      const completados = this.turnos
        .filter((t) => t.clienteId === c.id && t.estado === 'completado')
        .sort((a, b) => String(b.fechaCompletado || b.fecha).localeCompare(String(a.fechaCompletado || a.fecha)));
      const ultimo = completados[0];
      return ultimo ? { nombre: this.corteNombre(ultimo.corteId), fecha: ultimo.fechaCompletado || ultimo.fecha } : null;
    },

    /* --------------- personal --------------- */
    rolLabel(r) { return ROLES[r] || r; },
    rolBadge(r) {
      if (r === 'barbero') return 'rol-barbero';
      if (r === 'secretario') return 'rol-secretario';
      return 'rol-dueno';
    },
    personalFiltrados() {
      if (this.filtroRol === 'todos') return this.personal;
      return this.personal.filter((p) => p.rol === this.filtroRol);
    },
    barberosActivos() { return this.personal.filter((p) => p.rol === 'barbero' && p.activo !== false); },
    statsPersonal() {
      return {
        total: this.personal.length,
        barberos: this.personal.filter((p) => p.rol === 'barbero').length,
        activos: this.personal.filter((p) => p.activo !== false).length,
        sueldos: this.personal.reduce((s, p) => s + (Number(p.sueldo) || 0), 0),
      };
    },
    nuevoFormPersonal() {
      return { nombre: '', apellido: '', rol: 'barbero', telefono: '', email: '', horario: '', sueldo: null, fechaIngreso: hoyISO(), activo: true, notas: '' };
    },
    abrirFormPersonal(p) {
      this.editandoPersonal = p;
      this.formPersonal = p
        ? { nombre: p.nombre, apellido: p.apellido, rol: p.rol, telefono: p.telefono || '', email: p.email || '', horario: p.horario || '', sueldo: p.sueldo, fechaIngreso: p.fechaIngreso || hoyISO(), activo: p.activo !== false, notas: p.notas || '' }
        : this.nuevoFormPersonal();
      this.personalFormAbierto = true;
    },
    guardarPersonal() {
      const f = this.formPersonal;
      if (!f.nombre.trim() || !f.apellido.trim()) { this.mostrarToast('Completá nombre y apellido.'); return; }
      const datos = {
        nombre: f.nombre.trim(), apellido: f.apellido.trim(), rol: f.rol,
        telefono: (f.telefono || '').trim(), email: (f.email || '').trim(),
        horario: (f.horario || '').trim(), sueldo: Number(f.sueldo) || 0,
        fechaIngreso: f.fechaIngreso || hoyISO(), activo: !!f.activo, notas: (f.notas || '').trim(),
      };
      if (this.editandoPersonal) {
        Object.assign(this.editandoPersonal, datos);
        this.persistirPersonal();
        this.mostrarToast('Personal actualizado');
      } else {
        this.personal.push({ id: Date.now(), ...datos });
        this.persistirPersonal();
        this.mostrarToast('Personal registrado');
      }
      this.personalFormAbierto = false;
    },
    pedirEliminarPersonal(p) { this.eliminarPersonalPendiente = p; },
    eliminarPersonal() {
      const el = this.eliminarPersonalPendiente;
      if (!el) return;
      this.personal = this.personal.filter((p) => p.id !== el.id);
      this.persistirPersonal();
      this.mostrarToast('Personal eliminado');
      this.eliminarPersonalPendiente = null;
    },

    /* --------------- turnos --------------- */
    horasTurno() {
      const out = [];
      for (let m = 480; m < 1260; m += 30) out.push(m);
      return out;
    },
    estadoTurnoLabel(e) { return (ESTADOS_TURNO[e] || {}).label || e; },
    estadoTurnoBadge(e) { return (ESTADOS_TURNO[e] || { badge: 'badge-proxima' }).badge; },
    proximoTurnoDelta(fecha) {
      const d = diasHastaISO(fecha);
      if (d === 0) return 'hoy';
      if (d === 1) return 'mañana';
      if (d > 1) return `en ${d} días`;
      return `hace ${Math.abs(d)} días`;
    },
    abrirDetalleT(t) {
      const c = this.clientePorId(t.clienteId);
      if (c) this.detalle = c;
    },
    barberosPorTurno() { return this.personal.filter((p) => p.rol === 'barbero'); },
    statsTurnos() {
      const hoy = hoyISO();
      const activos = this.turnos.filter((t) => t.estado !== 'cancelado');
      return {
        hoy: activos.filter((t) => t.fecha === hoy).length,
        pendientes: activos.filter((t) => t.fecha >= hoy && (t.estado === 'pendiente' || t.estado === 'confirmado')).length,
        completados: this.turnos.filter((t) => t.estado === 'completado' && (t.fechaCompletado || t.fecha) === hoy).length,
        ingresos: this.turnos.filter((t) => t.estado === 'completado' && (t.fechaCompletado || t.fecha) === hoy).reduce((s, t) => s + (t.precio || 0), 0),
      };
    },
    turnosFiltrados() {
      const hoy = hoyISO();
      const q = this.buscarTurno.trim().toLowerCase();
      return this.turnos.filter((t) => {
        if (this.filtroEstadoTurno !== 'todos' && t.estado !== this.filtroEstadoTurno) return false;
        if (this.filtroBarbero !== 'todos' && t.barberoId !== this.filtroBarbero) return false;
        if (this.filtroFechaTurno === 'hoy' && t.fecha !== hoy) return false;
        if (this.filtroFechaTurno === 'proximos' && t.fecha < hoy) return false;
        if (q) {
          const cl = this.clientePorId(t.clienteId);
          const ba = this.personalPorId(t.barberoId);
          const cte = this.cortePorId(t.corteId);
          const texto = [
            cl && `${cl.nombre} ${cl.apellido}`,
            ba && `${ba.nombre} ${ba.apellido}`,
            cte && cte.nombre,
          ].filter(Boolean).join(' ').toLowerCase();
          if (!texto.includes(q)) return false;
        }
        return true;
      }).sort((a, b) => (a.fecha === b.fecha ? a.hora - b.hora : String(a.fecha).localeCompare(String(b.fecha))));
    },
    nuevoFormTurno(presets) {
      const b = this.barberosActivos();
      return {
        fecha: hoyISO(),
        hora: 570,
        clienteId: '',
        barberoId: (b[0] && b[0].id) || '',
        corteId: '',
        estado: 'pendiente',
        notas: '',
        ...presets,
      };
    },
    abrirFormTurno(t) {
      this.editandoTurno = t;
      this.formTurno = t
        ? { fecha: t.fecha, hora: t.hora, clienteId: t.clienteId, barberoId: t.barberoId, corteId: t.corteId, estado: t.estado, notas: t.notas || '' }
        : this.nuevoFormTurno();
      this.turnoFormAbierto = true;
    },
    agendarParaCliente(c) {
      this.view = 'turnos';
      this.formTurno = this.nuevoFormTurno({ clienteId: c.id, corteId: c.corteFavoritoId || '' });
      this.editandoTurno = null;
      this.turnoFormAbierto = true;
    },
    precioDeCorteSeleccionado() {
      const c = this.cortePorId(this.formTurno.corteId);
      return c ? c.precio : 0;
    },
    guardarTurno() {
      const f = this.formTurno;
      if (!f.clienteId) { this.mostrarToast('Seleccioná un cliente.'); return; }
      if (!f.barberoId) { this.mostrarToast('Seleccioná un barbero.'); return; }
      const corte = this.cortePorId(f.corteId);
      if (!f.corteId || !corte) { this.mostrarToast('Seleccioná un servicio.'); return; }
      if (!f.fecha) { this.mostrarToast('Completá la fecha.'); return; }
      const datos = {
        fecha: f.fecha, hora: Number(f.hora) || 540,
        clienteId: f.clienteId, barberoId: f.barberoId, corteId: f.corteId,
        estado: f.estado, notas: (f.notas || '').trim(),
        precio: corte.precio,
      };
      if (datos.estado === 'completado' && !this.editandoTurno) datos.fechaCompletado = hoyISO();
      if (datos.estado !== 'completado') datos.fechaCompletado = null;
      if (this.editandoTurno) {
        if (datos.estado === 'completado' && !this.editandoTurno.fechaCompletado) this.editandoTurno.fechaCompletado = hoyISO();
        Object.assign(this.editandoTurno, datos);
        if (this.editandoTurno.estado !== 'completado') this.editandoTurno.fechaCompletado = null;
        this.persistirTurnos();
        this.mostrarToast('Turno actualizado');
      } else {
        this.turnos.push({ id: Date.now(), ...datos });
        this.persistirTurnos();
        this.mostrarToast('Turno agendado');
      }
      this.turnoFormAbierto = false;
    },
    confirmarTurno(t) {
      t.estado = 'confirmado';
      this.persistirTurnos();
      this.mostrarToast('Turno confirmado');
    },
    iniciarTurno(t) {
      t.estado = 'en_proceso';
      this.persistirTurnos();
      this.mostrarToast('Turno en proceso');
    },
    completarTurno(t) {
      const ingreso = t.precio || 0;
      this.confirmar('Completar turno', `Confirmás que el turno se realizó. Se registra el ingreso de $${ingreso.toLocaleString('es-AR')}.`, () => {
        t.estado = 'completado';
        t.fechaCompletado = hoyISO();
        this.persistirTurnos();
        this.mostrarToast(`Corte completado — ingreso $${ingreso.toLocaleString('es-AR')}`);
      });
    },
    reabrirTurno(t) {
      this.confirmar('Reabrir turno', 'El turno vuelve a pendiente y se anula el ingreso registrado.', () => {
        t.estado = 'pendiente';
        t.fechaCompletado = null;
        this.persistirTurnos();
        this.mostrarToast('Turno reabierto (ingreso anulado)');
      }, { peligroso: true });
    },
    cancelarTurno(t) {
      this.confirmar('Cancelar turno', 'El turno quedará cancelado y saldrá de la agenda activa.', () => {
        t.estado = 'cancelado';
        t.fechaCompletado = null;
        this.persistirTurnos();
        this.mostrarToast('Turno cancelado');
      }, { peligroso: true });
    },
    eliminarTurno(t) {
      this.confirmar('Eliminar turno', 'Este turno se eliminará de forma definitiva del registro.', () => {
        this.turnos = this.turnos.filter((x) => x.id !== t.id);
        this.persistirTurnos();
        this.mostrarToast('Turno eliminado');
      }, { peligroso: true });
    },

    /* --------------- finanzas --------------- */
    claveMes(iso) { return String(iso || '').slice(0, 7); },
    labelMes(clave) {
      if (clave === 'todos') return 'Todos los meses';
      const [y, m] = clave.split('-').map(Number);
      return new Intl.DateTimeFormat('es-AR', { month: 'long', year: 'numeric' }).format(new Date(y, m - 1, 1));
    },
    labelMesCorto(clave) {
      const [y, m] = clave.split('-').map(Number);
      return new Intl.DateTimeFormat('es-AR', { month: 'short', year: '2-digit' }).format(new Date(y, m - 1, 1));
    },
    mesesOpciones() {
      const out = [];
      const d = new Date();
      d.setDate(1);
      for (let i = 0; i < 13; i++) {
        out.push(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`);
        d.setMonth(d.getMonth() - 1);
      }
      return out;
    },
    ingresosMes(clave) {
      const out = [];
      this.turnos.forEach((t) => {
        if (t.estado !== 'completado') return;
        const fecha = t.fechaCompletado || t.fecha;
        if (clave !== 'todos' && this.claveMes(fecha) !== clave) return;
        out.push({
          fecha,
          cliente: this.clienteNombre(t.clienteId),
          barbero: this.personalNombre(t.barberoId),
          corte: this.corteNombre(t.corteId),
          monto: t.precio || 0,
          ref: t,
        });
      });
      return out.sort((a, b) => String(b.fecha).localeCompare(String(a.fecha)));
    },
    gastosMes(clave) {
      return this.gastos
        .filter((g) => clave === 'todos' || this.claveMes(g.fecha) === clave)
        .sort((a, b) => String(b.fecha).localeCompare(String(a.fecha)));
    },
    totalIngresos(clave) { return this.ingresosMes(clave).reduce((s, p) => s + p.monto, 0); },
    totalGastos(clave) { return this.gastosMes(clave).reduce((s, g) => s + g.monto, 0); },
    balance(clave) { return this.totalIngresos(clave) - this.totalGastos(clave); },
    cortesRealizados(clave) { return this.ingresosMes(clave).length; },
    ultimosMeses(n) {
      return this.mesesOpciones()
        .slice(0, n)
        .reverse()
        .map((m) => ({ clave: m, label: this.labelMesCorto(m), ingreso: this.totalIngresos(m), egreso: this.totalGastos(m) }));
    },
    chartMax() {
      return Math.max(1, ...this.ultimosMeses(6).map((b) => Math.max(b.ingreso, b.egreso)));
    },
    barAlto(v) {
      return v > 0 ? Math.max(8, (v / this.chartMax()) * 100) : 2;
    },
    categoriaGastoLabel(cat) { return CATEGORIAS_GASTO[cat] || cat; },
    categoriaGastoColor(cat) {
      const colores = {
        alquiler: '#7dd3fc',
        servicios: '#c4b5fd',
        sueldos: '#fbbf24',
        insumos: '#fcd34d',
        equipamiento: '#f9a8d4',
        marketing: '#fdba74',
      };
      return colores[cat] || '#e4e4e7';
    },
    gastosPorCategoria(clave) {
      const mapa = {};
      this.gastosMes(clave).forEach((g) => {
        if (!mapa[g.categoria]) {
          mapa[g.categoria] = { cat: g.categoria, label: this.categoriaGastoLabel(g.categoria), total: 0, cantidad: 0 };
        }
        mapa[g.categoria].total += g.monto || 0;
        mapa[g.categoria].cantidad += 1;
      });
      const total = Object.values(mapa).reduce((s, o) => s + o.total, 0);
      return Object.values(mapa)
        .sort((a, b) => b.total - a.total)
        .map((o) => ({ ...o, pct: total ? Math.round((o.total / total) * 100) : 0 }));
    },
    abrirReporte() {
      this.reporteAbierto = true;
    },
    categoriaGastoBadge(cat) {
      if (cat === 'alquiler') return 'cat-alquiler';
      if (cat === 'servicios') return 'cat-servicios';
      if (cat === 'sueldos') return 'cat-sueldos';
      if (cat === 'insumos') return 'cat-insumos';
      if (cat === 'equipamiento') return 'cat-equipamiento';
      if (cat === 'marketing') return 'cat-marketing';
      return 'cat-otros';
    },

    /* --------------- gastos --------------- */
    nuevoFormGasto() {
      return { fecha: hoyISO(), categoria: 'alquiler', descripcion: '', monto: null };
    },
    abrirFormGasto(g) {
      this.editandoGasto = g;
      this.formGasto = g
        ? { fecha: g.fecha, categoria: g.categoria, descripcion: g.descripcion, monto: g.monto }
        : this.nuevoFormGasto();
      this.liquidacionDe = null;
      this.gastoFormAbierto = true;
    },
    abrirLiquidacion(p) {
      this.editandoGasto = null;
      this.formGasto = {
        fecha: hoyISO(),
        categoria: 'sueldos',
        descripcion: `Liquidación de sueldo — ${p.nombre} ${p.apellido} (${this.rolLabel(p.rol)})`,
        monto: p.sueldo,
      };
      this.liquidacionDe = p;
      this.gastoFormAbierto = true;
    },
    estadoLabelLiquidacion(p) {
      return `${this.rolLabel(p.rol)} · $${(p.sueldo || 0).toLocaleString('es-AR')}/mes`;
    },
    guardarGasto() {
      const f = this.formGasto;
      const monto = Number(f.monto);
      if (!monto || monto <= 0) { this.mostrarToast('Ingresá un monto válido.'); return; }
      const descripcion = (f.descripcion || '').trim() || this.categoriaGastoLabel(f.categoria);
      if (this.editandoGasto) {
        Object.assign(this.editandoGasto, { fecha: f.fecha, categoria: f.categoria, descripcion, monto });
        this.mostrarToast('Gasto actualizado');
      } else {
        this.gastos.unshift({ id: Date.now(), fecha: f.fecha, categoria: f.categoria, descripcion, monto });
        this.mostrarToast(this.liquidacionDe ? `Liquidación de sueldo cargada — $${monto.toLocaleString('es-AR')}` : 'Gasto guardado');
      }
      this.persistirGastos();
      this.gastoFormAbierto = false;
      this.liquidacionDe = null;
    },
    eliminarGasto(g) {
      this.confirmar('Eliminar gasto', `¿Eliminar "${g.descripcion}" por $${(g.monto || 0).toLocaleString('es-AR')}?`, () => {
        this.gastos = this.gastos.filter((x) => x.id !== g.id);
        this.persistirGastos();
        this.mostrarToast('Gasto eliminado');
      }, { peligroso: true });
    },

    /* --------------- persistencia --------------- */
    persistirCortes() { localStorage.setItem('nova_barber_cortes_v1', JSON.stringify(this.cortes)); },
    persistirClientes() { localStorage.setItem('nova_barber_clientes_v1', JSON.stringify(this.clientes)); },
    persistirPersonal() { localStorage.setItem('nova_barber_personal_v1', JSON.stringify(this.personal)); },
    persistirTurnos() { localStorage.setItem('nova_barber_turnos_v1', JSON.stringify(this.turnos)); },
    persistirGastos() { localStorage.setItem('nova_barber_gastos_v1', JSON.stringify(this.gastos)); },

    cargarDemo() {
      const aplicar = () => {
        if (!this.personal.filter((p) => p.rol === 'barbero').length) this.personal = JSON.parse(JSON.stringify(PERSONAL_BASE));
        this.clientes = generarDemoClientes();
        this.turnos = generarDemoTurnos(this.clientes, this.personal, this.cortes);
        this.gastos = generarDemoGastos();
        this.persistirPersonal();
        this.persistirClientes();
        this.persistirTurnos();
        this.persistirGastos();
        this.mostrarToast('Datos de ejemplo cargados');
      };
      if (this.clientes.length || this.turnos.length || this.gastos.length) {
        this.confirmar('Cargar datos demo', 'Ya hay datos cargados. La demo reemplazará clientes, turnos y gastos actuales.', aplicar, { peligroso: true });
      } else {
        aplicar();
      }
    },
    cargarDemoGastos() {
      const aplicar = () => {
        this.gastos = generarDemoGastos();
        this.persistirGastos();
        this.mostrarToast('Gastos de ejemplo cargados');
      };
      if (this.gastos.length) {
        this.confirmar('Cargar gastos demo', 'Ya hay gastos cargados. La demo reemplazará la lista actual.', aplicar, { peligroso: true });
      } else {
        aplicar();
      }
    },
    vaciarDatos() {
      this.confirmar('Vaciar base de datos', 'Se eliminarán clientes, turnos, personal y gastos. Esta acción no se puede deshacer.', () => {
        this.clientes = [];
        this.turnos = [];
        this.gastos = [];
        this.personal = [];
        this.persistirClientes();
        this.persistirTurnos();
        this.persistirGastos();
        this.persistirPersonal();
        this.mostrarToast('Base de datos vaciada');
      }, { peligroso: true });
    },
    vaciarGastos() {
      this.confirmar('Vaciar gastos', 'Se eliminarán todos los gastos registrados. Esta acción no se puede deshacer.', () => {
        this.gastos = [];
        this.persistirGastos();
        this.mostrarToast('Gastos vaciados');
      }, { peligroso: true });
    },
  }));
});

/* exponer utilidades para las expresiones de Alpine */
window.fmtFecha = fmtFecha;
window.fmtDia = fmtDia;
window.fmtHora = fmtHora;
window.hoyISO = hoyISO;