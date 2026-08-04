let reports = [];

export function addReport(type, latitude, longitude) {
  const report = {
    id: Date.now().toString(),
    type,
    latitude,
    longitude,
    createdAt: new Date().toISOString()
  };

  reports.push(report);
  return report;
}

export function getReports() {
  return reports;
}

export function deleteReport(id) {
  reports = reports.filter(r => r.id !== id);
}

export function clearReports() {
  reports = [];
}
