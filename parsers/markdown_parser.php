<?php
// Магія Розбору: Парсер для Алхіміка
// Перетворює markdown-подібний текст на структуровані промови та артефакти
declare(strict_types=1);

/**
 * Парсить діалог, виділяючи текст і блоки коду
 * @param array $dialogue Масив діалогу [{speaker, content}, ...]
 * @return array Масив [{speaker, text, artifacts: []}, ...]
 */
function parseDialogue(array $dialogue): array {
    $result = [];
    
    foreach ($dialogue as $entry) {
        if (!isset($entry['speaker'], $entry['content']) || 
            !is_string($entry['speaker']) || 
            !is_string($entry['content'])) {
            throw new Exception('Некоректна структура блоку діалогу');
        }

        $content = $entry['content'];
        $artifacts = [];
        $text = '';

        // Регулярний вираз для пошуку блоків коду (```...```)
        $pattern = '/```(?:\w+)?\s*([\s\S]*?)```/';
        $lastPos = 0;
        preg_match_all($pattern, $content, $matches, PREG_OFFSET_CAPTURE);

        // Обробка тексту та артефактів
        foreach ($matches[0] as $index => $match) {
            $codeBlock = $matches[1][$index][0];
            $startPos = $match[1];
            $text .= substr($content, $lastPos, $startPos - $lastPos);
            $artifacts[] = trim($codeBlock);
            $lastPos = $startPos + strlen($match[0]);
        }
        $text .= substr($content, $lastPos);
        $text = trim($text);

        $result[] = [
            'speaker' => $entry['speaker'],
            'text' => $text,
            'artifacts' => $artifacts
        ];
    }

    return $result;
}
?>