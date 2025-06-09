// ========== TITLE FOCUS TRACK STYLE ==========
function updateDocumentTitle() {
  if (remaining <= 0) {
    document.title = "✅ Waktu Belajar Selesai!";
    return;
  }
  const hrs = String(Math.floor(remaining / 3600)).padStart(2, '0');
  const mins = String(Math.floor((remaining % 3600) / 60)).padStart(2, '0');
  const secs = String(remaining % 60).padStart(2, '0');
  document.title = `${hrs}:${mins}:${secs} - Fokusin.`;
}

// ========== JAM REALTIME ==========
setInterval(() => {
  const now = new Date().toLocaleString("id-ID", { timeZone: "Asia/Jakarta" });
  document.getElementById("datetime").innerText = now;
}, 1000);

// ========== VARIABEL GLOBAL ==========
let interval;
let remaining = 0;
let isPaused = false;
let belajarLog = [];
let belajarDone = false;

// ========== POMODORO TIMER ==========
function updateCountdown() {
  const hrs = String(Math.floor(remaining / 3600)).padStart(2, '0');
  const mins = String(Math.floor((remaining % 3600) / 60)).padStart(2, '0');
  const secs = String(remaining % 60).padStart(2, '0');
  document.getElementById("countdown").innerText = `${hrs}:${mins}:${secs}`;
  updateDocumentTitle();

  const total = parseInt(document.getElementById("progressBar").max);
  document.getElementById("progressBar").value = total - remaining;

  if (remaining <= 0) {
    clearInterval(interval);
    const audio = new Audio("assets/audio/selesai.mp3");
    audio.play();

    setTimeout(() => {
      const subject = document.getElementById("subject").value || "Tidak diketahui";
      const progressMax = parseInt(document.getElementById("progressBar").max);
      const h = String(Math.floor(progressMax / 3600)).padStart(2, '0');
      const m = String(Math.floor((progressMax % 3600) / 60)).padStart(2, '0');
      const s = String(progressMax % 60).padStart(2, '0');

      belajarLog.push({
        subject: subject,
        duration: `${h}:${m}:${s}`
      });

      alert("✅ Waktu Belajar Selesai!");
      belajarDone = true;
      checkResumeReady();
    }, 3000);
  }
}

function startTimer() {
  if (!isPaused) {
    const subject = document.getElementById("subject").value.trim();
    if (!subject) {
      alert("Silakan Isi Mata Pelajaran Terlebih Dahulu!");
      return;
    }

    const h = parseInt(document.getElementById("hours").value) || 0;
    const m = parseInt(document.getElementById("minutes").value) || 0;
    const s = parseInt(document.getElementById("seconds").value) || 0;
    remaining = h * 3600 + m * 60 + s;

    if (remaining <= 0) {
      alert("Masukkan Waktu Belajar yang Valid!");
      return;
    }

    document.getElementById("progressBar").max = remaining;
  }

  isPaused = false;
  clearInterval(interval);
  interval = setInterval(() => {
    remaining--;
    updateCountdown();
  }, 1000);
  updateCountdown();
}

function pauseTimer() {
  isPaused = true;
  clearInterval(interval);
}

function resetTimer() {
  clearInterval(interval);
  isPaused = false;
  remaining = 0;
  document.getElementById("countdown").innerText = "00:00:00";
  document.getElementById("progressBar").value = 0;
  belajarDone = false;
  checkResumeReady();
  document.title = "Fokusin.";
}

// ========== TO-DO LIST ==========
document.getElementById("addTaskBtn").onclick = () => {
  const title = document.getElementById("taskTitle").value;
  const deadline = document.getElementById("taskDeadline").value;
  if (!title) return;

  const li = document.createElement("li");
  const input = document.createElement("input");
  input.type = "checkbox";

  input.addEventListener("change", function () {
    if (input.checked) {
      li.classList.add("completed");
      input.disabled = true;
    }
    checkResumeReady();
  });

  const text = document.createTextNode(` ${title} (Target: ${deadline || 'tanpa deadline'})`);
  li.appendChild(input);
  li.appendChild(text);

  document.getElementById("taskList").appendChild(li);
  document.getElementById("taskTitle").value = "";
  document.getElementById("taskDeadline").value = "";

  checkResumeReady();
};

