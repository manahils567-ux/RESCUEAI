module.exports = {
  REPORT_RECEIVED:
    "توهانجي اطلاع ملي وئي۔ شڪريا۔ بچاءُ ٽيم جلد ايندي۔",
  // "Your report received. Thank you. Bachao team coming soon."

  HELP_MESSAGE:
    "بچاءُ بوٽ: رستي جو حال ڄاڻڻ لاءِ رستي جو نالو لکو۔ مدد لاءِ: 1122",
  // "Bachao bot: Write road name to check status. For help: 1122"

  ROAD_NOT_FOUND:
    "هي رستو اسان جي سسٽم ۾ ناهي۔ ٻيو رستو لکو۔",
  // "This road is not in our system. Try another road name."

  ROAD_OPEN: (name) =>
    `${name} هاڻي کليل آهي۔ محفوظ سفر ڪريو۔`,
  // "${name} is currently open. Travel safely."

  ROAD_WARNING: (name, hrs) =>
    `خبردار! ${name} تقريباً ${Math.round(hrs)} ڪلاڪن ۾ بند ٿي سگهي ٿو۔ هاڻي نڪرو۔`,
  // "Warning! ${name} may close in ~${hrs} hours. Leave now."

  ROAD_CLOSED: (name) =>
    `${name} بند آهي۔ ٻيو رستو استعمال ڪريو۔ مدد: 1122`,
  // "${name} is closed. Use alternate route. Help: 1122"
};