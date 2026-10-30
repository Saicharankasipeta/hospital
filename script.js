
// Mobile Navigation
const menuBtn = document.getElementById("menuBtn");
const navLinks = document.getElementById("navLinks");

menuBtn.addEventListener("click", () => {
    navLinks.classList.toggle("active");
});

document.querySelectorAll("#navLinks a").forEach(link => {
    link.addEventListener("click", () => {
        navLinks.classList.remove("active");
    });
});

// Set minimum appointment date to today
const dateInput = document.getElementById("date");

const today = new Date();
const localToday = [
    today.getFullYear(),
    String(today.getMonth() + 1).padStart(2, "0"),
    String(today.getDate()).padStart(2, "0")
].join("-");

dateInput.min = localToday;

// Select doctor from doctor profile
function selectDoctor(name, department) {
    document.getElementById("doctor").value = name;
    document.getElementById("department").value = department;

    document.getElementById("appointment").scrollIntoView({
        behavior: "smooth"
    });
}

// Get saved appointments
function getAppointments() {
    return JSON.parse(localStorage.getItem("hospitalAppointments")) || [];
}

// Appointment Form Submission
const appointmentForm = document.getElementById("appointmentForm");

appointmentForm.addEventListener("submit", function(event) {

    event.preventDefault();

    const patientName = document.getElementById("patientName").value.trim();
    const phone = document.getElementById("phone").value.trim();
    const email = document.getElementById("email").value.trim();
    const age = document.getElementById("age").value;
    const gender = document.getElementById("gender").value;
    const department = document.getElementById("department").value;
    const doctor = document.getElementById("doctor").value;
    const date = document.getElementById("date").value;
    const time = document.getElementById("time").value;
    const reason = document.getElementById("reason").value.trim();

    // Validate phone number
    if (!/^[6-9][0-9]{9}$/.test(phone)) {
        alert("Please enter a valid 10-digit Indian mobile number.");
        return;
    }

    // Validate date
    if (date < localToday) {
        alert("Please select today or a future date.");
        return;
    }

    // Prevent booking a past time today
    if (date === localToday) {

        const [timePart, period] = time.split(" ");
        let [hours, minutes] = timePart.split(":").map(Number);

        if (period === "PM" && hours !== 12) hours += 12;
        if (period === "AM" && hours === 12) hours = 0;

        const selectedDateTime = new Date();
        selectedDateTime.setHours(hours, minutes, 0, 0);

        if (selectedDateTime <= new Date()) {
            alert("This appointment time has already passed. Please select another time.");
            return;
        }
    }

    // Check for an existing appointment slot
    const appointments = getAppointments();

    const slotTaken = appointments.some(appointment =>
        appointment.doctor === doctor &&
        appointment.date === date &&
        appointment.time === time
    );

    if (slotTaken) {
        alert("This doctor's selected time slot is already booked. Please choose another time.");
        return;
    }

    // Create appointment ID
    const appointmentID = "HCP" + Date.now().toString().slice(-8);

    // Appointment Object
    const appointment = {
        appointmentID,
        patientName,
        phone,
        email,
        age,
        gender,
        department,
        doctor,
        date,
        time,
        reason,
        status: "Pending"
    };

    // Save to Local Storage
    appointments.push(appointment);

    localStorage.setItem(
        "hospitalAppointments",
        JSON.stringify(appointments)
    );

    // Display confirmation
    document.getElementById("appointmentDetails").innerHTML = `
        <strong>Appointment ID:</strong> ${appointmentID}<br>
        <strong>Patient:</strong> ${patientName}<br>
        <strong>Doctor:</strong> ${doctor}<br>
        <strong>Department:</strong> ${department}<br>
        <strong>Date:</strong> ${date}<br>
        <strong>Time:</strong> ${time}<br>
        <strong>Status:</strong> Pending
    `;

    document.getElementById("confirmationModal").classList.add("show");

    appointmentForm.reset();

});

// Close Confirmation Modal
function closeModal() {
    document.getElementById("confirmationModal").classList.remove("show");
}

// Close modal when clicking outside
document.getElementById("confirmationModal").addEventListener("click", function(event) {
    if (event.target === this) {
        closeModal();
    }
});
