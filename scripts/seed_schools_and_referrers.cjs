const { Pool } = require("pg");
const fs = require("fs");
const path = require("path");

function getDbUrl() {
  if (process.env.DATABASE_URL) return process.env.DATABASE_URL;
  const envPath = path.resolve(__dirname, "..", ".env");
  if (fs.existsSync(envPath)) {
    const envFile = fs.readFileSync(envPath, "utf8");
    for (const line of envFile.split("\n")) {
      if (line.trim().startsWith("DATABASE_URL=")) {
        return line.trim().replace("DATABASE_URL=", "").replace(/^["']|["']$/g, "");
      }
    }
  }
  return null;
}

const dbUrl = getDbUrl();
if (!dbUrl) {
  console.error("DATABASE_URL not found in environment or .env file.");
  process.exit(1);
}

const isSsl = dbUrl.includes("sslmode=require") || dbUrl.includes("neon.tech");
const pool = new Pool({
  connectionString: dbUrl,
  ssl: isSsl ? { rejectUnauthorized: false } : false,
});

const schoolsRaw = [
  {
    name: "ماندگار امام صادق ع",
    city: "قم",
    province: "قم",
    district: "قم",
    aliases: ["ماندگار امام صادق ع", "ماندگار امام صادق", "دبیرستان ماندگار امام صادق", "دبیرستان ماندگار امام صادق ع"],
  },
  {
    name: "صاحب کوثر",
    city: "تهران",
    province: "تهران",
    district: "منطقه ۵",
    ownershipType: "NON_GOVERNMENTAL",
    aliases: ["صاحب کوثر", "غیرانتفاعی صاحب کوثر", "دبیرستان صاحب کوثر", "دبیرستان غیردولتی صاحب کوثر"],
  },
  {
    name: "امام محمد باقر",
    city: "اصفهان",
    province: "اصفهان",
    district: "اصفهان",
    aliases: ["امام محمد باقر", "امام محمد باقر شعبه", "دبیرستان امام محمد باقر", "مجموعه امام محمد باقر"],
  },
  {
    name: "سادات موسوی",
    city: "تهران",
    province: "تهران",
    district: "منطقه ۱۲",
    aliases: ["سادات موسوی", "مدرسه سادات موسوی", "دبیرستان سادات موسوی"],
  },
  {
    name: "امام خامنه ای",
    city: "کاشان",
    province: "اصفهان",
    district: "کاشان",
    ownershipType: "NEMOONE_DOLATI",
    aliases: ["امام خامنه ای", "دبیرستان پسرانه نمونه دولتی امام خامنه ای", "نمونه دولتی امام خامنه ای", "دبیرستان امام خامنه ای"],
  },
  {
    name: "البرز",
    city: "تهران",
    province: "تهران",
    district: "منطقه ۶",
    aliases: ["البرز", "دبیرستان البرز", "دبیرستان ماندگار البرز", "ماندگار البرز"],
  },
  {
    name: "دکتر حسابی",
    city: "ورامین",
    province: "تهران",
    district: "ورامین",
    ownershipType: "NEMOONE_DOLATI",
    aliases: ["نمونه دکتر حسابی", "دکتر حسابی", "نمونه دولتی دکتر حسابی", "دبیرستان دکتر حسابی"],
  },
  {
    name: "سرای ایرانی",
    city: "قم",
    province: "قم",
    district: "قم",
    aliases: ["سرای ایرانی", "مجتمع سرای ایرانی", "مدرسه سرای ایرانی"],
  },
  {
    name: "شاهد ثارالله",
    city: "مشهد",
    province: "خراسان رضوی",
    district: "مشهد",
    ownershipType: "SHAHED",
    aliases: ["شاهد ثارالله", "شاهد پسرانه ثارالله", "دبیرستان شاهد ثارالله"],
  },
  {
    name: "معارف امام رضا",
    city: "مشهد",
    province: "خراسان رضوی",
    district: "مشهد",
    aliases: ["معارف امام رضا", "مدرسه معارف امام رضا", "دبیرستان معارف امام رضا", "علوم و معارف اسلامی امام رضا"],
  },
  {
    name: "امام رضا ع",
    city: "مشهد",
    province: "خراسان رضوی",
    district: "مشهد",
    aliases: ["علوم و معارف امام رضا ع", "معارف اسلامی امام رضا ع", "دبیرستان علوم و معارف اسلامی امام رضا ع", "امام رضا ع"],
  },
  {
    name: "علامه حلی",
    city: "همدان",
    province: "همدان",
    district: "همدان",
    ownershipType: "SAMPAD",
    aliases: ["علامه حلی 1", "علامه حلی 2", "دبیرستان علامه حلی 1", "علامه حلی همدان", "علامه حلی"],
  },
  {
    name: "امام صادق ع",
    city: "تهران",
    province: "تهران",
    district: "منطقه ۲",
    aliases: ["امام صادق ع", "دبیرستان امام صادق ع", "مجموعه آموزشی امام صادق", "امام صادق"],
  },
  {
    name: "شهید رجایی",
    city: "تهران",
    province: "تهران",
    district: "منطقه تهران",
    ownershipType: "SAMPAD",
    aliases: ["شهید رجایی", "دبیرستان شهید رجایی", "تیزهوشان شهید رجایی", "سمپاد شهید رجایی"],
  },
  {
    name: "پویندگان خورشید",
    city: "تهران",
    province: "تهران",
    district: "منطقه تهران",
    aliases: ["پویندگان خورشید", "مدرسه پویندگان خورشید", "دبیرستان پویندگان خورشید"],
  },
  {
    name: "فرهنگ شهید شریفی",
    city: "تهران",
    province: "تهران",
    district: "منطقه تهران",
    ownershipType: "NEMOONE_DOLATI",
    aliases: ["فرهنگ شهید شریفی", "دبیرستان فرهنگ شهید شریفی", "نمونه فرهنگ شهید شریفی", "دبیرستان نمونه دولتی فرهنگ شهید شریفی"],
  },
  {
    name: "ابوریحان",
    city: "تهران",
    province: "تهران",
    district: "منطقه تهران",
    aliases: ["ابوریحان", "دبیرستان ابوریحان", "مدرسه ابوریحان"],
  },
  {
    name: "شهید قدوسی",
    city: "قم",
    province: "قم",
    district: "قم",
    ownershipType: "SAMPAD",
    aliases: ["شهید قدوسی", "دبیرستان استعدادهای درخشان شهید قدوسی", "مدرسه شهید قدوسی", "تیزهوشان شهید قدوسی"],
  },
  {
    name: "صدرا",
    city: "قم",
    province: "قم",
    district: "قم",
    aliases: ["صدرا", "علوم و معارف صدرا", "علوم و معارف اسلامی صدرا", "دبیرستان صدرا"],
  },
];

const referrersRaw = `
محمدصادق طاهری,9120762237,سادات موسوی (تهران)
رضا نیک نژاد,9396074946,پویندگان خورشید (تهران) | سادات موسوی (تهران)
محمد رضا نوروزی,9384200229,پویندگان خورشید (تهران)
معین ذنوبی,9120774415,صدرا (قم)
مجتبی محمد خانی,9132675427,امام محمد باقر (اصفهان)
محمد هدایتی,9125934902,پویندگان خورشید (تهران)
سید علیرضا وحدتی شبیری,9192515467,معارف امام رضا (مشهد) | امام رضا ع (مشهد)
آقای حاجی محمد جعفر,9124597328,صاحب کوثر (تهران)
کاظم کیومرزی,9217853228,صدرا (قم)
حسین خواجوند,9124367255,سادات موسوی (تهران)
آقای سنگتراشان,9127488541,ماندگار امام صادق (قم) | ماندگار امام صادق ع (قم)
جواد علیدوست,9152007797,شاهد ثارالله (مشهد)
علیرضا اردستانی,9125911374,دکتر حسابی (ورامین)
آقای محمد هژبری,9155572325,معارف امام رضا (مشهد)
دکتر رضا رضایی,9121591229,امام صادق ع (تهران)
حجت الاسلام شریعتی,9151570816,معارف امام رضا (مشهد) | امام رضا ع (مشهد)
حسین ظهیر نیا,9151038133,شاهد ثارالله (مشهد)
مهدی باجلان,9102303396,فرهنگ شهید شریفی (تهران)
سعید نیکخواه,9305977940,ماندگار امام صادق ع (قم) | ماندگار امام صادق (قم)
مجید نجفی,9126055663,شهید قدوسی (قم)
روح الله دانشور,9013723093,امام رضا ع (مشهد) | معارف امام رضا (مشهد)
محمد جواد آقایی,9398897349,امام خامنه ای (کاشان)
آقای جعفری,9121019590,صاحب کوثر (تهران) | امام صادق ع (تهران)
سید هادی هاشمی شاهرودی,9124059733,صاحب کوثر (تهران)
مرتضی قوامی,9151057054,شاهد ثارالله (مشهد)
آقای صالحی,9120862853,صاحب کوثر (تهران)
بهزاد اندرز,9123991210,فرهنگ شهید شریفی (تهران) | سادات موسوی (تهران)
اقای فرنود,9132291531,امام محمد باقر (اصفهان)
محمدرضا محمدی,9125911984,دکتر حسابی (ورامین)
خادم الذاکرین,9122035413,سرای ایرانی (قم)
علی اکبر سلطانی,9158231742,شاهد ثارالله (مشهد)
محمد علی سپیدزاد,9125078768,سادات موسوی (تهران) | امام صادق ع (تهران)
علی کشوری,9155103870,امام رضا ع (مشهد)
علی عرفانی جاهد,9025028171,معارف امام رضا (مشهد)
محمدحسین مدبر,9363131219,معارف امام رضا (مشهد) | امام رضا ع (مشهد)
سیدعلیرضا وحدتی,9055305468,معارف امام رضا (مشهد)
محمد جدیدی,9191993761,شهید رجایی (تهران)
حسین مقیسه,9358569558,شهید قدوسی (قم)
آقای صادقی,9126526290,ماندگار امام صادق ع (قم)
استاد شایان فر,9155102182,امام رضا ع (مشهد)
آقای محسن شبستانی,9183129674,علامه حلی (همدان)
آقای تفویضی,9127491911,ماندگار امام صادق ع (قم)
مهدی خزائیان,9337968202,علامه حلی (همدان)
استاد مرتضی مظفریان,9191491097,ماندگار امام صادق (قم) | ماندگار امام صادق ع (قم)
مجتبی سلطانیان,9188089731,علامه حلی (همدان)
آقای مهدی فتحی,9187507615,علامه حلی (همدان)
آقای برجی,9198364376,ابوریحان (تهران)
رحمان احمد نژاد,9123343731,پویندگان خورشید (تهران)
آقای طاهریان,9909420937,معارف امام رضا (مشهد)
علی رضایی,9199854159,سرای ایرانی (قم)
محمد نوید فلاح,9122565502,صاحب کوثر (تهران)
ابوالفضل اسدی,9035553540,پویندگان خورشید (تهران)
محسن کریم آبادی,9101442174,ماندگار امام صادق (قم) | ماندگار امام صادق ع (قم)
آقای کریم,9103137446,پویندگان خورشید (تهران)
غلامرضاپور,9139611741,امام خامنه ای (کاشان)
آقای ایتی,9133656843,امام محمد باقر (اصفهان)
محمد شیخ الاسلامی,9352480606,امام صادق ع (تهران)
مرتضی فراهانی,9335004405,امام صادق ع (تهران)
سید ابوالفضل امامی,9124985740,صاحب کوثر (تهران)
نبی اصلانی,9124271945,البرز (تهران)
حجت اسعدی,9159928982,معارف امام رضا (مشهد)
مسعود نکونام,9154774844,امام رضا ع (مشهد)
سید هادی هاشمی,9122772354,البرز (تهران)
علی اصغر بهمنی هرمز,9188193380,علامه حلی (همدان)
حاج کاظم کیومرزی,9121509665,صدرا (قم)
استادامیر حسین اکبر,9196527202,ماندگار امام صادق ع (قم)
حجت‌السلام محمدجوادسلیمانی‌پاک,9366091979,معارف امام رضا (مشهد)
عبدالله بیات,9122242048,البرز (تهران)
استاد بشیری,9155038972,معارف امام رضا (مشهد)
رضا برزگر رحیمی,9014662929,البرز (تهران)
هادی علی آبادی,9365563100,امام رضا ع (مشهد)
ابراهیم معصومی,9121460659,البرز (تهران)
آقای خزائیان,9181072289,علامه حلی (همدان)
حمید قلندریان,9151013845,امام رضا ع (مشهد)
آقای مسعود ملارضی,9380890265,شهید رجایی (تهران)
اسفندیار کوهی,9124940065,البرز (تهران)
آقای نیک خواه,9122537115,ماندگار امام صادق (قم)
آقای تاری,9127592926,ماندگار امام صادق (قم)
سید علی موسوی,9120609872,ماندگار امام صادق ع (قم)
حاج آقای بحرینی,9193512606,سرای ایرانی (قم)
محمدرضا بابایی,9149868922,صدرا (قم)
رحمن احمد نژاد,9194911865,پویندگان خورشید (تهران)
سید حسین موسوی نژاد,9126529814,شهید قدوسی (قم)
حسین احمدی فرد,9132611448,امام خامنه ای (کاشان)
امیر عیسی ملکی,9122382682,امام صادق ع (تهران)
استاد منوچهری,9187883398,البرز (تهران)
آقای محمد براتی,9133285970,امام محمد باقر (اصفهان)
دانشیار,9155150364,امام رضا ع (مشهد)
آقای معینی منش,9132766377,امام خامنه ای (کاشان)
علی فروتن,9131940392,امام محمد باقر (اصفهان)
استاد حشمتی,9153033239,امام رضا ع (مشهد)
استاد خانلر,9189059901,علامه حلی (همدان)
دکتر صادقی فرد,9128522491,شهید قدوسی (قم)
مهدی نورایی یگانه,9191548024,شهید قدوسی (قم)
مهدی نظری,9126510759,ماندگار امام صادق ع (قم)
اقای امینی,9916418830,ماندگار امام صادق (قم)
کمیجانی,9183490013,سرای ایرانی (قم)
حیدری,9182734190,سرای ایرانی (قم)
حسین درفشی,9196400271,البرز (تهران)
خیر الله زاده,9395203180,البرز (تهران)
غلامرضا حسنی,9120869122,ابوریحان (تهران)
محمد رضایی,9127774714,صاحب کوثر (تهران)
مهدی کبریایی,9124857970,صاحب کوثر (تهران)
جنگجو,9173876014,ماندگار امام صادق (قم)
امیرحسین علیزاده درخشی,9053696321,پویندگان خورشید (تهران)
آقای مرادی,9124071800,شهید رجایی (تهران)
آقای ابوالفضل جمالی,9105869863,شهید رجایی (تهران)
آقای محمد رضا خداکریمی,9198082753,شهید رجایی (تهران)
سید محمد کلانتریان,9126305325,صاحب کوثر (تهران)
آقای عطایی,9127496569,ماندگار امام صادق (قم)
خلیلی,9124115539,ابوریحان (تهران)
رضا علی‌اکبری,9367728194,امام رضا ع (مشهد)
استاد داریوش,9126079086,شهید رجایی (تهران)
استاد باقر حسینی,9125082098,دکتر حسابی (ورامین)
استاد شجاعی,9056688754,دکتر حسابی (ورامین)
اباذری,9190380984,ماندگار امام صادق ع (قم)
آقای امینی,9126513813,ماندگار امام صادق (قم)
حسین آخرتی,9131068479,امام خامنه ای (کاشان)
محمد باغبانی طاهری,9133630236,امام خامنه ای (کاشان)
آقای یوسف شیرازی,9199175831,البرز (تهران)
منوچهر اخوی,9122460622,ابوریحان (تهران)
هادی راهچمندی,9105006951,امام رضا ع (مشهد)
حاج آقای عباسی,9149212401,سرای ایرانی (قم)
آقای فرامرزی,9127171041,پویندگان خورشید (تهران)
حامد پور نجف,9354309881,شاهد ثارالله (مشهد)
هومن نمازی,9126472531,فرهنگ شهید شریفی (تهران)
کبودوند,9125073134,فرهنگ شهید شریفی (تهران)
غلامی نژاد,9124897689,فرهنگ شهید شریفی (تهران)
روانفر,9136403372,امام محمد باقر (اصفهان)
حسین عباسی,9159316384,شاهد ثارالله (مشهد)
فرزاد روشنی,9122998194,امام صادق ع (تهران)
آقای علی سعادتمند,9127481676,شهید قدوسی (قم)
آقای سجاد بهروزی,9186440850,شهید قدوسی (قم)
امیر سویزی,9902929877,البرز (تهران)
حسین گیلانیان,9365390128,دکتر حسابی (ورامین)
مهدی لاجوردی,9335733355,معارف امام رضا (مشهد)
احسان فرامرزمنش,9371076963,شهید رجایی (تهران)
حسین فرجی,9127579296,امام خامنه ای (کاشان)
حسین حمزه,9368670922,سرای ایرانی (قم)
رئیسی,9171248057,سرای ایرانی (قم)
مهدی راحتی,9124378522,امام صادق ع (تهران)
راهنما,9385995234,ماندگار امام صادق (قم)
خیری,9376175217,ماندگار امام صادق (قم)
علی اصفهانی,9304168856,ابوریحان (تهران)
استاد عبدوس,9121796223,البرز (تهران)
آقای جعفری,9121019095,امام صادق ع (تهران)
حمید رضا تولا,9365002507,امام محمد باقر (اصفهان)
امیرحسین ظاهری,9387728471,امام خامنه ای (کاشان)
سیدسعید ولی,9133630862,امام خامنه ای (کاشان)
سالار سیدنظری,9147130252,امام محمد باقر (اصفهان)
مهدی کریمی,9126969031,شهید رجایی (تهران)
مالکی,9109802148,شهید رجایی (تهران)
حجت الاسلام اشکان مناسبی,9932882836,امام رضا ع (مشهد)
آقای علیرضا بیگی,9046560315,صدرا (قم)
آقای محسن کریمی,9127485597,صدرا (قم)
حسین گیلانیان,9925343975,دکتر حسابی (ورامین)
استاد میرحق,9192194589,فرهنگ شهید شریفی (تهران)
استاد رنجبری,9122067302,فرهنگ شهید شریفی (تهران)
استاد نقوی,9183144393,علامه حلی (همدان)
استاد جلیلیان,9183139767,علامه حلی (همدان)
محمد صدرا تردست,9223861510,امام صادق ع (تهران)
دادگر,9191548013,سرای ایرانی (قم)
استاد محمد جواد انبیایی,9022045819,شهید قدوسی (قم)
علی ممانی,9394816999,شهید رجایی (تهران)
دکتر محسن سلطانی,9124919795,شهید رجایی (تهران)
یگانه,9195287405,صاحب کوثر (تهران)
آقای معصومی,9125090225,امام صادق ع (تهران)
آقای روشنی,9192998194,امام صادق ع (تهران)
علی اکبر سلطانی,9058231742,شاهد ثارالله (مشهد)
امید تیموری,9138739286,امام محمد باقر (اصفهان)
آقای علیزاده,9125001484,فرهنگ شهید شریفی (تهران)
حسین همزه,9368680922,سرای ایرانی (قم)
علیرضا الواریان,9305753863,دکتر حسابی (ورامین)
آقای ذوالفقار پور,9379940556,امام خامنه ای (کاشان)
رضا رحمتی,9133049629,امام محمد باقر (اصفهان)
علی کریمی,9024449536,امام محمد باقر (اصفهان)
محمد صادق ط,9120672237,سادات موسوی (تهران)
محمد صادق طاهری,9120762273,سادات موسوی (تهران)
مزینانی,9155230534,شاهد ثارالله (مشهد)
`;

function normalizePhone(phone) {
  if (!phone) return "";
  let p = phone.trim().replace(/\s+/g, "");
  if (p.length === 10 && p.startsWith("9")) {
    p = "0" + p;
  }
  return p;
}

function normalizeSchoolName(rawName) {
  let s = rawName.trim();
  s = s.replace(/\s*\([^)]*\)\s*/g, "").trim(); // remove (تهران), (قم), etc.
  return s;
}

function matchSchoolId(targetName, schoolMap) {
  const norm = normalizeSchoolName(targetName);
  // direct match by name
  for (const [id, s] of schoolMap.entries()) {
    if (s.name === norm) return id;
  }
  // match by aliases or substrings
  for (const [id, s] of schoolMap.entries()) {
    if (norm === "ماندگار امام صادق" && s.name.includes("ماندگار امام صادق")) return id;
    if (norm === "ماندگار امام صادق ع" && s.name.includes("ماندگار امام صادق")) return id;
    if (norm.includes("امام رضا") && s.name.includes("امام رضا")) {
      if (norm.includes("معارف") && s.name.includes("معارف")) return id;
      if (!norm.includes("معارف") && !s.name.includes("معارف")) return id;
    }
    if (s.aliases && s.aliases.some(a => a === norm || norm.includes(a) || a.includes(norm))) {
      return id;
    }
  }
  return null;
}

function cuid() {
  const ts = Date.now().toString(36);
  const r = Math.random().toString(36).substring(2, 8);
  return `cm_${ts}_${r}`;
}

async function main() {
  console.log("=== STARTING SEEDING OF SCHOOLS & REFERRERS ===");

  // 1. Insert or update schools
  const schoolMap = new Map(); // id -> { name, aliases, ... }

  for (const s of schoolsRaw) {
    const checkRes = await pool.query("SELECT id, name, aliases FROM schools WHERE name = $1", [s.name]);
    let schoolId = "";
    if (checkRes.rows.length > 0) {
      schoolId = checkRes.rows[0].id;
      console.log(`Updating existing school: ${s.name} (${schoolId})`);
      await pool.query(
        `UPDATE schools SET 
          city = $1, 
          province = $2, 
          district = $3, 
          "ownershipType" = COALESCE($4, "ownershipType"),
          aliases = $5,
          "updatedAt" = NOW()
        WHERE id = $6`,
        [s.city, s.province, s.district, s.ownershipType || "GOVERNMENTAL", s.aliases, schoolId]
      );
    } else {
      schoolId = cuid();
      console.log(`Inserting new school: ${s.name} (${schoolId})`);
      await pool.query(
        `INSERT INTO schools (
          id, name, city, province, district, "ownershipType", aliases, "dominantApproach", "createdAt", "updatedAt"
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, 'EDUCATIONAL_CULTURAL', NOW(), NOW())`,
        [schoolId, s.name, s.city, s.province, s.district, s.ownershipType || "GOVERNMENTAL", s.aliases]
      );
    }
    schoolMap.set(schoolId, { id: schoolId, name: s.name, aliases: s.aliases });
  }

  // 2. Parse referrers
  const lines = referrersRaw.trim().split("\n");
  console.log(`Found ${lines.length} referrer entries in raw text.`);

  let totalReferrersInserted = 0;
  const schoolReferrersCount = new Map();

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("نام معرف")) continue;

    const parts = trimmed.split(",");
    if (parts.length < 3) continue;

    const fullName = parts[0].trim();
    const phone = normalizePhone(parts[1]);
    const targetSchoolsStr = parts.slice(2).join(","); // handles any commas in schools list
    const targets = targetSchoolsStr.split("|").map(t => t.trim()).filter(Boolean);

    for (const target of targets) {
      const schoolId = matchSchoolId(target, schoolMap);
      if (!schoolId) {
        console.warn(`WARNING: Could not match school "${target}" for referrer "${fullName}" (${phone})`);
        continue;
      }

      // Check if this referrer already exists for this school
      const refCheck = await pool.query(
        'SELECT id FROM school_referrers WHERE "schoolId" = $1 AND "fullName" = $2',
        [schoolId, fullName]
      );

      if (refCheck.rows.length === 0) {
        await pool.query(
          'INSERT INTO school_referrers (id, "fullName", phone, "schoolId", "createdAt", "updatedAt") VALUES ($1, $2, $3, $4, NOW(), NOW())',
          [cuid(), fullName, phone, schoolId]
        );
        totalReferrersInserted++;
      }

      const curCount = schoolReferrersCount.get(schoolId) || 0;
      schoolReferrersCount.set(schoolId, curCount + 1);
    }
  }

  console.log(`Successfully processed/inserted ${totalReferrersInserted} referrers across schools.`);

  // 3. Update summary referrerName and referrerPhone on schools
  for (const [schoolId, s] of schoolMap.entries()) {
    const refRes = await pool.query(
      'SELECT "fullName", phone FROM school_referrers WHERE "schoolId" = $1 ORDER BY "createdAt" ASC',
      [schoolId]
    );

    if (refRes.rows.length > 0) {
      const firstRef = refRes.rows[0];
      const count = refRes.rows.length;
      const summaryName = count > 1 ? `${firstRef.fullName} (+${count - 1} معرف دیگر)` : firstRef.fullName;
      const summaryPhone = firstRef.phone || "";

      await pool.query(
        'UPDATE schools SET "referrerName" = $1, "referrerPhone" = $2 WHERE id = $3',
        [summaryName, summaryPhone, schoolId]
      );
      console.log(`School "${s.name}": set summary referrer "${summaryName}" (${summaryPhone}) - total ${count} referrers.`);
    }
  }

  // 4. Try auto-linking teachers if any teacher has schoolNameManual matching a school alias
  const teachersRes = await pool.query('SELECT id, "schoolNameManual" FROM teachers WHERE "schoolId" IS NULL AND "schoolNameManual" IS NOT NULL');
  console.log(`Checking ${teachersRes.rows.length} unassigned teachers for auto-linking...`);
  for (const t of teachersRes.rows) {
    const sId = matchSchoolId(t.schoolNameManual, schoolMap);
    if (sId) {
      await pool.query('UPDATE teachers SET "schoolId" = $1 WHERE id = $2', [sId, t.id]);
      console.log(`Auto-linked teacher ${t.id} ("${t.schoolNameManual}") to school ${sId}!`);
    }
  }

  console.log("=== SEEDING COMPLETED SUCCESSFULLY! ===");
}

main().catch(console.error).finally(() => pool.end());
