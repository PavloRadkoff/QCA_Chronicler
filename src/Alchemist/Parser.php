<?php
// src/Alchemist/Parser.php
// Серце Алхіміка. Магія розділення Слова і Тіла.
// Хронікер, Фаза 1, Ітерація 2

namespace QCA\Alchemist;

use PDO;

class Parser
{
    private PDO $pdo;

    public function __construct(PDO $pdo)
    {
        $this->pdo = $pdo;
    }

    /**
     * Головний ритуал: приймає дані, розділяє і зберігає.
     * @param array $data Вхідний JSON-сувій
     * @return array Результат ритуалу
     */
    public function processAndStoreDialogue(array $data): array
    {
        // Перевірка вхідних даних
        if (!isset($data['ritual_title'], $data['shaman_id'], $data['dialogue'])) {
            return ['success' => false, 'message' => 'Не вистачає священних полів: ritual_title, shaman_id, dialogue.'];
        }

        $this->pdo->beginTransaction();

        try {
            // 1. Створюємо запис про Ритуал
            $stmt = $this->pdo->prepare(
                "INSERT INTO qca_rituals (title, shaman_id, status) VALUES (:title, :shaman_id, :status)"
            );
            $stmt->execute([
                ':title' => $data['ritual_title'],
                ':shaman_id' => $data['shaman_id'],
                ':status' => 'In Progress' // Поки що за замовчуванням
            ]);
            $ritualId = $this->pdo->lastInsertId();
            $utteranceCount = 0;
            $artifactCount = 0;

            // 2. У циклі обробляємо кожну Промову
            foreach ($data['dialogue'] as $iteration => $utterance) {
                // Розділяємо Слово і Тіло за допомогою магії Regex
                $pattern = '/```(\w*)\n(.*?)```/s';
                preg_match_all($pattern, $utterance['text'], $matches, PREG_SET_ORDER);
                
                $textContent = preg_replace($pattern, '', $utterance['text']);

                // 3. Зберігаємо Промову
                $stmt = $this->pdo->prepare(
                    "INSERT INTO qca_utterances (ritual_id, iteration, speaker, content) VALUES (:ritual_id, :iteration, :speaker, :content)"
                );
                $stmt->execute([
                    ':ritual_id' => $ritualId,
                    ':iteration' => $iteration + 1, // Ітерація починається з 1
                    ':speaker' => $utterance['speaker'],
                    ':content' => trim($textContent)
                ]);
                $utteranceId = $this->pdo->lastInsertId();
                $utteranceCount++;

                // 4. Зберігаємо знайдені Артефакти (блоки коду)
                foreach ($matches as $match) {
                    $language = $match[1] ?: 'plaintext';
                    $code = $match[2];

                    $stmt = $this->pdo->prepare(
                        "INSERT INTO qca_artifacts (utterance_id, artifact_type, name, content_text) VALUES (:utterance_id, :type, :name, :content)"
                    );
                    $stmt->execute([
                        ':utterance_id' => $utteranceId,
                        ':type' => 'Код_' . ucfirst($language),
                        ':name' => 'Артефакт з промови #' . $utteranceId,
                        ':content' => $code
                    ]);
                    $artifactCount++;
                }
            }

            $this->pdo->commit();

            return [
                'success' => true,
                'message' => 'Ритуал збереження завершено.',
                'ritual_id' => $ritualId,
                'utterances_saved' => $utteranceCount,
                'artifacts_saved' => $artifactCount
            ];

        } catch (\Exception $e) {
            $this->pdo->rollBack();
            return ['success' => false, 'message' => 'Тінь впала на ритуал: ' . $e->getMessage()];
        }
    }
}