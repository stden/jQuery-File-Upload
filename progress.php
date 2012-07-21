<?php
session_start();

$s = $_SESSION['upload_progress_' . $_GET['PHP_SESSION_UPLOAD_PROGRESS']];
$progress = array(
    'lengthComputable' => true,
    'loaded' => $s['bytes_processed'],
    'total' => $s['content_length']
);
echo json_encode($progress);