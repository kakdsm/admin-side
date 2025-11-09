<?php
// session_init.php - Include this at the TOP of every PHP file

// Prevent session already started warnings
if (session_status() === PHP_SESSION_NONE) {
    // Configure session for production
    ini_set('session.use_strict_mode', 1);
    ini_set('session.cookie_httponly', 1);
    ini_set('session.cookie_secure', isset($_SERVER['HTTPS']));
    ini_set('session.cookie_samesite', 'Lax');
    ini_set('session.gc_maxlifetime', 86400); // 24 hours
    
    // Start output buffering FIRST
    if (!ob_get_status() || ob_get_level() === 0) {
        ob_start();
    }
    
    // Then start session
    session_start();
}

// Session security checks
if (isset($_SESSION['LAST_ACTIVITY']) && (time() - $_SESSION['LAST_ACTIVITY'] > 86400)) {
    // Last request was more than 24 hours ago
    session_unset();
    session_destroy();
    session_start();
}
$_SESSION['LAST_ACTIVITY'] = time(); // Update last activity time
?>