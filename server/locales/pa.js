module.exports = {
  REPORT_RECEIVED:
    "تہاڈی اطلاع مل گئی۔ شکریہ۔ بچاو ٹیم جلدی آئے گی۔",
  // "Your report received. Thank you. Bachao team coming soon."

  HELP_MESSAGE:
    "بچاو بوٹ: سڑک دا حال جاننے لئی سڑک دا ناں لکھو۔ مدد لئی: 1122",
  // "Bachao bot: Write road name to check status. For help: 1122"

  ROAD_NOT_FOUND:
    "ایہہ سڑک سانوں نہیں لبھی۔ کوئی ہور سڑک دا ناں لکھو۔",
  // "This road not found. Try another road name."

  ROAD_OPEN: (name) =>
    `${name} ہن کھلی اے۔ سفر محفوظ کرو۔`,
  // "${name} is currently open. Travel safely."

  ROAD_WARNING: (name, hrs) =>
    `خبردار! ${name} تقریباً ${Math.round(hrs)} گھنٹیاں وچ بند ہو سکدی اے۔ ہن نکلو۔`,
  // "Warning! ${name} may close in ~${hrs} hours. Leave now."

  ROAD_CLOSED: (name) =>
    `${name} بند اے۔ ہور رستہ ورتو۔ مدد: 1122`,
  // "${name} is closed. Use alternate route. Help: 1122"
};