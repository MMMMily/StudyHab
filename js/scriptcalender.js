// קובץ: scriptcalender.js

// פונקציית עזר: מקבלת את האימייל של המשתמש המחובר
function getCurrentUserEmail() {
    return localStorage.getItem('loggedInUserEmail') || sessionStorage.getItem('loggedInUserEmail');
}

// === שינוי כאן: אתחול API של גוגל רק אם יש משתמש מחובר ===
function initializeGoogleCalendarAPI() {
    const currentUserEmail = getCurrentUserEmail();
    if (!currentUserEmail) {
        console.log("אין משתמש מחובר לאתר. לא מאתחל Google Calendar API.");
        // אפשר להציג הודעה למשתמש בדף ה-HTML
        const calendarDiv = document.getElementById('calendar');
        if (calendarDiv) {
            calendarDiv.innerHTML = '<p style="text-align: center; margin-top: 2em;">אנא התחבר/י לאתר כדי לראות את היומן שלך.</p>';
        }
        return; // עוצר את האתחול
    }

    gapi.client.init({
      apiKey: 'YOUR_API_KEY',    // הכנס את המפתח API שלך כאן
      clientId: 'YOUR_CLIENT_ID', // הכנס את מזהה הלקוח שלך כאן
      scope: 'https://www.googleapis.com/auth/calendar.readonly',
    }).then(function () {
      // אם המשתמש כבר מחובר לחשבון גוגל שלו, יטען את היומן
      // אם לא, תהיה קריאה ל-gapi.auth2.getAuthInstance().signIn() כדי לאפשר התחברות
      console.log('Google API client initialized.');
      // אם האימות כבר בוצע, loadCalendar יפעל
      if (gapi.auth2.getAuthInstance().isSignedIn.get()) {
        loadCalendar();
      } else {
        // אם המשתמש לא מחובר לגוגל, ניתן להציג כפתור התחברות
        const calendarDiv = document.getElementById('calendar');
        if (calendarDiv) {
            calendarDiv.innerHTML = '<p style="text-align: center; margin-top: 2em;">אנא התחבר/י לחשבון Google כדי לראות את היומן שלך.</p><button id="authorize_button" style="display: block; margin: 1em auto;">התחבר/י ל-Google</button>';
            document.getElementById('authorize_button').addEventListener('click', handleAuthClick);
        }
      }
    }, function(error) {
        console.error("שגיאה באתחול Google API:", error);
        const calendarDiv = document.getElementById('calendar');
        if (calendarDiv) {
            calendarDiv.innerHTML = '<p style="text-align: center; margin-top: 2em; color: red;">שגיאה בטעינת היומן. וודא/י שמפתחות ה-API נכונים.</p>';
        }
    });
}

// === הוספת פונקציה לטיפול בכפתור ההתחברות לגוגל ===
function handleAuthClick() {
    gapi.auth2.getAuthInstance().signIn().then(function() {
        console.log("התחברת בהצלחה לחשבון Google.");
        loadCalendar();
    }, function(error) {
        console.error("שגיאה בהתחברות לחשבון Google:", error);
    });
}

// טוען את ה-API
function loadCalendar() {
    gapi.client.load('calendar', 'v3', function() {
      console.log('Google Calendar API loaded');
      getCalendarEvents();
    });
}

// אתחול ה-API
gapi.load('client:auth2', initializeGoogleCalendarAPI);

// פונקציה להציג אירועים ביומן
function getCalendarEvents() {
    var request = gapi.client.calendar.events.list({
      'calendarId': 'primary',   // לוח השנה הראשי
      'timeMin': (new Date()).toISOString(),
      'showDeleted': false,
      'singleEvents': true,
      'maxResults': 10,
      'orderBy': 'startTime'
    });

    request.execute(function(response) {
      var events = response.items;
      if (events && events.length > 0) { // וודא ש-events קיים ובעל איברים
        displayEvents(events);
      } else {
        console.log('לא נמצאו אירועים');
        // אפשר להציג הודעה למשתמש שאין אירועים
        document.getElementById('calendar').innerHTML = '<p style="text-align: center; margin-top: 2em;">אין אירועים קרובים ביומן גוגל שלך.</p>';
      }
    });
}

// פונקציה להציג את האירועים ביומן
function displayEvents(events) {
    var calendarDiv = document.getElementById('calendar');
    calendarDiv.innerHTML = '';

    events.forEach(function(event) {
      var eventDiv = document.createElement('div');
      eventDiv.classList.add('event');
      // עיצוב תאריך ושעה יפה יותר
      const eventDate = event.start.dateTime ? new Date(event.start.dateTime).toLocaleString('he-IL') : event.start.date;
      eventDiv.innerHTML = `<h3>${event.summary}</h3><p>${eventDate}</p>`;

      // מוסיף אירועים ללחיצה
      eventDiv.addEventListener('click', function() {
        showEventDetails(event);
      });

      calendarDiv.appendChild(eventDiv);
    });
}

// הצגת פרטי אירוע
function showEventDetails(event) {
    const eventDate = event.start.dateTime ? new Date(event.start.dateTime).toLocaleString('he-IL') : event.start.date;
    let details = `שם המשימה: ${event.summary}\n`;
    details += `תאריך/שעה: ${eventDate}\n`;
    if (event.location) {
        details += `מיקום: ${event.location}\n`;
    }
    if (event.description) {
        details += `תיאור: ${event.description}\n`;
    }
    alert(details);
}

// פונקציה למעבר בין חודשים (לוגיקה זו תצטרך להיות מפותחת יותר כדי לשלוט בתאריך הבקשה ל-Google API)
document.getElementById('prevMonth').addEventListener('click', function() {
    alert('מעבר לחודש קודם - יש לממש לוגיקה לשינוי טווח התאריכים ב-API');
});

document.getElementById('nextMonth').addEventListener('click', function() {
    alert('מעבר לחודש הבא - יש לממש לוגיקה לשינוי טווח התאריכים ב-API');
});

// עדכון לוח השנה (פונקציה זו כרגע אינה ממומשת באופן מלא לשליחת בקשה חדשה ל-Google API עם טווח תאריכים שונה)
function updateCalendar(newDate) {
    console.log('Update calendar to:', newDate);
    // getCalendarEvents(); // יטען את האירועים הנוכחיים, צריך לשנות את פרמטרי הבקשה
}