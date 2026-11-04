(function () {
  const app = window.smartCareApp;
  app.modules = app.modules || {};

  function render() {
    const state = app.state;
    const totalPatients = state.patients.length;
    const totalDoctors = state.doctors.length;
    const today = new Date().toISOString().slice(0, 10);
    const todaysAppointments = state.appointments.filter((item) => item.date === today).length;
    const availableBeds = state.beds.filter((item) => item.status === 'available').length;
    const occupiedBeds = state.beds.filter((item) => item.status === 'occupied').length;
    const totalRevenue = state.invoices.reduce((sum, item) => sum + Number(item.total || 0), 0);
    const pendingPayments = state.invoices.filter((item) => item.status !== 'Paid').reduce((sum, item) => sum + Number(item.total || 0), 0);
    const emergencyCases = state.patients.filter((item) => item.status === 'Emergency').length;

    const stats = [
      { label: 'Total Patients', value: totalPatients, trend: '+8.2%', type: 'up' },
      { label: 'Total Doctors', value: totalDoctors, trend: '+4.1%', type: 'up' },
      { label: "Today's Appointments", value: todaysAppointments, trend: '12 due', type: 'neutral' },
      { label: 'Available Beds', value: availableBeds, trend: `${occupiedBeds} occupied`, type: 'up' },
      { label: 'Occupied Beds', value: occupiedBeds, trend: 'Ward full', type: 'down' },
      { label: 'Total Revenue', value: app.utils.formatCurrency(totalRevenue), trend: '+12.5%', type: 'up' },
      { label: 'Pending Payments', value: app.utils.formatCurrency(pendingPayments), trend: '3 invoices', type: 'neutral' },
      { label: 'Emergency Cases', value: emergencyCases, trend: 'Need review', type: 'neutral' }
    ];

    const cards = document.getElementById('dashboardStats');
    if (cards) {
      cards.innerHTML = stats.map((stat) => `
        <div class="metric-card">
          <div class="label"><span>${stat.label}</span><span class="count-badge">${stat.trend}</span></div>
          <div class="value"><strong>${stat.value}</strong><span class="trend ${stat.type}">${stat.trend}</span></div>
        </div>
      `).join('');
    }

    const revenueValues = [24, 36, 31, 48, 58, 52, 68, 79, 72, 95, 110, 120];
    const revenueChart = document.getElementById('revenueChart');
    if (revenueChart) {
      revenueChart.innerHTML = revenueValues.map((value, index) => `
        <div class="chart-bar" data-label="${['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'][index]}" style="height:${value}%"></div>
      `).join('');
    }

    const patientChart = document.getElementById('patientChart');
    if (patientChart) {
      const patientValues = [18, 22, 26, 21, 34, 29, 42, 38];
      patientChart.innerHTML = patientValues.map((value, index) => `
        <div class="chart-bar" data-label="${['M','T','W','T','F','S','S','M'][index]}" style="height:${value}%"></div>
      `).join('');
    }

    const recentPatientsList = document.getElementById('recentPatientsList');
    if (recentPatientsList) {
      recentPatientsList.innerHTML = state.patients.slice(0, 4).map((patient) => `
        <li class="list-item">
          <div>
            <strong>${patient.fullName}</strong>
            <div class="meta-line"><span>${patient.department}</span><span>${patient.registrationDate}</span></div>
          </div>
          <span class="status-pill ${app.utils.getStatusClass(patient.status)}">${patient.status}</span>
        </li>
      `).join('');
    }

    const upcomingAppointmentsList = document.getElementById('upcomingAppointmentsList');
    if (upcomingAppointmentsList) {
      upcomingAppointmentsList.innerHTML = state.appointments.slice(0, 4).map((appointment) => `
        <li class="list-item">
          <div>
            <strong>${app.utils.getPatientName(appointment.patientId)}</strong>
            <div class="meta-line"><span>${app.utils.getDoctorName(appointment.doctorId)}</span><span>${appointment.date}</span></div>
          </div>
          <span class="status-pill ${app.utils.getStatusClass(appointment.status)}">${appointment.status}</span>
        </li>
      `).join('');
    }

    const doctorAvailabilityList = document.getElementById('doctorAvailabilityList');
    if (doctorAvailabilityList) {
      doctorAvailabilityList.innerHTML = state.doctors.slice(0, 4).map((doctor) => `
        <li class="list-item">
          <div>
            <strong>${doctor.fullName}</strong>
            <div class="meta-line"><span>${doctor.department}</span><span>${doctor.availableTime}</span></div>
          </div>
          <span class="status-pill ${app.utils.getStatusClass(doctor.status)}">${doctor.status}</span>
        </li>
      `).join('');
    }

    const activityTimeline = document.getElementById('activityTimeline');
    if (activityTimeline) {
      const activities = [
        { title: 'New patient registration', time: '5 min ago' },
        { title: 'Bed allocated to orthopedics', time: '15 min ago' },
        { title: 'Pharmacy stock request submitted', time: '42 min ago' },
        { title: 'Lab test report approved', time: '1 hour ago' }
      ];
      activityTimeline.innerHTML = activities.map((activity) => `
        <li class="timeline-item">
          <span class="dot"></span>
          <div>
            <strong>${activity.title}</strong>
            <div class="meta-line"><span>System update</span><span>${activity.time}</span></div>
          </div>
        </li>
      `).join('');
    }

    const notificationsList = document.getElementById('notificationsList');
    if (notificationsList) {
      notificationsList.innerHTML = [
        { text: '3 surgery patients require review', tone: 'high' },
        { text: 'Inventory below threshold for Amoxicillin', tone: 'medium' },
        { text: '2 appointments need confirmation today', tone: 'low' }
      ].map((item) => `
        <li class="list-item">
          <div class="severity-dot ${item.tone === 'high' ? 'high' : item.tone === 'medium' ? 'medium' : 'low'}"></div>
          <span>${item.text}</span>
        </li>
      `).join('');
    }

    const bedOccupancyChart = document.getElementById('bedOccupancyChart');
    if (bedOccupancyChart) {
      const occupied = state.beds.filter((bed) => bed.status === 'occupied').length;
      const available = state.beds.filter((bed) => bed.status === 'available').length;
      const reserved = state.beds.filter((bed) => bed.status === 'reserved').length;
      const maintenance = state.beds.filter((bed) => bed.status === 'maintenance').length;
      const series = [available, occupied, reserved, maintenance];
      const labels = ['Avail', 'Occupied', 'Reserved', 'Maint'];
      const total = series.reduce((sum, item) => sum + item, 0) || 1;
      bedOccupancyChart.innerHTML = series.map((value, index) => `
        <div class="mini-bar">
          <div class="fill" style="height:${(value / total) * 100}%"></div>
          <small>${labels[index]}</small>
        </div>
      `).join('');
    }
  }

  app.modules.dashboard = { render };
})();
