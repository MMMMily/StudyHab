// קובץ: loginscript.js
document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('loginForm');
    const errorMsg = document.getElementById('errorMsg');

    // הצגת הודעה לאחר הרשמה מוצלחת
    if (localStorage.getItem('registeredSuccessfully')) {
        alert('ההרשמה הושלמה בהצלחה! אנא התחבר/י.');
        localStorage.removeItem('registeredSuccessfully'); // מחיקת הדגל
    }

    if (loginForm) { 
        loginForm.addEventListener('submit', (event) => {
            event.preventDefault();
            const emailInput = document.getElementById('email');
            const passwordInput = document.getElementById('password');
            const rememberMeCheckbox = document.getElementById('rememberMe'); 

            const email = emailInput.value.trim();
            const password = passwordInput.value.trim();
            const rememberMe = rememberMeCheckbox ? rememberMeCheckbox.checked : false; // בודק אם הצ'קבוקס קיים

            const users = JSON.parse(localStorage.getItem('users')) || [];
            const foundUser = users.find(user => user.email === email && user.password === password);

            if (foundUser) {
                if (rememberMe) {
                    localStorage.setItem('loggedInUserEmail', foundUser.email);
                    localStorage.setItem('loggedInUsername', foundUser.username);
                } else {
                    localStorage.removeItem('loggedInUserEmail');
                    localStorage.removeItem('loggedInUsername');
                    sessionStorage.setItem('loggedInUserEmail', foundUser.email);
                    sessionStorage.setItem('loggedInUsername', foundUser.username);
                }
                errorMsg.textContent = ''; // ניקוי הודעות שגיאה
                alert('התחברת בהצלחה! 👋');
                window.location.href = 'index.html'; // מעבר לדשבורד
            } else {
                errorMsg.textContent = 'כתובת אימייל או סיסמה שגויים.';
            }
        });
    }

    // קישורי ניווט (אם הם ספציפיים רק לדף ההתחברות, השאר אותם כאן)
    const forgotPasswordLink = document.querySelector('a[href="forgot-password.html"]');
    const registerLink = document.querySelector('a[href="register.html"]');

    if (forgotPasswordLink) {
        forgotPasswordLink.addEventListener('click', (event) => {
            event.preventDefault();
            window.location.href = 'forgot-password.html';
            console.log('נלחץ על "שכחתי סיסמה"');
        });
    }

    if (registerLink) {
        registerLink.addEventListener('click', (event) => {
            event.preventDefault();
            window.location.href = 'register.html';
            console.log('נלחץ על "הרשמה"');
        });
    }
});