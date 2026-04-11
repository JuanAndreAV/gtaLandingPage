# 🎨 Sistema de Gestión Académica y Análisis con Inteligencia Artificial - Casa de la Cultura Pedrito Ruiz

Plataforma web integral de gestión académica y administrativa para la Casa de la Cultura de Girardota, Antioquia. Sistema desarrollado para automatizar reportes, gestionar novedades docentes y analizar datos académicos mediante inteligencia artificial.

[![Deploy](https://img.shields.io/badge/deploy-firebase-orange)](https://giaradotaescultura.web.app)
[![Angular](https://img.shields.io/badge/Angular-21.0.4-red)](https://angular.io)
[![NestJS](https://img.shields.io/badge/NestJS-Latest-ea2845)](https://nestjs.com)
[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![SpringBoot](https://img.shields.io/badge/SpringBoot-6DB33F?style=flat-square&logo=Spring&logoColor=white)](https://spring.io/projects/spring-boot)

## 🌐 Demo en Vivo

**Aplicación Desplegada:** [https://giaradotaescultura.web.app](https://giaradotaescultura.web.app)

## 📋 Descripción

Sistema completo que centraliza y automatiza procesos administrativos y académicos de la Casa de la Cultura Pedrito Ruiz. Integra datos de múltiples fuentes, proporciona análisis inteligentes con IA y facilita la gestión administrativa para coordinadores y personal docente.

## ✨ Características Principales

### 📊 Reportes Académicos Automatizados
- **Reporte Poblacional**: Caracterización completa de la población estudiantil
- **Reporte de Cursos**: Listado detallado de cursos activos
- **Cantidad de Matriculados**: Estadísticas de inscripciones por programa
- **Reporte de Estudiantes**: Información individual y grupal de estudiantes
- **Estado de Cursos**: Visualización del estado actual de cada curso
- **Carga Académica**: Distribución de cursos por profesor
- **Asistencia por Curso**: Consulta de asistencias con filtros avanzados

### 👨‍🏫 Gestión de Novedades Docentes
- **Registro de Incapacidades**: Formulario de carga de incapacidades médicas
- **Cambios de Horario**: Gestión de modificaciones en horarios
- **Panel de Administración**: Módulo para aceptar o rechazar novedades
- **Historial Completo**: Registro histórico de todas las novedades

### 🤖 Análisis con Inteligencia Artificial
- **Integración Gemini 2.5 Pro**: API de Google para análisis inteligente
- **Reportes de Inasistencia con IA**: Generación automática de informes basados en patrones
- **Análisis Predictivo**: Identificación de tendencias académicas
- **Recomendaciones Automáticas**: Sugerencias basadas en datos históricos

### 🔐 Sistema de Autenticación Robusto
- **Login Seguro**: Autenticación con Supabase
- **Gestión de Roles**: Diferenciación entre coordinadores y profesores
- **Rutas Protegidas**: Guards de Angular para seguridad
- **Sesiones Persistentes**: Manejo de tokens JWT

## 🛠️ Tecnologías Utilizadas

### Frontend
- **Framework**: Angular 21.0.4
- **Estilos**: Tailwind CSS
- **Arquitectura**: Standalone Components
- **State Management**: Angular Signals
- **Deployment**: Firebase Hosting
- **URL**: https://giaradotaescultura.web.app

### Api SpringBoot pruebas locales
#### 🔹 API Postgres  (Autenticación JWT y Security )

- **Repository**: https://github.com/JuanAndreAV/springbootCulturaApi.git
- **Framework**: SpringBoot
- **Base de Datos**: PostgreSQL
## 🔐 Seguridad y Autenticación
* **Spring Security:** Configurado para manejar sesiones Stateless.
* **JWT (JSON Web Tokens):** Generación y validación de tokens para acceso protegido.
* **BCrypt Hashing:** Las contraseñas se almacenan de forma segura utilizando el algoritmo `BCryptPasswordEncoder`, garantizando que nunca se guarden en texto plano.

Configurar el application.properties con tus credenciales de Postgres.

Ejecutar ./mvnw spring-boot:run
### 🗄️ Script de Base de Datos (PostgreSQL)

Para inicializar la base de datos, ejecuta el siguiente script. Este incluye la extensión para UUID y un usuario administrador de prueba con contraseña encriptada.

```sql
-- Extensión necesaria para UUIDs
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    nombre VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL,
    created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITHOUT TIME ZONE,
    enabled BOOLEAN DEFAULT TRUE,
    account_non_expired BOOLEAN DEFAULT TRUE,
    account_non_locked BOOLEAN DEFAULT TRUE,
    credentials_non_expired BOOLEAN DEFAULT TRUE
)

-- Usuario de prueba: admin@cultura.com / Pass: admin123
INSERT INTO users (nombre, email, password, role) 
VALUES ('Administrador', 'admin@admin.com', '$2a$10$8.UnVuG9HHgffUDAlk8qfOuVGkqRzgVymGe07xd00DMxs.TVuH', 'admin');

```
### Backend - APIs Producción firebase app Hosting

#### 🔹 API Supabase  (Autenticación y Datos)
- **Repository**: [nest-cultura-api](https://github.com/JuanAndreAV/nest-cultura-api)
- **Framework**: NestJS
- **Base de Datos**: PostgreSQL (Supabase)
- **Autenticación**: Supabase Auth (JWT)
- **Deployment**: Firebase App Hosting

#### 🔹 API Novedades y MongoDB
- **Repository**: [gta-eventos](https://github.com/JuanAndreAV/gta-eventos)
- **Framework**: NestJS
- **Base de Datos**: MongoDB
- **IA Integration**: Google Gemini 2.5 Pro API
- **Deployment**: Firebase App Hosting

#### 🔹 API Q10 (Externa)
- **Tipo**: API institucional
- **Función**: Fuente de datos académicos oficiales
- **Integración**: Consumo mediante servicios Angular

## 📦 Estructura del Proyecto

### Frontend (Angular)
```
# 🎨 Sistema de Gestión Académica - Casa de la Cultura Pedrito Ruiz

Plataforma web integral de gestión académica y administrativa para la Casa de la Cultura de Girardota, Antioquia. Sistema desarrollado para automatizar reportes, gestionar novedades docentes y analizar datos académicos mediante inteligencia artificial.

[![Deploy](https://img.shields.io/badge/deploy-firebase-orange)](https://giaradotaescultura.web.app)
[![Angular](https://img.shields.io/badge/Angular-19.2.12-red)](https://angular.io)
[![NestJS](https://img.shields.io/badge/NestJS-Latest-ea2845)](https://nestjs.com)
[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)

## 🌐 Demo en Vivo

**Aplicación Desplegada:** [https://giaradotaescultura.web.app](https://giaradotaescultura.web.app)

### 🔑 Credenciales de Prueba

Para probar la aplicación sin necesidad de crear una cuenta:

```
Usuario: [USUARIO_DEMO]
Contraseña: [CONTRASEÑA_DEMO]
```

> **Nota**: Estas credenciales son solo para demostración y tienen permisos limitados.

## 📋 Descripción

Sistema completo que centraliza y automatiza procesos administrativos y académicos de la Casa de la Cultura Pedrito Ruiz. Integra datos de múltiples fuentes, proporciona análisis inteligentes con IA y facilita la gestión administrativa para coordinadores y personal docente.

## ✨ Características Principales

### 📊 Reportes Académicos Automatizados
- **Reporte Poblacional**: Caracterización completa de la población estudiantil
- **Reporte de Cursos**: Listado detallado de cursos activos
- **Cantidad de Matriculados**: Estadísticas de inscripciones por programa
- **Reporte de Estudiantes**: Información individual y grupal de estudiantes
- **Estado de Cursos**: Visualización del estado actual de cada curso
- **Carga Académica**: Distribución de cursos por profesor
- **Asistencia por Curso**: Consulta de asistencias con filtros avanzados

### 👨‍🏫 Gestión de Novedades Docentes
- **Registro de Incapacidades**: Formulario de carga de incapacidades médicas
- **Cambios de Horario**: Gestión de modificaciones en horarios
- **Panel de Administración**: Módulo para aceptar o rechazar novedades
- **Historial Completo**: Registro histórico de todas las novedades

### 🤖 Análisis con Inteligencia Artificial
- **Integración Gemini 2.5 Pro**: API de Google para análisis inteligente
- **Reportes de Inasistencia con IA**: Generación automática de informes basados en patrones
- **Análisis Predictivo**: Identificación de tendencias académicas
- **Recomendaciones Automáticas**: Sugerencias basadas en datos históricos

### 🔐 Sistema de Autenticación Robusto
- **Login Seguro**: Autenticación con Supabase
- **Gestión de Roles**: Diferenciación entre coordinadores y profesores
- **Rutas Protegidas**: Guards de Angular para seguridad
- **Sesiones Persistentes**: Manejo de tokens JWT

## 🛠️ Tecnologías Utilizadas

### Frontend
- **Framework**: Angular 19.2.12
- **Estilos**: Tailwind CSS
- **Arquitectura**: Standalone Components
- **State Management**: Angular Signals
- **Deployment**: Firebase Hosting
- **URL**: https://giaradotaescultura.web.app

### Backend - APIs

#### 🔹 API Supabase (Autenticación y Datos)
- **Repository**: [nest-cultura-api](https://github.com/JuanAndreAV/nest-cultura-api)
- **Framework**: NestJS
- **Base de Datos**: PostgreSQL (Supabase)
- **Autenticación**: Supabase Auth (JWT)
- **Deployment**: Firebase App Hosting

#### 🔹 API Novedades y MongoDB
- **Repository**: [gta-eventos](https://github.com/JuanAndreAV/gta-eventos)
- **Framework**: NestJS
- **Base de Datos**: MongoDB
- **IA Integration**: Google Gemini 2.5 Pro API
- **Deployment**: Firebase App Hosting

#### 🔹 API Spring Boot (Pruebas Locales)
- **Repository**: [springbootCulturaApi](https://github.com/JuanAndreAV/springbootCulturaApi)
- **Framework**: Spring Boot
- **Base de Datos**: PostgreSQL
- **Seguridad**: Spring Security + JWT
- **Propósito**: API local para pruebas de autenticación
- **Estado**: Desarrollo/Testing

#### 🔹 API Q10 (Externa)
- **Tipo**: API institucional
- **Función**: Fuente de datos académicos oficiales
- **Integración**: Consumo mediante servicios Angular

## 📦 Estructura del Proyecto

### Frontend (Angular)
```
gtaLandingPage/
├── src/
│   ├── app/
│   │   ├── auth/                       # Módulo de Autenticación
│   │   │   ├── auth-layout/            # Layout para páginas de auth
│   │   │   ├── guards/                 # Guards de autenticación
│   │   │   ├── interceptor/            # HTTP interceptor para JWT
│   │   │   ├── interfaces/             # Interfaces de auth
│   │   │   ├── pages/                  # Páginas de login/register
│   │   │   ├── services/               # Servicios de autenticación
│   │   │   └── auth.routes.ts          # Rutas de autenticación
│   │   │
│   │   ├── features/                   # Módulos por funcionalidad
│   │   │   ├── admin/                  # Panel de Administración
│   │   │   ├── profesor/               # Módulo de Profesores
│   │   │   └── shared/                 # Componentes compartidos
│   │   │
│   │   ├── layout/                     # Layouts de la aplicación
│   │   │
│   │   ├── models/                     # Modelos/Interfaces TypeScript
│   │   │
│   │   ├── pages/                      # Páginas principales
│   │   │   ├── home/                   # Dashboard principal
│   │   │   ├── q10-asistencia/         # Asistencia desde Q10
│   │   │   ├── q10-consulta-docente/   # Consulta de carga docente
│   │   │   ├── q10-poblacion/          # Reportes poblacionales
│   │   │   └── reportes/               # Generación de reportes
│   │   │
│   │   ├── services/                   # Servicios globales
│   │   │   ├── academico/              # Servicio académico
│   │   │   ├── ai-asistencia.service.ts # IA Gemini para análisis
│   │   │   ├── contact.service.ts      # Servicio de contacto
│   │   │   ├── events.service.ts       # Gestión de eventos
│   │   │   ├── metricas.service.ts     # Métricas y estadísticas
│   │   │   ├── news.service.ts         # Noticias
│   │   │   ├── novedad.service.ts      # Novedades docentes
│   │   │   ├── q10.service.ts          # Integración API Q10
│   │   │   └── user.service.ts         # Gestión de usuarios
│   │   │
│   │   └── shared/                     # Recursos compartidos
│   │
│   ├── assets/                         # Recursos estáticos
│   │   ├── images/
│   │   ├── icons/
│   │   └── styles/
│   │
│   └── environments/
│       ├── environment.ts              # Variables de desarrollo
│       └── environment.prod.ts         # Variables de producción
│
├── public/                             # Archivos públicos
├── angular.json
├── tailwind.config.js
└── firebase.json
```

### Backend APIs
```
nest-cultura-api/          # API Supabase
├── src/
│   ├── auth/
│  

gta-eventos/               # API MongoDB + Gemini
├── src/
│   ├── ai/
│   ├── cambio-horario/
│   └── eventos/

springbootCulturaApi/     # API Local
├── .mvn/
├── src/
│   ├── main/
│   │   ├── java/com/cultura/api/
│   │   │   ├── config/              # Configuración de Spring
│   │   │   ├── controllers/         # Controladores REST
│   │   │   ├── dto/                 # Data Transfer Objects
│   │   │   ├── entity/              # Entidades JPA
│   │   │   ├── jwt/                 # JWT Authentication
│   │   │   ├── repository/          # Repositorios JPA
│   │   │   ├── services/            # Servicios de negocio
│   │   │   └── ApiApplication.java  # Clase principal
│   │   │
│   │   └── resources/
│   │       ├── application.properties
│   │       
│   │
│   └── test/java/com/cultura/api/   # Tests unitarios
│
├── .gitattributes
├── .gitignore
├── mvnw                              # Maven wrapper (Unix)
├── mvnw.cmd                          # Maven wrapper (Windows)
└── pom.xml                           # Dependencias Maven
```

## 🚀 Instalación y Configuración

### Prerrequisitos
- Node.js 18+ 
- Angular CLI 19+
- Cuenta Firebase
- Cuenta Supabase
- API Key de Google Gemini

### Frontend - Instalación

1. **Clonar repositorio**
```bash
git clone https://github.com/JuanAndreAV/gtaLandingPage.git
cd gtaLandingPage
```

2. **Instalar dependencias**
```bash
npm install
```

3. **Configurar variables de entorno**

Crear `src/environments/environment.ts`:
```typescript
export const environment = {
  production: false,
  apiSupabaseUrl: 'https://tu-api-supabase-url.com',
  apiNovedadesUrl: 'https://tu-api-novedades-url.com',
  apiQ10Url: 'https://api-q10-url.com',
  supabaseKey: 'tu-supabase-anon-key',
  geminiApiKey: 'tu-gemini-api-key'
};
```

4. **Iniciar servidor de desarrollo**
```bash
ng serve
```
Navega a `http://localhost:4200/`

### Backend - Instalación

#### API Supabase
```bash
git clone https://github.com/JuanAndreAV/nest-cultura-api.git
cd nest-cultura-api
npm install

# Configurar .env basado en .env.template
npm run start:dev
```

#### API Spring Boot
```bash
git clone https://github.com/JuanAndreAV/springbootCulturaApi.git
cd springbootCulturaApi

# Configurar application.properties con tu conexión PostgreSQL
# Ejecutar el script SQL (ver sección Base de Datos)
mvn spring-boot:run
```

## 🗄️ Base de Datos PostgreSQL

### Configuración de la Base de Datos

El sistema utiliza PostgreSQL como base de datos principal. El script SQL completo está disponible en el repositorio.

#### Requisitos
- PostgreSQL 12 o superior
- Cliente psql o pgAdmin

#### Instalación

1. **Crear la base de datos**
```sql
CREATE DATABASE cultura_girardota;
```

2. **Ejecutar el script SQL**
```bash
psql -U postgres -d cultura_girardota -f schema.sql
```

O usando pgAdmin:
- Conectarse a PostgreSQL
- Crear nueva base de datos `cultura_girardota`
- Abrir Query Tool
- Cargar y ejecutar `schema.sql`

### Estructura de la Base de Datos

El esquema incluye las siguientes tablas principales:

#### Tablas Principales
- **roles**: Roles del sistema (admin, profesor)
- **usuarios**: Autenticación y gestión de usuarios con JWT
- **programas**: Programas académicos de la Casa de la Cultura
- **estudiantes**: Información completa de estudiantes
- **profesores**: Información y especialidades de profesores
- **cursos**: Grupos académicos y horarios
- **inscripciones**: Matrículas de estudiantes en cursos
- **asistencias**: Registro diario de asistencia
- **novedades**: Incapacidades y cambios de horario

#### Vistas Útiles
- `v_estudiantes_completo`: Estudiantes con datos de usuario
- `v_cursos_completo`: Cursos con programa y profesor
- `v_asistencia_curso`: Asistencias por curso
- `v_novedades_pendientes`: Novedades sin aprobar

#### Funciones
- `fn_porcentaje_asistencia()`: Calcula % de asistencia
- `fn_actualizar_timestamp()`: Actualiza updated_at automáticamente

### Usuarios de Prueba Predefinidos

El script SQL incluye usuarios de prueba:

```sql
-- admin
Usuario: admin
Email: admin@admin.com
Contraseña: 123456



> **Nota**: Las contraseñas están hasheadas con BCrypt en la base de datos.

### Conexión desde Spring Boot

Configurar en `application.properties`:

```properties
spring.application.name=api
s
# Configuración del servidor
server.port=3002

# Configuración de PostgreSQL
spring.datasource.url=jdbc:postgresql://localhost:5432/postgres
spring.datasource.username=postgres
spring.datasource.password=contrasena
spring.datasource.driver-class-name=org.postgresql.Driver

# Configuración de JPA/Hibernate
spring.jpa.database-platform=org.hibernate.dialect.PostgreSQLDialect
spring.jpa.hibernate.ddl-auto=none
spring.jpa.show-sql=true
spring.jpa.properties.hibernate.format_sql=true

# JWT Configuration (lo configuraremos después)

jwt.secret=404E635266556A586E3272357538782F413F4428472B4B6250645367566B5970
jwt.expiration=86400000
```

## 🔧 Scripts Disponibles

### Frontend
```bash
# Desarrollo
ng serve

# Construcción producción
ng build --configuration production

# Deploy a Firebase
firebase deploy

# Tests
ng test

# Linting
ng lint
```

### Backend
```bash
# NestJS APIs
npm run start:dev      # Desarrollo
npm run start:prod     # Producción
npm run test          # Tests

# Spring Boot API
mvn spring-boot:run    # Desarrollo
mvn clean package     # Compilar JAR
mvn test              # Tests

# Deploy Firebase (NestJS)
firebase deploy
```

## 📊 Funcionalidades Detalladas

### 1. Módulo de Reportes
**Reporte Poblacional**
- Caracterización demográfica completa
- Distribución por edad, género, ubicación
- Gráficos interactivos con Chart.js
- Exportación a PDF/Excel

**Reporte de Cursos**
- Listado de todos los cursos activos
- Información de horarios y docentes
- Filtros por programa y jornada
- Capacidad y matriculados

**Asistencia**
- Consulta por curso y rango de fechas
- Porcentajes de asistencia
- Identificación de estudiantes en riesgo
- Generación de reportes automáticos

### 2. Módulo de Novedades
**Registro**
- Formulario intuitivo para profesores
- Tipos: Incapacidad, Cambio de Horario


**Administración**
- Panel para coordinadores
- Aprobación/Rechazo de solicitudes


### 3. Módulo de IA (Gemini)
**Análisis de Inasistencias**
- Procesamiento de datos de asistencia
- Generación de narrativa con IA
- Identificación de patrones
- Recomendaciones personalizadas

### 4. Panel de Administración
- Dashboard con métricas clave
- Gestión de novedades pendientes
- Visualización de reportes
- Herramientas de coordinación

## 🌐 Despliegue en Firebase

### Frontend
```bash
# Login
firebase login

# Inicializar (primera vez)
firebase init

# Build
ng build --configuration production

# Deploy
firebase deploy --only hosting
```

### Backend APIs
```bash
# Cada API se despliega de forma independiente
firebase deploy --only apphosting
```

**Proyecto Firebase**: `girardotaescultura`

## 🔐 Configuración de Seguridad

### Supabase
- Row Level Security (RLS) habilitado
- Políticas por rol (coordinador/profesor)
- Autenticación JWT

### Firebase
- Security Rules configuradas
- CORS habilitado para APIs
- Environment variables seguras

### MongoDB
- Autenticación por usuario/contraseña
- Conexión cifrada
- Backup automático

## 🤖 Integración con Gemini AI

```typescript
// Ejemplo de uso
const analyzeAttendance = async (courseId: string, dateRange: DateRange) => {
  const attendanceData = await getAttendanceData(courseId, dateRange);
  
  const prompt = `Analiza los siguientes datos de asistencia y genera un informe: ${JSON.stringify(attendanceData)}`;
  
  const response = await geminiService.generateContent(prompt);
  
  return response;
};
```




## 👥 Roles y Permisos

### Coordinador
- ✅ Acceso total a reportes
- ✅ Gestión de novedades
- ✅ Panel de administración
- ✅ Análisis con IA

### Profesor
- ✅ Consulta de cursos propios
- ✅ Registro de novedades
- ✅ Visualización de asistencia
- ❌ Panel de administración

## 🐛 Solución de Problemas

### Error de CORS
```bash
# Verificar configuración en firebase.json
{
  "headers": [{
    "source": "**",
    "headers": [{
      "key": "Access-Control-Allow-Origin",
      "value": "*"
    }]
  }]
}
```

### Error de Autenticación
- Verificar tokens JWT en localStorage
- Validar configuración de Supabase
- Revisar guards de Angular

## 📝 Roadmap

- [ ] Módulo de calificaciones
- [ ] Sistema de mensajería interna
- [ ] App móvil con Ionic
- [ ] Integración con Microsoft Teams
- [ ] Dashboard en tiempo real
- [ ] Notificaciones push

## 🤝 Contribuciones

Las contribuciones son bienvenidas. Para cambios importantes:

1. Fork el proyecto
2. Crea tu Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📄 Licencia

Este proyecto está bajo la Licencia MIT - ver archivo [LICENSE](LICENSE) para detalles.

## 👤 Autor

**Juan Andrés Álvarez Velásquez (JuanitoCode)**

- GitHub: [@JuanAndreAV](https://github.com/JuanAndreAV)
- LinkedIn: [Juan Andrés Álvarez Velásquez](https://www.linkedin.com/in/juan-a-a-v/)

## 🙏 Agradecimientos

- Casa de la Cultura Pedrito Ruiz - Girardota
- Equipo docente y administrativo
- Comunidad de Angular y NestJS
- Google Gemini AI
- Supabase y Firebase

## 📞 Soporte

Para reportar problemas o solicitar funcionalidades:
- Abre un [Issue en GitHub](https://github.com/JuanAndreAV/gtaLandingPage/issues)
- Contacta al desarrollador

---

**Desarrollado con ❤️ para la Casa de la Cultura de Girardota**

**🌐 [https://giaradotaescultura.web.app](https://giaradotaescultura.web.app)**
```

### Backend APIs
```
nest-cultura-api/          # API Supabase
├── src/
│   ├── auth/
│   ├── estudiantes/
│   ├── cursos/
│   └── reportes/

gta-eventos/               # API MongoDB + Gemini
├── src/
│   ├── novedades/
│   ├── gemini/
│   └── analytics/
```

## 🚀 Instalación y Configuración

### Prerrequisitos
- Node.js 18+ 
- Angular CLI 19+
- Cuenta Firebase
- Cuenta Supabase
- API Key de Google Gemini

### Frontend - Instalación

1. **Clonar repositorio**
```bash
git clone https://github.com/JuanAndreAV/gtaLandingPage.git
cd gtaLandingPage
```

2. **Instalar dependencias**
```bash
npm install
```

3. **Configurar variables de entorno**

Crear `src/environments/environment.ts`:
```typescript
export const environment = {
  production: false,
  apiSupabaseUrl: 'https://tu-api-supabase-url.com',
  apiNovedadesUrl: 'https://tu-api-novedades-url.com',
  apiQ10Url: 'https://api-q10-url.com',
  supabaseKey: 'tu-supabase-anon-key',
  geminiApiKey: 'tu-gemini-api-key'
};
```

4. **Iniciar servidor de desarrollo**
```bash
ng serve
```
Navega a `http://localhost:4200/`

### Backend - Instalación

#### API Supabase
```bash
git clone https://github.com/JuanAndreAV/nest-cultura-api.git
cd nest-cultura-api
npm install

# Configurar .env basado en .env.template
npm run start:dev
```

#### API Novedades
```bash
git clone https://github.com/JuanAndreAV/gta-eventos.git
cd gta-eventos
npm install

# Configurar .env basado en .env.template
npm run start:dev
```

## 🔧 Scripts Disponibles

### Frontend
```bash
# Desarrollo
ng serve

# Construcción producción
ng build --configuration production

# Deploy a Firebase
firebase deploy

# Tests
ng test

# Linting
ng lint
```

### Backend
```bash
# Desarrollo
npm run start:dev

# Producción
npm run start:prod

# Tests
npm run test

# Deploy Firebase
firebase deploy
```

## 📊 Funcionalidades Detalladas

### 1. Módulo de Reportes
**Reporte Poblacional**
- Caracterización demográfica completa
- Distribución por edad, género, ubicación
- Gráficos interactivos con Chart.js
- Exportación a PDF/Excel

**Reporte de Cursos**
- Listado de todos los cursos activos
- Información de horarios y docentes
- Filtros por programa y jornada
- Capacidad y matriculados

**Asistencia**
- Consulta por curso y rango de fechas
- Porcentajes de asistencia
- Identificación de estudiantes en riesgo
- Generación de reportes automáticos

### 2. Módulo de Novedades
**Registro**
- Formulario intuitivo para profesores
- Tipos: Incapacidad, Cambio de Horario
- Carga de documentos de soporte
- Notificaciones automáticas

**Administración**
- Panel para coordinadores
- Aprobación/Rechazo de solicitudes
- Historial de decisiones
- Sistema de comentarios

### 3. Módulo de IA (Gemini)
**Análisis de Inasistencias**
- Procesamiento de datos de asistencia
- Generación de narrativa con IA
- Identificación de patrones
- Recomendaciones personalizadas

### 4. Panel de Administración
- Dashboard con métricas clave
- Gestión de novedades pendientes
- Visualización de reportes
- Herramientas de coordinación

## 🌐 Despliegue en Firebase

### Frontend
```bash
# Login
firebase login

# Inicializar (primera vez)
firebase init

# Build
ng build --configuration production

# Deploy
firebase deploy --only hosting
```

### Backend APIs
```bash
# Cada API se despliega de forma independiente
firebase deploy --only apphosting
```

**Proyecto Firebase**: `girardotaescultura`

## 🔐 Configuración de Seguridad

### Supabase
- Row Level Security (RLS) habilitado
- Políticas por rol (coordinador/profesor)
- Autenticación JWT

### Firebase
- Security Rules configuradas
- CORS habilitado para APIs
- Environment variables seguras

### MongoDB
- Autenticación por usuario/contraseña
- Conexión cifrada
- Backup automático

## 🤖 Integración con Gemini AI

```typescript
// Ejemplo de uso
const analyzeAttendance = async (courseId: string, dateRange: DateRange) => {
  const attendanceData = await getAttendanceData(courseId, dateRange);
  
  const prompt = `Analiza los siguientes datos de asistencia y genera un informe: ${JSON.stringify(attendanceData)}`;
  
  const response = await geminiService.generateContent(prompt);
  
  return response;
};
```

## 📖 API Endpoints

### API Supabase
```
GET    /api/auth/login
POST   /api/auth/register
GET    /api/cursos
GET    /api/estudiantes
GET    /api/profesores
GET    /api/reportes/poblacional
GET    /api/reportes/cursos
```

### API Novedades
```
GET    /api/novedades
POST   /api/novedades
PUT    /api/novedades/:id/aprobar
PUT    /api/novedades/:id/rechazar
POST   /api/gemini/analyze-attendance
```

## 👥 Roles y Permisos

### Coordinador
- ✅ Acceso total a reportes
- ✅ Gestión de novedades
- ✅ Panel de administración
- ✅ Análisis con IA

### Profesor
- ✅ Consulta de cursos propios
- ✅ Registro de novedades
- ✅ Visualización de asistencia
- ❌ Panel de administración

## 🐛 Solución de Problemas

### Error de CORS
```bash
# Verificar configuración en firebase.json
{
  "headers": [{
    "source": "**",
    "headers": [{
      "key": "Access-Control-Allow-Origin",
      "value": "*"
    }]
  }]
}
```

### Error de Autenticación
- Verificar tokens JWT en localStorage
- Validar configuración de Supabase
- Revisar guards de Angular

## 📝 Roadmap

- [ ] Módulo de calificaciones
- [ ] Sistema de mensajería interna
- [ ] App móvil con Ionic
- [ ] Integración con Microsoft Teams
- [ ] Dashboard en tiempo real
- [ ] Notificaciones push

## 🤝 Contribuciones

Las contribuciones son bienvenidas. Para cambios importantes:

1. Fork el proyecto
2. Crea tu Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📄 Licencia

Este proyecto está bajo la Licencia MIT - ver archivo [LICENSE](LICENSE) para detalles.

## 👤 Autor

**Juan Andrés Álvarez Velásquez (JuanitoCode)**

- GitHub: [@JuanAndreAV](https://github.com/JuanAndreAV)
- LinkedIn: [Juan Andrés Álvarez Velásquez](hhttps://www.linkedin.com/in/juan-a-a-v/)

## 🙏 Agradecimientos

- Casa de la Cultura Pedrito Ruiz - Girardota
- Equipo docente y administrativo
- Comunidad de Angular y NestJS
- Google Gemini AI
- Supabase y Firebase

## 📞 Soporte

Para reportar problemas o solicitar funcionalidades:
- Abre un [Issue en GitHub](https://github.com/JuanAndreAV/gtaLandingPage/issues)
- Contacta al desarrollador

---

**Desarrollado con ❤️ para la Casa de la Cultura de Girardota**

**🌐 [https://giaradotaescultura.web.app](https://giaradotaescultura.web.app)**