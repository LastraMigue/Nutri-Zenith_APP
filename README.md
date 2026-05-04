# Nutri-Zenith APP

Plataforma integral de nutrición y bienestar que conecta especialistas con clientes para el seguimiento dietético y control de hábitos saludables.

## ¿Para qué sirve?

Nutri-Zenith permite a los especialistas en nutrición gestionar perfiles de clientes, asignar dietas personalizadas y hacer seguimiento del progreso. Los clientes pueden registrar su consumo diario, consultar sus dietas asignadas, gestionar productos y monitorear métricas como peso, hidratación, pasos y calorías.

## Tecnologías

- **React 18** - Biblioteca para interfaces de usuario
- **Vite** - Herramienta de construcción rápida
- **Supabase** - Backend as a Service (Auth, Base de datos, API)
- **React Router DOM** - Enrutamiento
- **Framer Motion** - Animaciones
- **Lucide React** - Iconografía

## Estructura del proyecto

```
Nutri-Zenith_APP/
├── frontend/
│   ├── src/
│   │   ├── components/     # Componentes reutilizables (Navbar, AuthCard)
│   │   ├── pages/          # Páginas de la aplicación
│   │   │   ├── ClientLogin / ClientRegister / ClientDashboard
│   │   │   ├── AdminLogin / AdminDashboard / AdminProfiles / AdminCreate
│   │   │   ├── DietManagement / UploadDiet / ViewDiet
│   │   │   ├── ProductManagement / UploadProduct / ViewProduct
│   │   │   └── DailyConsumption
│   │   ├── routes/         # Rutas protegidas (ProtectedRoute)
│   │   ├── lib/            # Configuración de Supabase
│   │   ├── App.jsx         # Configuración de rutas principal
│   │   └── main.jsx        # Punto de entrada
│   ├── public/             # Recursos estáticos (logo, favicon)
│   └── package.json
├── .gitignore
└── README.md
```

## Puertos de usuario

- **Cliente**: Registro/Login con OTP, dashboard, dietas, productos, consumo diario
- **Especialista**: Login, gestión de perfiles, creación de dietas/productos, seguimiento de clientes

## Scripts

```bash
cd frontend
npm install
npm run dev
```
