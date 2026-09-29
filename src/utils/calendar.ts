import { StudyPlan } from '../types';

export function exportPlanToICS(plan: StudyPlan) {
  let icsContent = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//StudyPulse//College AI Study Planner//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'X-WR-CALNAME:Student Learner Schedule',
    'X-WR-TIMEZONE:UTC',
  ];

  plan.days.forEach((day) => {
    day.sessions.forEach((sess) => {
      const dateParts = sess.date.split('-');
      const year = dateParts[0];
      const month = dateParts[1];
      const dayStr = dateParts[2];

      const timeParts = (sess.startTime || '09:00').split(':');
      const hour = timeParts[0].padStart(2, '0');
      const min = timeParts[1].padStart(2, '0');

      const dtStart = `${year}${month}${dayStr}T${hour}${min}00`;

      // End time
      const startDateObj = new Date(`${sess.date}T${hour}:${min}:00`);
      const endDateObj = new Date(startDateObj.getTime() + (sess.durationMinutes || 45) * 60000);
      const endYear = endDateObj.getFullYear();
      const endMonth = String(endDateObj.getMonth() + 1).padStart(2, '0');
      const endDay = String(endDateObj.getDate()).padStart(2, '0');
      const endHour = String(endDateObj.getHours()).padStart(2, '0');
      const endMin = String(endDateObj.getMinutes()).padStart(2, '0');
      const dtEnd = `${endYear}${endMonth}${endDay}T${endHour}${endMin}00`;

      icsContent.push('BEGIN:VEVENT');
      icsContent.push(`UID:${sess.id}@student-learner.app`);
      icsContent.push(`DTSTAMP:${year}${month}${dayStr}T000000Z`);
      icsContent.push(`DTSTART:${dtStart}`);
      icsContent.push(`DTEND:${dtEnd}`);
      icsContent.push(`SUMMARY:Study: ${sess.subjectName} – ${sess.topic}`);
      icsContent.push(
        `DESCRIPTION:Technique: ${sess.technique}\\nDifficulty: ${sess.difficulty}\\nDuration: ${sess.durationMinutes} minutes`
      );
      icsContent.push('STATUS:CONFIRMED');
      icsContent.push('END:VEVENT');
    });
  });

  icsContent.push('END:VCALENDAR');

  const blob = new Blob([icsContent.join('\r\n')], { type: 'text/calendar;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', 'student-study-schedule.ics');
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
