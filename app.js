// Душа Архіваріуса: Жива магія для відображення літописів Хронікера
// Переткано іскрою мудрості, щоб усунути Тремтіння Дзеркала і захистити від злих духів

// Руна Елемента: Захоплення ключових вузлів Зоряної Карти
const ritualsList = document.getElementById("ritualsList");
const ritualDetail = document.getElementById("ritualDetail");
const searchInput = document.getElementById("searchInput");

// Руна Захисту: Екранування HTML для захисту від злих духів (XSS)
function escapeHtml(unsafe) {
    if (typeof unsafe !== 'string') return '';
    return unsafe
         .replace(/&/g, "&amp;")
         .replace(/</g, "&lt;")
         .replace(/>/g, "&gt;")
         .replace(/"/g, "&quot;")
         .replace(/'/g, "&#039;");
}

// Ритуал Виклику: Завантаження ритуалів із Кристала Пам’яті
async function fetchRituals(query = "") {
    const url = query ? `api.php?action=search&q=${encodeURIComponent(query)}` : 'api.php?action=rituals';
    try {
        const res = await fetch(url);
        if (!res.ok) throw new Error(`Тремтіння мережі: ${res.status}`);
        const data = await res.json();
        if (data.status !== 'ok') throw new Error(data.message || 'Помилка отримання даних');
        
        renderRituals(data.rituals || []);
    } catch (error) {
        console.error("[Архіваріус] Тремтіння Кристала:", error.message);
        ritualsList.innerHTML = `<div class="card">Тіні завадили виклику ритуалів. Спробуйте ще раз.</div>`;
    }
}

// Руна Відображення: Рендеринг списку ритуалів
function renderRituals(rituals) {
    ritualDetail.classList.add("hidden"); // Приховуємо деталі
    ritualsList.classList.remove("hidden"); // Показуємо список
    
    ritualsList.innerHTML = ""; // Очищення Зоряної Карти
    if (!rituals || rituals.length === 0) {
        ritualsList.innerHTML = `<div class="card">Ритуалів не знайдено.</div>`;
        return;
    }

    rituals.forEach(r => {
        const card = document.createElement("div");
        card.className = "card";
        card.innerHTML = `
            <strong>${escapeHtml(r.title)}</strong><br/>
            Шаман: ${escapeHtml(r.shaman_id)}<br/>
            📅 ${new Date(r.created_at).toLocaleString()}
        `;
        card.onclick = () => showRitual(r.id);
        ritualsList.appendChild(card);
    });
}

// Ритуал Дзеркала: Відображення деталей одного ритуалу
async function showRitual(id) {
    ritualsList.classList.add("hidden"); // Приховуємо список
    ritualDetail.classList.remove("hidden"); // Показуємо деталі
    ritualDetail.innerHTML = `<div class="card">Завантаження літопису...</div>`;

    try {
        const res = await fetch(`api.php?action=ritual&id=${id}`);
        if (!res.ok) throw new Error(`Тремтіння мережі: ${res.statusText}`);
        const data = await res.json();
        
        if (data.status !== 'ok' || !data.ritual) {
            throw new Error(data.message || 'Не вдалося завантажити ритуал');
        }
        
        const ritualData = data.ritual;
        
        ritualDetail.innerHTML = `
            <button onclick="fetchRituals()">⬅ Назад до списку</button>
            <h2>${escapeHtml(ritualData.title)}</h2>
            <small>Шаман: ${escapeHtml(ritualData.shaman_id)} | ${new Date(ritualData.created_at).toLocaleString()}</small>
            <hr>
            ${ritualData.utterances.map(u => `
              <div class="card">
                <strong>${escapeHtml(u.speaker)}:</strong>
                <p>${escapeHtml(u.text).replace(/\n/g, '<br>')}</p>
                ${u.artifacts?.map(a => `<pre><code>${escapeHtml(a.content)}</code></pre>`).join('') || ''}
              </div>`).join('')}
        `;
    } catch (error) {
        console.error("Тремтіння при завантаженні ритуалу:", error);
        ritualDetail.innerHTML = `<div class="card">Помилка: ${error.message}</div><button onclick="fetchRituals()">⬅ Назад до списку</button>`;
    }
}

// Руна Пошуку: Дебонсинг для плавного пошуку
function debounce(fn, delay) {
    let t;
    return (...args) => {
        clearTimeout(t);
        t = setTimeout(() => fn(...args), delay);
    };
}

searchInput.addEventListener("input", debounce((e) => {
    const q = e.target.value;
    if (q.length === 0) {
        fetchRituals();
    } else if (q.length >= 2) {
        fetchRituals(q);
    }
}, 300));

// Початок Великого Ритуалу: перше пробудження Архіваріуса
fetchRituals();