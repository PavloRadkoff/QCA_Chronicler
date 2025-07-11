<?php
header('Content-Type: application/json');
require_once 'db_config.php'; // підключення до БД через PDO

try {
    $pdo = new PDO($dsn, $db_user, $db_pass, [
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION
    ]);

    $action = $_GET['action'] ?? null;

    if ($action === 'rituals') {
        // --- Всі ритуали ---
        $stmt = $pdo->prepare("SELECT id, title, shaman_id, created_at FROM qca_rituals ORDER BY created_at DESC LIMIT 100");
        $stmt->execute();
        $rituals = $stmt->fetchAll(PDO::FETCH_ASSOC);
        echo json_encode(['status' => 'ok', 'rituals' => $rituals]);

    } elseif ($action === 'ritual' && isset($_GET['id'])) {
        // --- Один ритуал + utterances + artifacts ---
        $ritual_id = (int)$_GET['id'];

        $stmt = $pdo->prepare("SELECT id, title, shaman_id, created_at FROM qca_rituals WHERE id = ?");
        $stmt->execute([$ritual_id]);
        $ritual = $stmt->fetch(PDO::FETCH_ASSOC);

        if (!$ritual) {
            http_response_code(404);
            echo json_encode(['status' => 'not_found']);
            exit;
        }

        // промови
        $stmt = $pdo->prepare("SELECT id, speaker, content as text, timestamp FROM qca_utterances WHERE ritual_id = ? ORDER BY iteration ASC");
        $stmt->execute([$ritual_id]);
        $utterances = $stmt->fetchAll(PDO::FETCH_ASSOC);

        // артефакти
        $stmt = $pdo->prepare("SELECT id, utterance_id, content_text as content FROM qca_artifacts WHERE utterance_id IN (SELECT id FROM qca_utterances WHERE ritual_id = ?)");
        $stmt->execute([$ritual_id]);
        $artifacts = $stmt->fetchAll(PDO::FETCH_ASSOC);

        // згрупувати артефакти за utterance_id
        $artifactMap = [];
        foreach ($artifacts as $a) {
            $artifactMap[$a['utterance_id']][] = [
                'id' => $a['id'],
                'content' => $a['content']
            ];
        }

        foreach ($utterances as &$u) {
            $u['artifacts'] = $artifactMap[$u['id']] ?? [];
        }

        $ritual['utterances'] = $utterances;

        echo json_encode(['status' => 'ok', 'ritual' => $ritual]);

    } elseif ($action === 'search' && isset($_GET['q'])) {
        // --- Пошук по utterances.content або artifacts.content ---
        $q = '%' . $_GET['q'] . '%';

        $stmt = $pdo->prepare("
            SELECT DISTINCT r.id, r.title, r.shaman_id, r.created_at
            FROM qca_rituals r
            LEFT JOIN qca_utterances u ON r.id = u.ritual_id
            LEFT JOIN qca_artifacts a ON u.id = a.utterance_id
            WHERE u.content LIKE ? OR a.content_text LIKE ?
            ORDER BY r.created_at DESC
            LIMIT 50
        ");
        $stmt->execute([$q, $q]);
        $results = $stmt->fetchAll(PDO::FETCH_ASSOC);

        echo json_encode(['status' => 'ok', 'rituals' => $results]);

    } else {
        http_response_code(400);
        echo json_encode(['status' => 'error', 'message' => 'Invalid action']);
    }

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['status' => 'error', 'message' => $e->getMessage()]);
}
?>