// ========== DISTRAKSI TRACKER ==========
document.getElementById("distractBtn").onclick = () => {
  const alasan = prompt("Kenapa Terganggu?");
  if (!alasan) return;

  const li = document.createElement("li");
  li.textContent = alasan;
  document.getElementById("distraksiList").appendChild(li);

  checkResumeReady();
};

// ========== FOCUS MODE ==========
let isFull = false;
document.getElementById("focusModeBtn").onclick = () => {
  if (!isFull) {
    document.documentElement.requestFullscreen();
    isFull = true;
  } else {
    document.exitFullscreen();
    isFull = false;
  }
};

// ========== MUSIC ==========
let isMusicPlaying = false;
document.getElementById("playMusicBtn").onclick = () => {
  const player = document.getElementById("musicPlayer");
  if (!isMusicPlaying) {
    player.innerHTML = `<iframe width="100%" height="150" src="https://www.youtube.com/embed/jfKfPfyJRdk?autoplay=1" frameborder="0" allow="autoplay"></iframe>`;
    isMusicPlaying = true;
  } else {
    player.innerHTML = "";
    isMusicPlaying = false;
  }
};

// ========== CHECK BUTTON RESUME ==========
function checkResumeReady() {
  const allChecked = [...document.querySelectorAll('#taskList input[type="checkbox"]')].every(c => c.checked);
  const showResumeBtn = document.getElementById("showResume");

  if (belajarDone && allChecked) {
    showResumeBtn.classList.remove("btn-disabled");
    showResumeBtn.classList.add("btn-enabled");
    showResumeBtn.disabled = false;
    showResumeBtn.addEventListener("click", showDailyResume);
  } else {
    showResumeBtn.classList.add("btn-disabled");
    showResumeBtn.classList.remove("btn-enabled");
    showResumeBtn.disabled = true;
    showResumeBtn.removeEventListener("click", showDailyResume);
  }
}

// ========== RESUME HARIAN ==========
function showDailyResume() {
  const date = new Date().toLocaleDateString("id-ID", { timeZone: "Asia/Jakarta" });
  document.getElementById("resumeDate").textContent = date;

  const belajarList = document.getElementById("resumeBelajarList");
  belajarList.innerHTML = "";
  if (belajarLog.length === 0) {
    belajarList.innerHTML = `<li>Belum ada Sesi Belajar Hari Ini.</li>`;
  } else {
    belajarLog.forEach(log => {
      const li = document.createElement("li");
      li.innerHTML = `Kamu Sudah Belajar Selama ${log.duration} Untuk Mata Pelajaran:<br>– ${log.subject}`;
      belajarList.appendChild(li);
    });
  }

  const todoItems = document.querySelectorAll("#taskList li");
  const resumeTodoList = document.getElementById("resumeTodoList");
  resumeTodoList.innerHTML = "";

  if (todoItems.length === 0) {
    resumeTodoList.innerHTML = `<li>Belum ada Kegiatan Hari Ini ❌</li>`;
  } else {
    todoItems.forEach(li => {
      resumeTodoList.innerHTML += `<li>${li.textContent.trim()}</li>`;
    });
  }

  const distraksiItems = document.querySelectorAll("#distraksiList li");
  const ulDistraksi = document.getElementById("resumeDistraksiList");
  ulDistraksi.innerHTML = "";

  if (distraksiItems.length === 0) {
    ulDistraksi.innerHTML = "<li>Tidak ada Distraksi 🎉</li>";
  } else {
    distraksiItems.forEach(li => {
      ulDistraksi.innerHTML += `<li>${li.textContent.trim()}</li>`;
    });
  }

  const showResumeBtn = document.getElementById("showResume");
  showResumeBtn.classList.add("btn-disabled");
  showResumeBtn.classList.remove("btn-enabled");
  showResumeBtn.disabled = true;
  showResumeBtn.removeEventListener("click", showDailyResume);
}

// ========== BUTTON EVENTS ==========
document.getElementById("startBtn").addEventListener("click", startTimer);
document.getElementById("pauseBtn").addEventListener("click", pauseTimer);
document.getElementById("resetBtn").addEventListener("click", resetTimer);

// ========== SETUP AWAL ==========
checkResumeReady();