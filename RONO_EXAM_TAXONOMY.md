# فاز ۰ — تصمیم‌ها و تاکسونومی (سند مرجع)

> خروجی فاز ۰ از [RONO_EXAM_CONVERSION_PLAN.md](RONO_EXAM_CONVERSION_PLAN.md).
> این سند «منبعِ حقیقت» برای فازهای ۱ تا ۳ است: کدها، تاکسونومی و قالب ورود داده.
> بدون تغییر کد — فقط تصمیم‌های قطعی‌شده.

## وضعیت زیرساخت (بررسی‌شده در کد)

| نیاز | وضعیت در کد فعلی |
|---|---|
| ۴ گزینه (A–D) | ✅ آماده — importer کلیدهای غایب را رد می‌کند (E اختیاری است) |
| زبان `fa` | ✅ آماده — در JSON پاس داده می‌شود؛ فقط پیش‌فرضِ importer از `tr` به `fa` |
| پاسخ تشریحی | ✅ آماده — `ItemVersion.explanation` و `Option.explanation` از قبل هستند؛ فقط importer باید پُرشان کند (بدون مهاجرت) |
| نوع/بخش/منشأ/سال آزمون | ✅ آماده — `item.exam_type/exam_part/source/source_reference/exam_year/exam_session` |
| درس → مبحث | ✅ آماده — `Topic` سلسله‌مراتبی |

---

## ۱. تصمیم‌های قطعی

### ۱.۱ کدهای `exam_type`
| کد | آزمون |
|---|---|
| `executive` | آزمون استخدامی متمرکز دستگاه‌های اجرایی (فراگیر) |
| `education` | آزمون استخدامی آموزش و پرورش |
| `bank` | آزمون‌های استخدامی بانک‌ها |
| `social_security` | آزمون استخدامی سازمان تأمین اجتماعی |

### ۱.۲ کدهای `exam_part`
| کد | معنی |
|---|---|
| `general` | دروس عمومی (مشترک بین همه‌ی آزمون‌ها) |
| `specialized` | دروس تخصصی (وابسته به آزمون/رشته‌ی شغلی) |

### ۱.۳ گزینه‌ها
- **۴ گزینه**: داخل دیتابیس کلیدهای `A B C D`.
- **نمایش فارسی**: `A→الف`، `B→ب`، `C→ج`، `D→د` (نگاشت فقط در لایه‌ی UI).

### ۱.۴ زبان
- `language = "fa"` برای همه‌ی محتوا.

### ۱.۵ عمق تاکسونومی
- **۲ سطح**: درس (سطح ۰) → مبحث (سطح ۱). عمیق‌تر نمی‌رویم.
- تاپیک‌ها **سراسری** (`institution_id = NULL`) تا بین همه‌ی مؤسسات مشترک باشند.

### ۱.۶ سال آزمون
- `exam_year` به **هجری شمسی** ذخیره می‌شود (مثلاً `1401`).

---

## ۲. تاکسونومی دروس عمومی (مشترک — اولویت اول محتوا)

قرارداد slug: درس = `gen-<subject>`، مبحث = `gen-<subject>-<topic>`.
در JSONِ ورود، فیلد `subject` **برابر slugِ مبحث** است (importer مستقیم با slug پیدا می‌کند).

### زبان و ادبیات فارسی — `gen-persian`
- `gen-persian-qarabat` — قرابت معنایی
- `gen-persian-dastur` — دستور زبان و نگارش
- `gen-persian-arayeh` — آرایه‌های ادبی
- `gen-persian-tarikh` — تاریخ ادبیات و سبک‌شناسی
- `gen-persian-vajegan` — معنی واژگان و املا

### معارف اسلامی — `gen-maaref`
- `gen-maaref-quran` — قرآن و تفسیر
- `gen-maaref-ahkam` — احکام
- `gen-maaref-aqaed` — اعتقادات و اصول دین
- `gen-maaref-tarikh` — تاریخ اسلام
- `gen-maaref-akhlaq` — اخلاق اسلامی

### زبان انگلیسی — `gen-english`
- `gen-english-grammar` — گرامر
- `gen-english-vocabulary` — واژگان
- `gen-english-reading` — درک مطلب
- `gen-english-cloze` — کلوز تست

### ریاضی و آمار مقدماتی — `gen-math`
- `gen-math-arithmetic` — حساب، درصد و نسبت
- `gen-math-algebra` — جبر و معادلات
- `gen-math-statistics` — آمار و احتمال مقدماتی
- `gen-math-data` — تحلیل داده و نمودار

### هوش و استعداد — `gen-aptitude`
- `gen-aptitude-logic` — استدلال منطقی
- `gen-aptitude-series` — سری‌ها و تشخیص الگو
- `gen-aptitude-verbal` — هوش کلامی
- `gen-aptitude-spatial` — هوش تصویری و فضایی

