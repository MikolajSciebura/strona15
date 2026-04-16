<?php
session_start();

use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\Exception;

require 'PHPMailer/src/Exception.php';
require 'PHPMailer/src/PHPMailer.php';
require 'PHPMailer/src/SMTP.php';

// 🔒 LIMIT 1/MIN
if (isset($_SESSION['last_submit'])) {
    if (time() - $_SESSION['last_submit'] < 60) {
        die("Możesz wysłać formularz raz na 60 sekund");
    }
}

// 🔒 HONEYPOT
if (!empty($_POST['website'])) {
    die("Spam wykryty");
}

// 📌 Typ formularza
$formType = $_POST['form-type'] ?? 'valuation';

// 📧 PHPMailer
$mail = new PHPMailer(true);

try {
    $mail->isSMTP();
    $mail->Host = 'smtp.gmail.com';
    $mail->SMTPAuth = true;
    $mail->Username = 'dawdancars.skup.aut@gmail.com';
    $mail->Password = 'ftzg kdpg dagz qpim'; // App Password
    $mail->SMTPSecure = 'tls';
    $mail->Port = 587;

    $mail->setFrom('dawdancars.skup.aut@gmail.com', 'Formularz Strony');
    $mail->addAddress('dawdancars.skup.aut@gmail.com');

    // 🔹 Poprawne kodowanie i HTML
    $mail->CharSet = 'UTF-8';
    $mail->isHTML(true);

    if ($formType === 'contact') {
        // 📝 Formularz kontaktowy
        $name = trim($_POST['name'] ?? '');
        $email = trim($_POST['email'] ?? '');
        $phone = trim($_POST['phone'] ?? '');
        $subjectForm = trim($_POST['subject'] ?? '');
        $message = trim($_POST['message'] ?? '');

        if (!$name || !$email || !$message) die("Brak wymaganych danych");
        if (!filter_var($email, FILTER_VALIDATE_EMAIL)) die("Niepoprawny email");

        $mail->Subject = 'Nowa wiadomość (formularz kontaktowy)';
        $mail->Body = "
            <h2>Nowa wiadomość</h2>
            <b>Imię:</b> $name <br>
            <b>Email:</b> $email <br>
            <b>Telefon:</b> $phone <br>
            <b>Temat:</b> $subjectForm <br>
            <b>Wiadomość:</b><br> $message
        ";

    } else {
        // 🚗 Formularz wyceny auta
        $brand = trim($_POST['brand-model'] ?? '');
        $year = intval($_POST['year'] ?? 0);
        $mileage = trim($_POST['mileage'] ?? '');
        $engine = trim($_POST['engine'] ?? '');
        $fuel = trim($_POST['fuel'] ?? '');
        $gearbox = trim($_POST['gearbox'] ?? '');
        $damaged = trim($_POST['damaged'] ?? 'Nie');
        $description = trim($_POST['description'] ?? '');
        $phone = trim($_POST['phone'] ?? '');

        if (!$brand || !$year || !$phone) die("Brak wymaganych danych");
        if (!preg_match('/^[0-9+\s-]{6,20}$/', $phone)) die("Niepoprawny numer telefonu");

        $mail->Subject = 'Nowa wycena auta';
        $mail->Body = "
            <h2>Nowe zgłoszenie</h2>
            <b>Marka i model:</b> $brand <br>
            <b>Rok:</b> $year <br>
            <b>Przebieg:</b> $mileage km <br>
            <b>Silnik:</b> $engine <br>
            <b>Paliwo:</b> $fuel <br>
            <b>Skrzynia:</b> $gearbox <br>
            <b>Uszkodzony:</b> $damaged <br>
            <b>Opis:</b> $description <br>
            <b>Telefon:</b> $phone
        ";

        // 📸 Załączniki
        $maxFiles = 5;
        $maxSize = 5 * 1024 * 1024;
        $allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];

        if (!empty($_FILES['photos']['name'][0])) {
            if (count($_FILES['photos']['name']) > $maxFiles) die("Max 5 zdjęć");

            foreach ($_FILES['photos']['tmp_name'] as $key => $tmp) {
                $type = $_FILES['photos']['type'][$key];
                $size = $_FILES['photos']['size'][$key];

                if (!in_array($type, $allowedTypes)) die("Niepoprawny typ pliku");
                if ($size > $maxSize) die("Plik za duży (max 5MB)");

                $mail->addAttachment($tmp, $_FILES['photos']['name'][$key]);
            }
        }
    }

    $mail->send();
    $_SESSION['last_submit'] = time();
    echo "OK";

} catch (Exception $e) {
    http_response_code(500);
    echo "Błąd: {$mail->ErrorInfo}";
}
