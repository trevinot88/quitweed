# QuitWeed 🌱 · Sobriedad y Bienestar

Una **PWA/WebApp** de seguimiento de sobriedad y bienestar para uso personal. Contador de días sobrio, check-ins diarios de mañana y noche, y un módulo SOS de emergencia con respiración guiada (box breathing 4-4-4-4).

> 🔒 **100% privado**: todos los datos se guardan en el `localStorage` de tu dispositivo. Sin bases de datos externas, sin servidores de datos. Exporta un backup JSON desde Ajustes cuando quieras.

## ✨ Funcionalidades

- **Dashboard**: contador central "Días Sobrio" con animación, tarjetas de *Dinero Ahorrado* y *Dosis no consumidas*, y banners de check-in según la hora del día.
- **☀️ Check-in de Mañana** (2 min): ánimo y estado físico (1–10), intención del día y hábitos (agua con sal de mar, NAC, grounding / luz solar).
- **🌙 Check-in de Noche** (5 min): switch Sobrio/Recaída, nivel de cravings (1–5), cómo superaste el peor momento, 3 victorias, notas y dinero ahorrado hoy.
- **🆘 Módulo SOS**: modal a pantalla completa con temporizador de 5 minutos y orbe animado de respiración 4-4-4-4. Muestra la intención registrada por la mañana.
- **📊 Historial**: todos tus registros con estado de ánimo, cravings y victorias.
- **⚙️ Ajustes**: perfil, fecha de inicio, presupuesto diario, dosis evitadas/día, exportar/importar JSON y borrado de datos.
- **📱 PWA**: instalable en iOS/Android ("Añadir a pantalla de inicio") con service worker e íconos.

## 🛠️ Stack

- [Next.js 16](https://nextjs.org/) (App Router, TypeScript, Turbopack)
- [Tailwind CSS v4](https://tailwindcss.com/)
- [shadcn/ui](https://ui.shadcn.com/) (componentes estilizados glass/neón)
- [framer-motion](https://www.framer.com/motion/) · [lucide-react](https://lucide.dev/)
- `useLocalStorage` con `useSyncExternalStore` (sin errores de hidratación)

## 🚀 Desarrollo local

```bash
npm install
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000).

## 🏗️ Producción

```bash
npm run build
npm start
```

## 🌍 Deploy

```bash
vercel
```

No requiere configuración adicional: todo vive en el cliente.