### مهارت‌های کامپیوتر (ICDL) — `gen-ict`
- `gen-ict-concepts` — مفاهیم پایه کامپیوتر و شبکه
- `gen-ict-windows` — ویندوز و مدیریت فایل
- `gen-ict-word` — واژه‌پرداز Word
- `gen-ict-excel` — صفحه‌گسترده Excel
- `gen-ict-powerpoint` — ارائه PowerPoint
- `gen-ict-internet` — اینترنت و ایمیل

### اطلاعات عمومی، اجتماعی و قانون اساسی — `gen-general`
- `gen-general-current` — اطلاعات عمومی و سیاسی روز
- `gen-general-constitution` — قانون اساسی
- `gen-general-social` — مسائل اجتماعی و فرهنگی
- `gen-general-iran` — تاریخ و جغرافیای ایران

---

## ۳. اسکلت دروس تخصصی (به‌تفکیک آزمون)

> این بخش **اسکلت** است و باید با دفترچه‌ی رسمی و رشته‌ی شغلیِ هدف نهایی شود.
> قرارداد slug: `<exam>-<subject>`.

### آموزش و پرورش — مشترکِ تربیتی (`edu-*`)
- `edu-pedagogy` — تعلیم و تربیت
- `edu-psychology` — روان‌شناسی پرورشی و تربیتی
- `edu-measurement` — سنجش و اندازه‌گیری
- `edu-teaching-methods` — روش‌ها و فنون تدریس
- `edu-islamic-psych` — علم‌النفس از دیدگاه دانشمندان اسلامی
- (+ رسته‌ای، مثال: `edu-elementary` آموزگار ابتدایی، `edu-math` دبیر ریاضی)

### بانک‌ها (`bank-*`)
- `bank-accounting` — حسابداری
- `bank-economics` — اقتصاد
- `bank-money-banking` — پول و بانکداری
- `bank-financial-math` — ریاضیات مالی
- `bank-law` — حقوق بانکی و تجارت
- `bank-it` — فناوری اطلاعات

### تأمین اجتماعی (`ss-*`)
- `ss-ss-law` — قوانین و مقررات تأمین اجتماعی
- `ss-accounting` — حسابداری
- `ss-law` — حقوق
- `ss-management` — مدیریت
- `ss-it` — کامپیوتر

### دستگاه‌های اجرایی/فراگیر (`exec-*`) — وابسته به رشته
- `exec-accounting` — حسابداری
- `exec-law` — حقوق
- `exec-management` — مدیریت
- `exec-it` — فناوری اطلاعات
- (سایر رشته‌ها بر حسب نیاز)

---

## ۴. قالب JSON ورود سؤال (نهایی)

سازگار با `scripts/import_questions.py` + تغییرات کوچک فاز ۱.
فایل نمونه: [`backend/scripts/data/sample_estekhdami.json`](backend/scripts/data/sample_estekhdami.json)

```json
{
  "exam_type": "education",
  "exam_part": "general",
  "source": "sanjesh",
  "source_reference": "آزمون استخدامی آموزش و پرورش ۱۴۰۱ / دفترچه عمومی",
  "exam_year": 1401,
  "exam_session": null,
  "language": "fa",
  "questions": [
    {
      "no": 1,
      "subject": "gen-persian-qarabat",
      "stem": "متن سؤال…",
      "options": { "A": "گزینه الف", "B": "گزینه ب", "C": "گزینه ج", "D": "گزینه د" },
      "answer": "C",
      "explanation": "پاسخ تشریحی…",
      "void": false
    }
  ]
}
```

تفاوت‌ها با قالب فعلی (TUS) — کارهای فاز ۱:
1. `subject` = **slugِ مبحث** (به‌جای کلیدِ نگاشتِ TUS). importer مستقیم با slug جستجو کند.
2. خواندن `explanation` و ست‌کردن روی `ItemVersion.explanation`.
3. پذیرش `void` به‌جای/در‌کنار `iptal`.
4. پیش‌فرض `language` از `tr` به `fa`.
5. گزینه‌ها فقط A–D (E حذف — از قبل پشتیبانی می‌شود).

---

## ۵. تحویل به فاز ۱ (چه چیزی باید کد شود)
- `schemas/items.py`: اعتبارسنجی `exam_type` (۴ کد) و `exam_part` (۲ کد).
- `import_questions.py`: ۵ تغییر بالا.
- `scripts/seed_estekhdami_topics.py` (فاز ۲): seed تاکسونومی بخش ۲ (+ اسکلت بخش ۳).
- نگاشت نمایشِ `A→الف …` در UI (فاز ۴).
