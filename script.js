if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('sw.js')
            .then(registration => console.log('✅ SW registrado:', registration.scope))
            .catch(error => console.warn('⚠️ Error SW:', error));
    });
}

const offlineBadge = document.getElementById('offlineBadge');

function updateOnlineStatus() {
    if (navigator.onLine) {
        offlineBadge.classList.remove('visible');
    } else {
        offlineBadge.classList.add('visible');
    }
}

window.addEventListener('online', updateOnlineStatus);
window.addEventListener('offline', updateOnlineStatus);
updateOnlineStatus();

const feedbackForm = document.getElementById('feedbackForm');

if (feedbackForm) {
    feedbackForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const btn = document.getElementById('feedbackBtn');
        const btnText = document.getElementById('feedbackBtnText');
        const note = document.getElementById('feedbackNote');

        btn.disabled = true;
        btn.style.opacity = '0.7';
        btnText.textContent = 'Enviando...';

        try {
            const formData = new FormData(feedbackForm);
            const response = await fetch(feedbackForm.action, {
                method: 'POST',
                body: formData,
                headers: { 'Accept': 'application/json' }
            });

            if (response.ok) {
                feedbackForm.innerHTML = `
                    <div class="feedback-success">
                        <span class="icon">✅</span>
                        <span>
                            <strong>¡Gracias por tu feedback!</strong><br>
                            Tu mensaje nos llegó correctamente. Lo leeremos con atención.
                        </span>
                    </div>
                `;
            } else {
                throw new Error('Error en el envío');
            }
        } catch (err) {
            btn.disabled = false;
            btn.style.opacity = '1';
            btnText.textContent = 'Enviar feedback';
            note.innerHTML = `
                <div class="feedback-error">
                    <span class="icon">⚠️</span>
                    <span>
                        <strong>No se pudo enviar.</strong><br>
                        Revisa tu conexión e inténtalo de nuevo.
                    </span>
                </div>
            `;
            console.error('Error al enviar feedback:', err);
        }
    });
}

let deferredPrompt;
window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredPrompt = e;
    console.log('💡 La PWA se puede instalar.');
});

window.addEventListener('appinstalled', () => {
    console.log('🎉 PWA instalada.');
    deferredPrompt = null;
});

(async () => {
    const contenedor = document.getElementById('novedadesContainer');
    if (!contenedor) return;

    try {
        const response = await fetch('novedades.md');
        if (!response.ok) throw new Error('No se pudo cargar novedades.md');

        const markdown = await response.text();
        contenedor.innerHTML = marked.parse(markdown);

        contenedor.querySelectorAll('a').forEach(a => {
            a.setAttribute('target', '_blank');
            a.setAttribute('rel', 'noopener noreferrer');
        });

    } catch (err) {
        console.error('Error cargando novedades:', err);
        contenedor.innerHTML = `
            <div class="version-loading" style="color:#ff6b6b;">
                ⚠️ No se pudieron cargar las novedades.
            </div>
        `;
    }
})();

