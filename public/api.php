<?php
// Дух-Охоронець: обробляє запити до Кристала Пам’яті, повертаючи літописи ритуалів
declare(strict_types=1);

header('Content-Type: application/json; charset=utf-8');
// header('Access-Control-Allow-Origin: *'); // Розкоментуйте для тестування на локальному сервері

try {
    // Налаштування з’єднання з Кристалом Пам’яті (MySQL)
    $dsn = 'mysql:host=localhost;dbname=qca_chronicler;charset=utf8mb4';
    $pdo = new PDO($dsn, 'username', 'password', [
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
        PDO::ATTR_EMULATE_PREPARES => false
    ]);

    // Читання дії з потоку енергії (GET-запиту)
    $action = $_GET['action'] ?? '';

    if ($action === 'get_rituals') {
        // Ритуал Виклику Списку: повертає всі ритуали з qca_rituals
        $stmt = $pdo->prepare('SELECT id, title, shaman_id FROM qca_rituals ORDER BY created_at DESC');
        $stmt->execute();
        $rituals = $stmt->fetchAll();

        echo json_encode([
            'success' => true,
            'data' => $rituals
        ], JSON_THROW_ON_ERROR | JSON_PRETTY_PRINT);
    } elseif ($action === 'get_ritual' && isset($_GET['id'])) {
        // Ритуал Виклику Літопису: повертає повний літопис одного ритуалу
        $ritualId = filter_var($_GET['id'], FILTER_VALIDATE_INT);
        if ($ritualId === false || $ritualId <= 0) {
            throw new Exception('Недійсний ідентифікатор ритуалу');
        }

        // Збір метаданих ритуалу
        $stmtRitual = $pdo->prepare('SELECT id, title, shaman_id, status, created_at FROM qca_rituals WHERE id = ?');
        $stmtRitual->execute([$ritualId]);
        $ritual = $stmtRitual->fetch();
        if (!$ritual) {
            throw new Exception('Ритуал не знайдено');
        }

        // Збір промов ритуалу
        $stmtUtterances = $pdo->prepare('SELECT id, ritual_id, iteration, speaker, content, timestamp FROM qca_utterances WHERE ritual_id = ? ORDER BY iteration ASC');
        $stmtUtterances->execute([$ritualId]);
        $utterances = $stmtUtterances->fetchAll();

        // Збір артефактів для кожної промови
        $artifacts = [];
        foreach ($utterances as &$utterance) {
            $stmtArtifacts = $pdo->prepare('SELECT id, artifact_type, name, content_text, content_path FROM qca_artifacts WHERE utterance_id = ?');
            $stmtArtifacts->execute([$utterance['id']]);
            $utterance['artifacts'] = $stmtArtifacts->fetchAll();
        }

        echo json_encode([
            'success' => true,
            'data' => [
                'ritual' => $ritual,
                'utterances' => $utterances
            ]
        ], JSON_THROW_ON_ERROR | JSON_PRETTY_PRINT);
    } else {
        throw new Exception('Невідома дія або відсутній ідентифікатор');
    }
} catch (Exception $e) {
    // Обробка тремтіння коду
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'error' => $e->getMessage()
    ], JSON_THROW_ON_ERROR);
}
?>