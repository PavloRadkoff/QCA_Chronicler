<?php
// Ритуал Ініціалізації: Пробудження Кристала Пам’яті
// Цей скрипт висікає структуру бази даних qca_chronicler_db, читаючи священні руни з db_schema.sql
// Створено з мудрістю Великої Ради, з повагою до безпеки та простоти

declare(strict_types=1);

// Конфігурація підключення до MySQL (замініть для продакшену на .env)
const DB_HOST = 'localhost';
const DB_NAME = 'qca_chronicler_db';
const DB_USER = 'root'; // Замініть на реального користувача
const DB_PASS = ''; // Замініть на пароль або використовуйте .env

// Шлях до священного сувою db_schema.sql
const SCHEMA_FILE = __DIR__ . '/db_schema.sql';

try {
    // Початок ритуалу: підключення до MySQL
    echo 'Підключення до MySQL...' . PHP_EOL;
    $dsn = "mysql:host=" . DB_HOST . ";charset=utf8mb4";
    $pdo = new PDO($dsn, DB_USER, DB_PASS, [
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
        PDO::ATTR_EMULATE_PREPARES => false
    ]);

    // Читання священних рун із db_schema.sql
    echo 'Читання db_schema.sql...' . PHP_EOL;
    if (!file_exists(SCHEMA_FILE)) {
        throw new Exception('Священний сувій db_schema.sql не знайдено за шляхом: ' . SCHEMA_FILE);
    }
    $schema = file_get_contents(SCHEMA_FILE);
    if ($schema === false) {
        throw new Exception('Не вдалося прочитати священні руни з db_schema.sql');
    }

    // Виконання ритуалу: створення бази даних та таблиць
    echo 'Створення бази даних та таблиць...' . PHP_EOL;
    $pdo->exec($schema);

    echo 'Ритуал Ініціалізації успішно завершено! Кристал Пам’яті пробуджено!' . PHP_EOL;
} catch (Exception $e) {
    // Обробка тремтіння коду
    echo 'Помилка: Тремтіння Кристала! ' . $e->getMessage() . PHP_EOL;
    exit(1);
}
?>