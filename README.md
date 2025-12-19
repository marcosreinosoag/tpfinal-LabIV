# 🏥 Clínica Online

**Clínica Online** es una plataforma web para la gestión integral de turnos médicos, orientada a pacientes, especialistas y administradores. Fue desarrollada como trabajo práctico final, integrando funcionalidades de registro, autenticación, control de accesos, carga de turnos, historia clínica ,generación de reportes y graficos.

---
<img width="1908" height="917" alt="image" src="https://github.com/user-attachments/assets/867b59cc-c294-4aac-86d4-714f5269274c" />


## 🚀 Características principales

- **Registro y Login de usuarios** con validaciones, verificación de mail y Captcha (Google reCAPTCHA).
- **Tres roles**: Paciente, Especialista y Administrador, con accesos y vistas personalizadas según el perfil.
  <img width="1918" height="917" alt="image" src="https://github.com/user-attachments/assets/0902fc54-9ade-4d88-a471-5c76970a8358" />

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

---

## 🧠 Estructura del sistema por rol

### 👤 Paciente
- Registrarse y verificar cuenta.
- Solicitar turnos y filtrarlos.
  <img width="1306" height="907" alt="image" src="https://github.com/user-attachments/assets/3254dd6e-19ee-4a0f-b5c8-d97afd16f77d" />
- Cancelar, calificar y ver reseñas.
  <img width="1829" height="730" alt="image" src="https://github.com/user-attachments/assets/4b9c64b2-9d70-4eb2-a977-43e377b18010" />
- Ver su perfil y su historia clínica.
  <img width="1844" height="911" alt="image" src="https://github.com/user-attachments/assets/9d9430ef-cf04-4977-a894-1577b8053cf7" />
### 👨‍⚕️ Especialista
- Ver sus turnos asignados y filtrarlos.
<img width="1843" height="696" alt="image" src="https://github.com/user-attachments/assets/72829ea6-f8fd-4243-b3f8-0eadb3afcbda" />
- Aceptar, cancelar, rechazar o finalizar turnos.
- Cargar reseñas, diagnósticos y datos clínicos.
- Definir su disponibilidad horaria por especialidad.
  <img width="1849" height="874" alt="image" src="https://github.com/user-attachments/assets/3050f0f1-8755-460c-8859-c3948fa9642b" />


### 🛡️ Administrador
- Gestionar todos los usuarios (crear, editar, aprobar).
- Visualizar y cancelar turnos.
- Acceder a estadísticas completas del sistema.
<img width="1884" height="883" alt="image" src="https://github.com/user-attachments/assets/70735aac-aac0-42cb-b2b8-e6feee3ec87a" />
- Descargar datos en PDF/Excel.


