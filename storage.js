(function () {
  const STORAGE_KEY = 'smartcare_hms_app';
  const defaultState = {
    patients: [
      { id: 'P-1001', fullName: 'Ava Carter', age: 32, gender: 'Female', phone: '+1 512-555-0141', email: 'ava.carter@example.com', address: '42 Maple Avenue, Austin', bloodGroup: 'A+', emergencyContact: 'Mason Carter', registrationDate: '2025-01-10', department: 'General Medicine', assignedDoctor: 'DR-1001', status: 'Active' },
      { id: 'P-1002', fullName: 'Liam Nguyen', age: 46, gender: 'Male', phone: '+1 512-555-0145', email: 'liam.nguyen@example.com', address: '88 River Street, Austin', bloodGroup: 'O+', emergencyContact: 'Minh Nguyen', registrationDate: '2025-02-03', department: 'Cardiology', assignedDoctor: 'DR-1003', status: 'Critical' },
      { id: 'P-1003', fullName: 'Sofia Patel', age: 26, gender: 'Female', phone: '+1 512-555-0156', email: 'sofia.patel@example.com', address: '305 Cedar Way, Austin', bloodGroup: 'B+', emergencyContact: 'Rahul Patel', registrationDate: '2025-03-18', department: 'Neurology', assignedDoctor: 'DR-1002', status: 'Recovered' },
      { id: 'P-1004', fullName: 'Noah Davis', age: 58, gender: 'Male', phone: '+1 512-555-0162', email: 'noah.davis@example.com', address: '15 Sunset Road, Austin', bloodGroup: 'AB-', emergencyContact: 'Olivia Davis', registrationDate: '2025-04-18', department: 'Orthopedics', assignedDoctor: 'DR-1004', status: 'Emergency' }
    ],
    doctors: [
      { id: 'DR-1001', fullName: 'Dr. Alice Johnson', specialization: 'Internal Medicine', department: 'General Medicine', phone: '+1 512-555-1001', email: 'alice@smartcare.com', experience: 12, fee: 180, availableDays: 'Mon-Fri', availableTime: '09:00 AM - 12:00 PM', status: 'Available' },
      { id: 'DR-1002', fullName: 'Dr. Benjamin Lee', specialization: 'Neurologist', department: 'Neurology', phone: '+1 512-555-1002', email: 'benjamin@smartcare.com', experience: 15, fee: 220, availableDays: 'Tue-Sat', availableTime: '10:00 AM - 02:00 PM', status: 'Busy' },
      { id: 'DR-1003', fullName: 'Dr. Claire Martin', specialization: 'Cardiology', department: 'Cardiology', phone: '+1 512-555-1003', email: 'claire@smartcare.com', experience: 11, fee: 240, availableDays: 'Mon-Thu', availableTime: '08:00 AM - 11:30 AM', status: 'Available' },
      { id: 'DR-1004', fullName: 'Dr. Daniel Ross', specialization: 'Orthopedic Surgeon', department: 'Orthopedics', phone: '+1 512-555-1004', email: 'daniel@smartcare.com', experience: 18, fee: 260, availableDays: 'Wed-Sun', availableTime: '01:00 PM - 05:00 PM', status: 'On Leave' }
    ],
    appointments: [
      { id: 'APT-1001', patientId: 'P-1001', doctorId: 'DR-1001', department: 'General Medicine', date: '2026-11-05', time: '09:30 AM', status: 'Confirmed' },
      { id: 'APT-1002', patientId: 'P-1002', doctorId: 'DR-1003', department: 'Cardiology', date: '2026-11-07', time: '10:00 AM', status: 'Scheduled' },
      { id: 'APT-1003', patientId: 'P-1003', doctorId: 'DR-1002', department: 'Neurology', date: '2026-11-08', time: '11:30 AM', status: 'Completed' }
    ],
    opdQueue: [
      { id: 'OPD-1001', patientId: 'P-1001', doctorId: 'DR-1001', department: 'General Medicine', arrivalTime: '09:15 AM', status: 'Waiting', token: 101 },
      { id: 'OPD-1002', patientId: 'P-1004', doctorId: 'DR-1004', department: 'Orthopedics', arrivalTime: '09:45 AM', status: 'In Consultation', token: 102 }
    ],
    admissions: [
      { id: 'ADM-1001', patientId: 'P-1002', doctorId: 'DR-1003', ward: 'ICU', bedId: 'B-102', admissionDate: '2026-10-23', diagnosis: 'Cardiac monitoring', status: 'Monitoring' },
      { id: 'ADM-1002', patientId: 'P-1004', doctorId: 'DR-1004', ward: 'Private Ward', bedId: 'B-204', admissionDate: '2026-10-25', diagnosis: 'Orthopedic consultation', status: 'Admitted' }
    ],
    beds: [
      { id: 'B-101', ward: 'General Ward', status: 'available', patientName: '' },
      { id: 'B-102', ward: 'ICU', status: 'occupied', patientName: 'Liam Nguyen' },
      { id: 'B-103', ward: 'General Ward', status: 'reserved', patientName: 'Pending' },
      { id: 'B-104', ward: 'General Ward', status: 'available', patientName: '' },
      { id: 'B-201', ward: 'Private Ward', status: 'occupied', patientName: 'Noah Davis' },
      { id: 'B-202', ward: 'Private Ward', status: 'available', patientName: '' },
      { id: 'B-203', ward: 'Private Ward', status: 'maintenance', patientName: '' },
      { id: 'B-204', ward: 'Private Ward', status: 'occupied', patientName: 'Noah Davis' }
    ],
    medicines: [
      { id: 'MED-1001', name: 'Paracetamol', category: 'Analgesic', manufacturer: 'MediCore', batchNumber: 'PCM-203', quantity: 120, unitPrice: 4.2, expiryDate: '2027-06-15', supplier: 'CareLine Suppliers', stockStatus: 'In Stock' },
      { id: 'MED-1002', name: 'Aspirin', category: 'Cardiac', manufacturer: 'VitaPharm', batchNumber: 'ASP-149', quantity: 18, unitPrice: 5.8, expiryDate: '2026-12-30', supplier: 'Prime Drugs', stockStatus: 'Low Stock' },
      { id: 'MED-1003', name: 'Amoxicillin', category: 'Antibiotic', manufacturer: 'NorthStar Labs', batchNumber: 'AMX-440', quantity: 0, unitPrice: 8.5, expiryDate: '2026-09-07', supplier: 'Prime Drugs', stockStatus: 'Out of Stock' }
    ],
    invoices: [
      { id: 'INV-1001', patientId: 'P-1001', patientName: 'Ava Carter', total: 480.25, status: 'Paid' },
      { id: 'INV-1002', patientId: 'P-1002', patientName: 'Liam Nguyen', total: 1380.00, status: 'Pending' },
      { id: 'INV-1003', patientId: 'P-1003', patientName: 'Sofia Patel', total: 210.75, status: 'Partially Paid' }
    ],
    labRequests: [
      { id: 'LAB-1001', patientId: 'P-1001', patientName: 'Ava Carter', testName: 'CBC', category: 'Hematology', status: 'Completed', result: 'Normal range' },
      { id: 'LAB-1002', patientId: 'P-1002', patientName: 'Liam Nguyen', testName: 'Blood Glucose', category: 'Biochemistry', status: 'Processing', result: '' }
    ],
    staff: [
      { id: 'ST-1001', fullName: 'Grace Wilson', role: 'Nurse Manager', department: 'Nursing', phone: '+1 512-555-2001', email: 'grace@smartcare.com', status: 'Active' },
      { id: 'ST-1002', fullName: 'Oliver Smith', role: 'Pharmacist', department: 'Pharmacy', phone: '+1 512-555-2002', email: 'oliver@smartcare.com', status: 'Active' },
      { id: 'ST-1003', fullName: 'Priya Nair', role: 'Lab Technician', department: 'Laboratory', phone: '+1 512-555-2003', email: 'priya@smartcare.com', status: 'On Leave' }
    ],
    settings: { hospitalName: 'SmartCare Hospital', currency: 'USD', timezone: 'UTC+05:30' }
  };

  function clone(data) { return JSON.parse(JSON.stringify(data)); }
  const app = window.smartCareApp = window.smartCareApp || {};
  app.DEFAULT_STATE = clone(defaultState);

  app.storage = {
    load: function () {
      try {
        const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));
        if (saved && typeof saved === 'object') {
          return { ...clone(defaultState), ...saved, settings: { ...defaultState.settings, ...(saved.settings || {}) } };
        }
      } catch (error) {
        console.warn('Could not load saved data:', error);
      }
      return clone(defaultState);
    },
    save: function () {
      if (!app.state) app.state = clone(defaultState);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(app.state));
    },
    reset: function () {
      app.state = clone(defaultState);
      this.save();
      if (app.refreshAll) app.refreshAll();
      return app.state;
    }
  };

  app.state = app.storage.load();
})();
