const readline = require("readline");
const player = require("play-sound")((opts = {}));

class Alarm {
  constructor() {
    this.alarms = [];
    this.isRunning = false;
    this.activeAlarms = new Set();
  }

  addAlarm(time, message) {
    const [hours, minutes] = time.split(":").map(Number);

    if (!this.isValidTime(hours, minutes)) {
      throw new Error("Format waktu tidak valid. Gunakan format HH:MM");
    }

    const id = Date.now().toString();
    this.alarms.push({ id, time, message });
    console.log(`Alarm ditambahkan untuk ${time} dengan pesan: ${message}`);
    return id;
  }

  removeAlarm(id) {
    const index = this.alarms.findIndex((alarm) => alarm.id === id);
    if (index !== -1) {
      this.alarms.splice(index, 1);
      console.log(`Alarm dengan ID ${id} telah dihapus.`);
    } else {
      console.log(`Alarm dengan ID ${id} tidak ditemukan.`);
    }
  }

  listAlarms() {
    if (this.alarms.length === 0) {
      console.log("Tidak ada alarm yang diatur.");
    } else {
      console.log("Daftar Alarm:");
      this.alarms.forEach((alarm) => {
        console.log(
          `ID: ${alarm.id}, Waktu: ${alarm.time}, Pesan: ${alarm.message}`
        );
      });
    }
  }

  checkAlarms() {
    const now = new Date();
    const currentTime = `${now.getHours().toString().padStart(2, "0")}:${now
      .getMinutes()
      .toString()
      .padStart(2, "0")}`;

    this.alarms.forEach((alarm) => {
      if (alarm.time === currentTime && !this.activeAlarms.has(alarm.id)) {
        this.triggerAlarm(alarm);
      }
    });
  }

  triggerAlarm(alarm) {
    console.log(`\nALARM! ${alarm.message}`);
    this.activeAlarms.add(alarm.id);
    this.playAlarmSound();

    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
    });

    rl.question('Ketik "off" untuk mematikan alarm: ', (answer) => {
      if (answer.toLowerCase() === "off") {
        this.stopAlarm(alarm.id);
        player.play("./alarm_stop.mp3", (err) => {
          if (err) console.log(`Tidak dapat memainkan suara: ${err}`);
        });
      }
      rl.close();
    });
  }

  stopAlarm(id) {
    this.activeAlarms.delete(id);
    console.log(`Alarm dengan ID ${id} telah dimatikan.`);
  }

  playAlarmSound() {
    console.log("\u0007");
    console.log("DERING! DERING! DERING!");

    player.play("sound/alarm.m4a", (err) => {
      if (err) console.log(`Tidak dapat memainkan suara: ${err}`);
    });
  }

  isValidTime(hours, minutes) {
    return hours >= 0 && hours < 24 && minutes >= 0 && minutes < 60;
  }

  start() {
    if (!this.isRunning) {
      this.isRunning = true;
      this.intervalId = setInterval(() => this.checkAlarms(), 60000); // Cek setiap menit
      console.log("Sistem alarm telah dimulai.");
    } else {
      console.log("Sistem alarm sudah berjalan.");
    }
  }

  stop() {
    if (this.isRunning) {
      clearInterval(this.intervalId);
      this.isRunning = false;
      console.log("Sistem alarm telah dihentikan.");
    } else {
      console.log("Sistem alarm tidak sedang berjalan.");
    }
  }
}

function showMenu(alarm) {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  console.log("\n--- Menu Alarm ---");
  console.log("1. Tambah Alarm");
  console.log("2. Hapus Alarm");
  console.log("3. Lihat Daftar Alarm");
  console.log("4. Mulai Sistem Alarm");
  console.log("5. Hentikan Sistem Alarm");
  console.log("6. Keluar");

  rl.question("Pilih menu (1-6): ", (choice) => {
    switch (choice) {
      case "1":
        rl.question("Masukkan waktu alarm (HH:MM): ", (time) => {
          rl.question("Masukkan pesan alarm: ", (message) => {
            try {
              alarm.addAlarm(time, message);
            } catch (error) {
              console.log(error.message);
            }
            rl.close();
            showMenu(alarm);
          });
        });
        break;
      case "2":
        rl.question("Masukkan ID alarm yang akan dihapus: ", (id) => {
          alarm.removeAlarm(id);
          rl.close();
          showMenu(alarm);
        });
        break;
      case "3":
        alarm.listAlarms();
        rl.close();
        showMenu(alarm);
        break;
      case "4":
        alarm.start();
        rl.close();
        showMenu(alarm);
        break;
      case "5":
        alarm.stop();
        rl.close();
        showMenu(alarm);
        break;
      case "6":
        console.log(
          "Terima kasih telah menggunakan sistem alarm. Sampai jumpa!"
        );
        rl.close();
        process.exit(0);
      default:
        console.log("Pilihan tidak valid. Silakan coba lagi.");
        rl.close();
        showMenu(alarm);
    }
  });
}

const myAlarm = new Alarm();
console.log("Selamat datang di Sistem Alarm JavaScript!");
showMenu(myAlarm);
