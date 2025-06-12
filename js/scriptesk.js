// קובץ: scriptesk.js

// פונקציית עזר: מקבלת את האימייל של המשתמש המחובר
function getCurrentUserEmail() {
    return localStorage.getItem('loggedInUserEmail') || sessionStorage.getItem('loggedInUserEmail');
}

// === רינדור טבלת משימות ===
function renderTaskTable() {
    const taskTableBody = document.querySelector("#taskTable tbody");
    const currentUserEmail = getCurrentUserEmail();
    // טיפול במקרה שאין משתמש מחובר
    if (!currentUserEmail) {
        if (taskTableBody) taskTableBody.innerHTML = `<tr><td colspan="6" style="text-align: center;">אנא התחבר/י כדי לראות את המשימות שלך.</td></tr>`;
        return;
    }

    // טוען משימות לפי האימייל של המשתמש
    let tasks = JSON.parse(localStorage.getItem(`tasks_${currentUserEmail}`)) || [];

    // לוגיקת חיפוש וסינון
    const searchInput = document.getElementById("searchInput");
    const filterStatus = document.getElementById("filterStatus");

    if (searchInput && searchInput.value.trim() !== "") {
        const searchTerm = searchInput.value.trim().toLowerCase();
        tasks = tasks.filter(task => 
            task.name.toLowerCase().includes(searchTerm) ||
            task.course.toLowerCase().includes(searchTerm) ||
            task.type.toLowerCase().includes(searchTerm)
        );
    }

    if (filterStatus && filterStatus.value !== "all") {
        tasks = tasks.filter(task => task.status === filterStatus.value);
    }


    if (taskTableBody) {
        if (tasks.length === 0) {
            taskTableBody.innerHTML = `<tr><td colspan="6" style="text-align: center;">אין משימות זמינות. הוסף משימה חדשה!</td></tr>`;
            return;
        }
        taskTableBody.innerHTML = tasks.map((task, index) =>
            `<tr>
                <td>${task.name}</td>
                <td>${task.course}</td>
                <td>${task.type}</td>
                <td>${task.date}</td>
                <td>
                    <button onclick="changeStatus(${index})" class="${task.status === 'הושלם' ? 'status-completed' : (task.status === 'בתהליך' ? 'status-in-progress' : 'status-open')}">
                        ${task.status}
                    </button>
                </td>
                <td>
                    <button onclick="deleteTask(${index})" class="delete-btn">מחק</button>
                </td>
            </tr>`
        ).join("");
    }
}

// === שינוי סטטוס משימה ===
function changeStatus(index) {
    const currentUserEmail = getCurrentUserEmail();
    // אין לבצע פעולה אם אין משתמש מחובר
    if (!currentUserEmail) return; 

    // טעינת המשימות לפי האימייל של המשתמש
    const tasks = JSON.parse(localStorage.getItem(`tasks_${currentUserEmail}`)) || [];
    const statuses = ["פתוח", "בתהליך", "הושלם"];
    const current = statuses.indexOf(tasks[index].status);
    tasks[index].status = statuses[(current + 1) % statuses.length];
    // שמירת המשימות המעודכנות לפי האימייל של המשתמש
    localStorage.setItem(`tasks_${currentUserEmail}`, JSON.stringify(tasks));
    renderTaskTable();
    window.dispatchEvent(new Event('storage')); // כדי לעדכן את הדאשבורד
}

// === מחיקת משימה ===
function deleteTask(index) {
    if (confirm("האם את/ה בטוח/ה שברצונך למחוק את המשימה?")) {
        const currentUserEmail = getCurrentUserEmail();
        // אין לבצע פעולה אם אין משתמש מחובר
        if (!currentUserEmail) return; 

        // טעינת המשימות לפי האימייל של המשתמש
        const tasks = JSON.parse(localStorage.getItem(`tasks_${currentUserEmail}`)) || [];
        tasks.splice(index, 1);
        // שמירת המשימות המעודכנות לפי האימייל של המשתמש
        localStorage.setItem(`tasks_${currentUserEmail}`, JSON.stringify(tasks));
        renderTaskTable();
        window.dispatchEvent(new Event('storage')); // כדי לעדכן את הדאשבורד
    }
}

// === הוספת משימה חדשה מהטופס ===
document.addEventListener("DOMContentLoaded", () => {
    renderTaskTable(); // טעינה ראשונית של הטבלה

    const form = document.getElementById("addTaskForm");
    if (form) {
        form.addEventListener("submit", (e) => {
            e.preventDefault();

            const currentUserEmail = getCurrentUserEmail();
            // דורש משתמש מחובר להוספת משימה
            if (!currentUserEmail) {
                alert("אנא התחבר/י כדי להוסיף משימות.");
                return;
            }

            const task = {
                name: document.getElementById("taskName").value.trim(),
                course: document.getElementById("taskCourse").value.trim(),
                type: document.getElementById("taskType").value,
                date: document.getElementById("taskDate").value,
                status: document.getElementById("taskStatus").value
            };

            if (!task.name || !task.course || !task.date) {
                alert("יש למלא את כל שדות החובה.");
                return;
            }

            // טעינת המשימות לפי האימייל של המשתמש
            const tasks = JSON.parse(localStorage.getItem(`tasks_${currentUserEmail}`)) || [];
            tasks.push(task);
            // שמירת המשימות לפי האימייל של המשתמש
            localStorage.setItem(`tasks_${currentUserEmail}`, JSON.stringify(tasks));

            alert("המשימה נוספה בהצלחה ✅");
            form.reset();
            renderTaskTable();
            window.dispatchEvent(new Event('storage')); // כדי לעדכן את הדאשבורד
        });
    }

    // === לוגיקת חיפוש וסינון ===
    const searchInput = document.getElementById("searchInput");
    const filterStatus = document.getElementById("filterStatus");

    if (searchInput) {
        searchInput.addEventListener("keyup", renderTaskTable);
    }
    if (filterStatus) {
        filterStatus.addEventListener("change", renderTaskTable);
    }
});