(async () => {
    const picker = document.getElementById('collabPicker');
    const contenedor = document.getElementById('collabContainer');
    if (!picker || !contenedor) return;

    try {
        const response = await fetch('collab.md');
        if (!response.ok) throw new Error('No se pudo cargar collab.md');

        const markdown = await response.text();
        const collabs = parseCollabs(markdown);

        if (collabs.length === 0) {
            picker.innerHTML = '<div class="version-loading">Sin colaboraciones</div>';
            contenedor.innerHTML = '<div class="version-loading">Sin detalles</div>';
            return;
        }

        picker.innerHTML = '';
        collabs.forEach((c, i) => {
            const btn = document.createElement('button');
            btn.textContent = c.shortName;
            if (i === 0) btn.classList.add('active');
            btn.addEventListener('click', () => {
                document.querySelectorAll('.collab-picker button').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                renderCollab(c);
            });
            picker.appendChild(btn);
        });

        renderCollab(collabs[0]);

        function renderCollab(c) {
            contenedor.innerHTML = marked.parse(c.markdown);
            contenedor.querySelectorAll('a').forEach(a => {
                a.setAttribute('target', '_blank');
                a.setAttribute('rel', 'noopener noreferrer');
            });
        }

    } catch (err) {
        console.error('Error cargando colaboraciones:', err);
        picker.innerHTML = '<div class="version-loading">No se pudo cargar</div>';
        contenedor.innerHTML = `
            <div class="version-loading" style="color:#ff6b6b;">
                ⚠️ No se pudieron cargar las colaboraciones.
            </div>
        `;
    }

    function parseCollabs(md) {
        const collabs = [];
        const lines = md.split('\n');
        let current = null;

        for (let line of lines) {
            const titleMatch = line.match(/^#\s+(.+)$/);
            if (titleMatch) {
                if (current) collabs.push(current);
                current = { title: titleMatch[1].trim(), lines: [line] };
                continue;
            }
            if (current) current.lines.push(line);
        }
        if (current) collabs.push(current);

        return collabs.map(c => ({
            title: c.title,
            shortName: c.title.replace(/^[^\p{L}\p{N}]+/u, '').trim().split(/\s+/)[0] || c.title,
            markdown: c.lines.join('\n')
        }));
    }
})();

(async () => {
    const picker = document.getElementById('versionPicker');
    const detail = document.getElementById('versionDetail');

    if (!picker || !detail) return;

    const DOWNLOAD_LINKS = {
        'V2': 'https://drive.google.com/file/d/1de7nj_RgY870lfyF6xfqnPIWNGjPWJrb/view?usp=drivesdk',
        'V1': 'https://drive.google.com/file/d/1Ua0-AkPX7PCkbjRzYfHDdmhol2DjuIBl/view?usp=drivesdk',
        'V0.1': null
    };

    const CURRENT_VERSION = 'V2';
    const SKIP_VERSIONS = ['sin publicar', 'unreleased'];

    try {
        const response = await fetch('CHANGELOG.md');
        if (!response.ok) throw new Error('No se pudo cargar CHANGELOG.md');

        const markdown = await response.text();
        const versions = parseChangelog(markdown);

        if (versions.length === 0) {
            picker.innerHTML = '<div class="version-loading">Sin versiones registradas</div>';
            detail.innerHTML = '<div class="version-loading">Sin detalles disponibles</div>';
            return;
        }

        picker.innerHTML = '';
        versions.forEach((v, i) => {
            const btn = document.createElement('button');
            btn.textContent = v.version;
            btn.dataset.version = v.version;
            if (i === 0) btn.classList.add('active');
            btn.addEventListener('click', () => {
                document.querySelectorAll('.version-picker button').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                renderVersion(v);
            });
            picker.appendChild(btn);
        });

        renderVersion(versions[0]);

        function renderVersion(v) {
            const downloadUrl = DOWNLOAD_LINKS[v.version];
            const isCurrent = v.version === CURRENT_VERSION;

            let downloadHTML = '';
            if (downloadUrl) {
                const cls = isCurrent ? 'version-download current' : 'version-download old';
                const label = isCurrent ? '⬇️ Descargar versión actual' : `⬇️ Descargar ${v.version}`;
                downloadHTML = `<a href="${downloadUrl}" target="_blank" rel="noopener noreferrer" class="${cls}">${label}</a>`;
            } else {
                downloadHTML = `<span class="version-download old" style="cursor:default; opacity:0.6;">🚫 Sin descarga disponible</span>`;
            }

            let html = `<h3>${v.version} <span class="version-date">${v.date}</span></h3>`;

            if (v.sections.length === 0) {
                html += '<p>Sin cambios documentados.</p>';
            } else {
                v.sections.forEach(section => {
                    const icon = getSectionIcon(section.title);
                    html += `<h4>${icon} ${section.title} <span class="badge">${section.items.length}</span></h4>`;
                    html += '<ul>';
                    section.items.forEach(item => {
                        html += `<li>${formatItem(item)}</li>`;
                    });
                    html += '</ul>';
                });
            }

            html += downloadHTML;
            detail.innerHTML = html;
        }

    } catch (err) {
        console.error('Error cargando CHANGELOG:', err);
        picker.innerHTML = '<div class="version-loading">No se pudo cargar</div>';
        detail.innerHTML = `
            <div class="version-loading" style="color:#ff6b6b;">
                ⚠️ No se pudo cargar el historial de versiones.<br>
                <small>${err.message}</small>
            </div>
        `;
    }

    function parseChangelog(md) {
        const versions = [];
        const lines = md.split('\n');
        let currentVersion = null;
        let currentSection = null;

        for (let line of lines) {
            const versionMatch = line.match(/^##\s+\[?([^\]]+)\]?\s*(?:-\s*(.+))?$/);
            if (versionMatch) {
                const name = versionMatch[1].trim();
                const date = (versionMatch[2] || '').trim() || 'Sin fecha';

                if (SKIP_VERSIONS.some(s => name.toLowerCase().includes(s))) {
                    currentVersion = null;
                    currentSection = null;
                    continue;
                }

                currentVersion = { version: name, date, sections: [] };
                versions.push(currentVersion);
                currentSection = null;
                continue;
            }

            const sectionMatch = line.match(/^###\s+(.+)$/);
            if (sectionMatch && currentVersion) {
                currentSection = { title: sectionMatch[1].trim(), items: [] };
                currentVersion.sections.push(currentSection);
                continue;
            }

            const itemMatch = line.match(/^-\s+(.+)$/);
            if (itemMatch && currentSection) {
                currentSection.items.push(itemMatch[1].trim());
            }
        }

        return versions;
    }

    function getSectionIcon(title) {
        const t = title.toLowerCase();
        if (t.includes('añadido') || t.includes('agregado')) return '➕';
        if (t.includes('cambiado')) return '🔄';
        if (t.includes('corregido')) return '🐛';
        if (t.includes('eliminado')) return '🗑️';
        if (t.includes('obsoleto')) return '⚠️';
        if (t.includes('seguridad')) return '🔒';
        if (t.includes('próximamente') || t.includes('proximamente')) return '🔮';
        if (t.includes('notas') || t.includes('nota')) return '📝';
        return '📌';
    }

    function formatItem(text) {
        return text
            .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
            .replace(/\*(.+?)\*/g, '<em>$1</em>')
            .replace(/\[(.+?)\]\((.+?)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>')
            .replace(/`(.+?)`/g, '<code>$1</code>');
    }
})();