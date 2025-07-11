// Душа Вівтаря: Жива магія Дихаючого Вівтаря
// Керує пам’яттю (localStorage), рендерингом, CRUD і налаштуваннями
document.addEventListener('DOMContentLoaded', () => {
    // --- Руна Пам’яті: Константа та сховище ---
    const STORAGE_KEY = 'qcaVivtarConfig';
    const defaultConfig = {
        settings: {
            theme: 'dark',
            columns: 3,
            backgroundImage: '',
            showLogo: true
        },
        categories: [
            {
                name: 'Інструменти та Довідка',
                bookmarks: [
                    { name: 'GitHub', url: 'https://github.com' },
                    { name: 'MDN Web Docs', url: 'https://developer.mozilla.org' },
                    { name: 'Stack Overflow', url: 'https://stackoverflow.com' }
                ]
            },
            {
                name: 'Пошукові Портали',
                bookmarks: [
                    { name: 'Google', url: 'https://www.google.com' },
                    { name: 'DuckDuckGo', url: 'https://duckduckgo.com' }
                ]
            }
        ]
    };

    let config;

    // --- Ритуал Завантаження: Пробудження Кристала Пам’яті ---
    function loadConfig() {
        const storedConfig = localStorage.getItem(STORAGE_KEY);
        config = storedConfig ? JSON.parse(storedConfig) : defaultConfig;
        saveConfig(); // Зберігаємо, щоб ініціалізувати, якщо сховище порожнє
    }

    // --- Ритуал Збереження: Запис у Кристал Пам’яті ---
    function saveConfig() {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
    }

    // --- Ритуал Рендерингу: Відображення Зоряної Карти ---
    function renderVivtar() {
        const vivtarContainer = document.getElementById('vivtar-container');
        vivtarContainer.innerHTML = ''; // Очищення Вівтаря

        // Застосування налаштувань
        document.documentElement.style.setProperty('--vivtar-columns', config.settings.columns);
        document.documentElement.style.setProperty('--vivtar-bg-image', config.settings.backgroundImage ? `url(${config.settings.backgroundImage})` : 'none');
        document.body.className = config.settings.theme === 'light' ? 'light-theme' : '';
        document.getElementById('totem').className = config.settings.showLogo ? '' : 'hidden';
        
        // Оновлення елементів керування
        document.getElementById('columns-input').value = config.settings.columns;
        document.getElementById('bg-image-input').value = config.settings.backgroundImage;
        document.getElementById('theme-toggle').checked = config.settings.theme === 'light';
        document.getElementById('totem-toggle').checked = config.settings.showLogo;

        const categoryList = document.getElementById('category-list');
        categoryList.innerHTML = '';
        config.categories.forEach(category => {
            const option = document.createElement('option');
            option.value = category.name;
            categoryList.appendChild(option);
        });

        config.categories.forEach((category, catIndex) => {
            const section = document.createElement('section');
            const categoryTitle = document.createElement('h2');
            categoryTitle.textContent = category.name;
            section.appendChild(categoryTitle);

            category.bookmarks.forEach((bookmark, bmIndex) => {
                const link = document.createElement('a');
                link.className = 'bookmark';
                link.href = bookmark.url;
                link.target = '_blank';

                const favicon = document.createElement('img');
                favicon.className = 'favicon';
                favicon.src = `https://www.google.com/s2/favicons?sz=32&domain_url=${bookmark.url}`;
                favicon.alt = '';

                const name = document.createElement('span');
                name.textContent = bookmark.name;
                
                link.appendChild(favicon);
                link.appendChild(name);
                
                const actions = createBookmarkActions(catIndex, bmIndex);
                link.appendChild(actions);
                section.appendChild(link);
            });
            vivtarContainer.appendChild(section);
        });
    }
    
    // --- Ритуал Створення Дій: Кнопки для плиток ---
    function createBookmarkActions(catIndex, bmIndex) {
        const actions = document.createElement('div');
        actions.className = 'bookmark-actions';
        
        const editBtn = document.createElement('button');
        editBtn.textContent = '✏️';
        editBtn.title = 'Редагувати';
        editBtn.onclick = (e) => { e.preventDefault(); handleEditBookmark(catIndex, bmIndex); };

        const deleteBtn = document.createElement('button');
        deleteBtn.textContent = '🗑️';
        deleteBtn.title = 'Видалити';
        deleteBtn.onclick = (e) => { e.preventDefault(); handleDeleteBookmark(catIndex, bmIndex); };
        
        actions.appendChild(editBtn);
        actions.appendChild(deleteBtn);
        return actions;
    }

    // --- Ритуали Керування: CRUD та Налаштування ---
    const modal = document.getElementById('bookmark-modal');
    const form = document.getElementById('bookmark-form');
    const modalTitle = document.getElementById('modal-title');
    let editState = null; // { catIndex, bmIndex }

    function handleAddBookmark() {
        editState = null;
        modalTitle.textContent = 'Додати Нову Зірку';
        form.reset();
        modal.showModal();
    }
    
    function handleEditBookmark(catIndex, bmIndex) {
        editState = { catIndex, bmIndex };
        modalTitle.textContent = 'Редагувати Зірку';
        const bookmark = config.categories[catIndex].bookmarks[bmIndex];
        document.getElementById('category-input').value = config.categories[catIndex].name;
        document.getElementById('name-input').value = bookmark.name;
        document.getElementById('url-input').value = bookmark.url;
        modal.showModal();
    }

    function handleDeleteBookmark(catIndex, bmIndex) {
        if (confirm(`Стерти зірку "${config.categories[catIndex].bookmarks[bmIndex].name}" з небес?`)) {
            config.categories[catIndex].bookmarks.splice(bmIndex, 1);
            if (config.categories[catIndex].bookmarks.length === 0) {
                config.categories.splice(catIndex, 1);
            }
            saveConfig();
            renderVivtar();
        }
    }
    
    form.addEventListener('submit', (e) => {
        e.preventDefault();
        const categoryName = document.getElementById('category-input').value.trim();
        const name = document.getElementById('name-input').value.trim();
        const url = document.getElementById('url-input').value.trim();

        if (!categoryName || !name || !url) return;
        
        const newBookmark = { name, url };

        if (editState) { // Режим редагування
            const originalCategoryName = config.categories[editState.catIndex].name;
            // Видаляємо стару закладку
            config.categories[editState.catIndex].bookmarks.splice(editState.bmIndex, 1);
             if (config.categories[editState.catIndex].bookmarks.length === 0) {
                config.categories.splice(editState.catIndex, 1);
            }
        }
        
        // Додаємо як нову (дозволяє зміну категорії)
        let categoryObj = config.categories.find(c => c.name === categoryName);
        if (!categoryObj) {
            categoryObj = { name: categoryName, bookmarks: [] };
            config.categories.push(categoryObj);
        }
        categoryObj.bookmarks.push(newBookmark);
        
        saveConfig();
        renderVivtar();
        modal.close();
    });

    // --- Прив'язка ритуалів до елементів керування ---
    document.getElementById('add-bookmark-btn').onclick = handleAddBookmark;
    document.getElementById('cancel-btn').onclick = () => modal.close();

    document.getElementById('columns-input').addEventListener('input', e => {
        config.settings.columns = parseInt(e.target.value);
        saveConfig();
        renderVivtar();
    });

    document.getElementById('bg-image-input').addEventListener('change', e => {
        config.settings.backgroundImage = e.target.value;
        saveConfig();
        renderVivtar();
    });

    document.getElementById('theme-toggle').addEventListener('change', e => {
        config.settings.theme = e.target.checked ? 'light' : 'dark';
        saveConfig();
        renderVivtar();
    });

    document.getElementById('totem-toggle').addEventListener('change', e => {
        config.settings.showLogo = e.target.checked;
        saveConfig();
        renderVivtar();
    });

    // --- Початок Великого Ритуалу: перше пробудження Вівтаря ---
    loadConfig();
    renderVivtar();
});