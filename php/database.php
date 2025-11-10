<?php


// Get database credentials from environment variables
$DB_SERVER = getenv("MYSQLHOST");
$DB_USER   = getenv("MYSQLUSER");
$DB_PASS   = getenv("MYSQLPASSWORD");
$DB_NAME   = getenv("MYSQLDATABASE");
$DB_PORT   = getenv("MYSQLPORT") ?: 3306; // default port 3306 if not set

// ------------------- PDO Connection -------------------
try {
  $dbh = new PDO(
    "mysql:host={$DB_SERVER};port={$DB_PORT};dbname={$DB_NAME};charset=utf8mb4",
    $DB_USER,
    $DB_PASS,
    [
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION
    ]
);


} catch (PDOException $e) {
    exit("❌ PDO Connection Error: " . $e->getMessage());
}

// ------------------- MySQLi Connection -------------------
$con = mysqli_connect($DB_SERVER, $DB_USER, $DB_PASS, $DB_NAME, $DB_PORT);

if (!$con) {
    exit("❌ MySQLi Connection Error: " . mysqli_connect_error());
} else {
    
}
mysqli_set_charset($con, "utf8mb4"); // ✅ FIX
?>
