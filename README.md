# 🏥 Clínica Online

**Clínica Online** es una plataforma web para la gestión integral de turnos médicos, orientada a pacientes, especialistas y administradores. Fue desarrollada como trabajo práctico final, integrando funcionalidades de registro, autenticación, control de accesos, carga de turnos, historia clínica ,generación de reportes y graficos.

---
<img width="1908" height="917" alt="image" src="https://github.com/user-attachments/assets/867b59cc-c294-4aac-86d4-714f5269274c" />


## 🚀 Características principales

- **Registro y Login de usuarios** con validaciones, verificación de mail y Captcha (Google reCAPTCHA).
- **Tres roles**: Paciente, Especialista y Administrador, con accesos y vistas personalizadas según el perfil.
- **Gestión de usuarios**: creación, habilitación/inactivación y visualización de datos personales y fotos.
- **Carga y visualización de turnos** con acciones condicionales (aceptar, cancelar, rechazar, finalizar, calificar).
- **Filtros personalizados** (por especialidad, paciente, especialista), sin combobox, adaptados a cada rol.
- **Gestión de disponibilidad horaria** por parte de los especialistas según especialidades.
- **Solicitud de turnos** dentro de los próximos 15 días, respetando la disponibilidad declarada.
- **Historia clínica del paciente** con datos fijos y dinámicos, cargada por el especialista y visible por rol.
- **Gráficos e informes estadísticos** sobre turnos, logins, especialidades y más, exportables a PDF o Excel.
- **Descargas**: historia clínica en PDF y listado de usuarios en Excel.
- **Animaciones y experiencia de usuario mejorada** en navegación y visualización.

---

## 🧩 Tecnologías utilizadas

- **Angular** (framework principal)
- **Supabase** (autenticación, base de datos, funciones edge)
- **Firebase Hosting**
- **SweetAlert2** (alertas)
- **Google reCAPTCHA v2**
- **ExcelJS / jsPDF** (exportaciones)

---

## 🧠 Estructura del sistema por rol

### 👤 Paciente
- Registrarse y verificar cuenta.
- Solicitar turnos y filtrarlos.
- Cancelar, calificar y ver reseñas.
- Ver su perfil y su historia clínica.

### 👨‍⚕️ Especialista
- Ver sus turnos asignados y filtrarlos.
- Aceptar, cancelar, rechazar o finalizar turnos.
- Cargar reseñas, diagnósticos y datos clínicos.
- Definir su disponibilidad horaria por especialidad.

### 🛡️ Administrador
- Gestionar todos los usuarios (crear, editar, aprobar).
- Visualizar y cancelar turnos.
- Acceder a estadísticas completas del sistema.
- Descargar datos en PDF/Excel.


