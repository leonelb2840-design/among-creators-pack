# 🤝 Guía de Contribución

¡Gracias por querer aportar al **Among Creators Pack**! Este proyecto nació como algo personal, pero cualquier ayuda es bienvenida. Aquí te explico cómo puedes contribuir de forma ordenada.

---

## 📜 Antes de empezar

Al contribuir, aceptas que tu aporte se distribuirá bajo la misma licencia del proyecto: **[Creative Commons BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0/)**.

Esto significa que:
- Cualquiera podrá usar, modificar y compartir tu aporte.
- Deberá darte crédito y compartir bajo la misma licencia.
- No puede aplicarle restricciones adicionales.

También aceptas que este proyecto sigue la **[Política de Creación de Fans de Innersloth](https://www.innersloth.com/fan-creation-policy/)**, así que **no se aceptan aportes que infrinjan esa política**.

---

## 🎯 Formas de contribuir

### 1. 📦 Aportar recursos al pack

¿Tienes memes, pinceles, plantillas, músicas, efectos, fondos, texturas, artes conceptuales...? ¡Genial!

**Requisitos:**
- ✅ Debes ser el autor original **o** tener permiso explícito del autor.
- ✅ El recurso no debe infringir derechos de autor de terceros.
- ✅ Debe ser **apto para todos los públicos** (nada NSFW, violento, discriminatorio, etc.).
- ✅ Debe estar relacionado con **Among Us** o con la temática del pack.
- ✅ Formato: PNG, JPG, MP3, WAV, PSD, AI, etc. (comprimido en .zip si son varios).

**Cómo enviarlo:**
1. Abre un [issue](https://github.com/leonelb2840-design/among-creators-pack/issues/new/choose) con la plantilla **"📦 Aportar un recurso"**.
2. Describe el recurso, adjunta un preview y el archivo.
3. Un miembro del equipo lo revisará y, si encaja, se añadirá al pack.

### 2. 🐛 Reportar bugs

¿Encontraste un error en la web, un enlace roto, un archivo dañado...?

1. Abre un [issue](https://github.com/leonelb2840-design/among-creators-pack/issues/new/choose) con la plantilla **"🐛 Reportar un error"**.
2. Describe **qué pasó**, **cómo reproducirlo** y **qué esperabas que pasara**.
3. Si puedes, adjunta captura de pantalla o el archivo afectado.

### 3. 💡 Sugerir mejoras

¿Tienes una idea para mejorar la web, el pack o el proyecto en general?

1. Abre un [issue](https://github.com/leonelb2840-design/among-creators-pack/issues/new/choose) con la plantilla **"💡 Sugerir una mejora"**.
2. Explica tu idea y por qué crees que aportaría valor.
3. Si es posible, incluye ejemplos o mockups.

### 4. 🔧 Contribuir código (web)

Si sabes HTML, CSS o JavaScript y quieres mejorar la página web:

1. Haz un **fork** del repositorio.
2. Crea una rama descriptiva: `git checkout -b mejora/tu-mejora`.
3. Realiza tus cambios siguiendo el estilo del proyecto (ver abajo).
4. Haz commit con mensajes claros: `feat: añadir modo oscuro` o `fix: corregir enlace roto`.
5. Abre un **Pull Request** explicando qué cambiaste y por qué.

### 5. 📝 Mejorar documentación

¿Ves algo confuso en el README, CHANGELOG o en la web? Puedes mejorarlo tú mismo con un PR.

### 6. 🎮 Ayudar en el Discord

Si eres activo en el **[servidor oficial de Discord](https://discord.gg/s24PZyMBmA)**, puedes ayudar respondiendo dudas de otros usuarios, compartiendo recursos o dando ideas.

---

## 🎨 Estilo del proyecto

### Código (HTML/CSS/JS)
- **Indentación**: 4 espacios.
- **Comillas**: dobles en HTML, simples en JS.
- **Nombres de clases CSS**: en kebab-case (`mi-clase`, `feedback-section`).
- **Nombres de variables JS**: camelCase (`miVariable`, `feedbackForm`).
- **Comentarios**: en español, claros y concisos.
- **Sin frameworks**: usamos vanilla JS + CSS puro. Si propones uno, justifícalo bien.

### Recursos
- **Nombres de archivos**: en kebab-case, sin espacios ni acentos.
  - ✅ `plantilla-crewmate-azul.png`
  - ❌ `Plantilla Crewmate Azul.PNG`
- **Carpetas**: organizadas por categoría (`memes/`, `pinceles/`, `plantillas/`, etc.).
- **Peso**: intenta que cada archivo pese menos de 5 MB cuando sea posible.
- **Formato**: PNG para imágenes con transparencia, JPG para fotos, MP3 para audio.

### Commits
Usamos [Conventional Commits](https://www.conventionalcommits.org/es/):
- `feat:` nueva funcionalidad
- `fix:` corrección de bug
- `docs:` cambios en documentación
- `style:` cambios de formato (sin afectar lógica)
- `refactor:` refactorización de código
- `chore:` tareas de mantenimiento

**Ejemplos:**
- `feat: añadir sección de historial de versiones`
- `fix: corregir enlace del acortador`
- `docs: actualizar CHANGELOG con la V2`

---

## 🚫 Qué NO aceptamos

- ❌ Recursos con copyright de terceros sin permiso.
- ❌ Contenido NSFW, violento, discriminatorio o ilegal.
- ❌ Aportes que infrinjan la política de fans de Innersloth.
- ❌ Spam, publicidad o autopromoción no relacionada con el proyecto.
- ❌ Código malicioso, trackers ocultos o scripts sospechosos.
- ❌ Uso comercial no autorizado de la marca Among Us.
- ❌ Contenido que promueva la piratería o la distribución ilegal.

---

## 📋 Proceso de revisión

1. Recibimos tu issue o PR.
2. Un miembro del equipo lo revisa en un plazo de **3 a 7 días**.
3. Si hay cambios necesarios, te los pedimos.
4. Una vez aprobado, se fusiona (PR) o se incorpora al pack (issue).
5. Tu nombre aparecerá en los créditos (si quieres).

---

## 🏆 Créditos

Todo contribuyente que aporte algo relevante será añadido a la sección de agradecimientos del proyecto ([`gracias.md`](./gracias.md)) o a los créditos del README, **salvo que prefiera permanecer en el anonimato**.

Si quieres que te acreditemos:
- **Con tu nombre real** → dinos cómo quieres aparecer.
- **Con tu usuario de GitHub** → lo tomamos automáticamente.
- **Con un seudónimo** → indícalo en tu aporte.
- **De forma anónima** → solo dinos "anónimo" y listo.

---

## 📬 Contacto

- **Issues**: [abrir issue](https://github.com/leonelb2840-design/among-creators-pack/issues/new/choose)
- **Repositorio**: [github.com/leonelb2840-design/among-creators-pack](https://github.com/leonelb2840-design/among-creators-pack)
- **Discord**: [Servidor oficial](https://discord.gg/s24PZyMBmA)
- **Formulario web**: en la [página principal](https://leonelb2840-design.github.io/among-creators-pack/#feedback) (con calificación de 1 a 5 estrellas)

---

## 💙 Gracias

Este proyecto no sería lo que es sin personas como tú dispuestas a aportar un granito de arena. **Cada meme, cada pincel, cada sugerencia cuenta.**

¡Bienvenido/a a bordo, crewmate! 🚀
