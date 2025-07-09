// Дзеркало Спогадів: оживає, відображаючи літописи ритуалів
document.addEventListener('DOMContentLoaded', () => {
    // Ритуал Виклику Списку: отримує всі ритуали
    async function fetchRituals() {
        try {
            const response = await fetch('api.php?action=get_rituals');
            const result = await response.json();
            if (!result.success) {
                throw new Error(result.error || 'Помилка виклику ритуалів');
            }

            const ritualsList = document.getElementById('rituals-list');
            ritualsList.innerHTML = ''; // Очищення Дзеркала
            result.data.forEach(ritual => {
                const li = document.createElement('li');
                li.className = 'list-group-item';
                li.textContent = `${ritual.title} (Дух: ${ritual.shaman_id})`;
                li.dataset.ritualId = ritual.id;
                li.addEventListener('click', () => fetchRitualDetails(ritual.id));
                ritualsList.appendChild(li);
            });
        } catch (error) {
            console.error('Тремтіння коду:', error.message);
            document.getElementById('dialogue-display').innerHTML = '<p class="text-danger">Тремтіння коду: ' + error.message + '</p>';
        }
    }

    // Ритуал Виклику Літопису: отримує деталі одного ритуалу
    async function fetchRitualDetails(ritualId) {
        try {
            const response = await fetch(`api.php?action=get_ritual&id=${ritualId}`);
            const result = await response.json();
            if (!result.success) {
                throw new Error(result.error || 'Помилка виклику літопису');
            }

            const dialogueDisplay = document.getElementById('dialogue-display');
            dialogueDisplay.innerHTML = ''; // Очищення Дзеркала

            // Відображення метаданих ритуалу
            const ritual = result.data.ritual;
            const ritualHeader = document.createElement('h3');
            ritualHeader.textContent = `${ritual.title} (Дух: ${ritual.shaman_id}, Статус: ${ritual.status})`;
            dialogueDisplay.appendChild(ritualHeader);

            // Відображення промов та артефактів
            result.data.utterances.forEach(utterance => {
                const utteranceDiv = document.createElement('div');
                utteranceDiv.className = 'mb-3';
                utteranceDiv.innerHTML = `
                    <p><strong>${utterance.speaker}</strong> (${utterance.timestamp}):</p>
                    <p>${utterance.content}</p>
                `;

                // Відображення артефактів
                if (utterance.artifacts && utterance.artifacts.length > 0) {
                    utterance.artifacts.forEach(artifact => {
                        const artifactDiv = document.createElement('div');
                        artifactDiv.className = 'artifact mb-2';
                        artifactDiv.innerHTML = `
                            <p><strong>Артефакт:</strong> ${artifact.name} (${artifact.artifact_type})</p>
                            <pre><code>${artifact.content_text || 'Зовнішній артефакт: ' + artifact.content_path}</code></pre>
                        `;
                        utteranceDiv.appendChild(artifactDiv);
                    });
                }

                dialogueDisplay.appendChild(utteranceDiv);
            });
        } catch (error) {
            console.error('Тремтіння коду:', error.message);
            dialogueDisplay.innerHTML = '<p class="text-danger">Тремтіння коду: ' + error.message + '</p>';
        }
    }

    // Початок ритуалу: виклик списку ритуалів
    fetchRituals();
});