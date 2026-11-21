/* Yarının Sofrası — çok dilli arayüz (TR / EN / DE / AR / RU)
   Mantık: sayfadaki Türkçe metin parçaları sözlükten bulunup seçili dile çevrilir. */
(function () {
  'use strict';
  var path = (location.pathname.split('/').pop() || 'index.html');
  var STAFF = /^(mutfak-|admin)/.test(path);
  var LANGS = [['tr', 'Türkçe', 'TR'], ['en', 'English', 'EN'], ['de', 'Deutsch', 'DE'], ['ar', 'العربية', 'AR'], ['ru', 'Русский', 'RU']];
  var cur = 'tr';
  try { cur = localStorage.getItem('es_lang') || 'tr'; } catch (e) { /* yok say */ }
  if (!LANGS.some(function (l) { return l[0] === cur; })) cur = 'tr';

  // [tr, en, de, ar, ru]
  var R = [
    // --- giriş / kayıt
    ['Giriş Yap', 'Log in', 'Anmelden', 'تسجيل الدخول', 'Войти'],
    ['Üye Ol', 'Sign up', 'Registrieren', 'إنشاء حساب', 'Регистрация'],
    ['Üye ol', 'Sign up', 'Registrieren', 'إنشاء حساب', 'Регистрация'],
    ['Üye Kaydı', 'Registration', 'Registrierung', 'تسجيل العضوية', 'Регистрация'],
    ['Çıkış Yap', 'Log out', 'Abmelden', 'تسجيل الخروج', 'Выйти'],
    ['Hesabın yok mu?', "Don't have an account?", 'Noch kein Konto?', 'ليس لديك حساب؟', 'Нет аккаунта?'],
    ['Hesabı Oluştur', 'Create account', 'Konto erstellen', 'إنشاء الحساب', 'Создать аккаунт'],
    ['E-posta', 'Email', 'E-Mail', 'البريد الإلكتروني', 'Эл. почта'],
    ['E-posta veya kullanıcı adı', 'Email or username', 'E-Mail oder Benutzername', 'البريد الإلكتروني أو اسم المستخدم', 'Эл. почта или имя пользователя'],
    ['Şifre (en az 6 karakter)', 'Password (at least 6 characters)', 'Passwort (mind. 6 Zeichen)', 'كلمة المرور (6 أحرف على الأقل)', 'Пароль (не менее 6 символов)'],
    ['Şifre', 'Password', 'Passwort', 'كلمة المرور', 'Пароль'],
    ['E-posta veya şifre hatalı', 'Incorrect email or password', 'E-Mail oder Passwort falsch', 'البريد الإلكتروني أو كلمة المرور غير صحيحة', 'Неверная почта или пароль'],
    ['Sistemimiz sadece üyelere açıktır. Mutfak personeli de aynı girişi kullanır.', 'Our system is for members only. Kitchen staff use the same login.', 'Unser System ist nur für Mitglieder. Küchenpersonal nutzt denselben Login.', 'نظامنا مخصص للأعضاء فقط. ويستخدم طاقم المطبخ نفس تسجيل الدخول.', 'Система только для участников. Персонал кухни входит так же.'],
    ['Geçerli bir e-posta gir', 'Enter a valid email', 'Gültige E-Mail eingeben', 'أدخل بريدًا إلكترونيًا صحيحًا', 'Введите корректную почту'],
    ['Bu e-posta ile zaten bir hesap var. Giriş yapmayı dene.', 'An account with this email already exists. Try logging in.', 'Mit dieser E-Mail existiert bereits ein Konto. Versuche dich anzumelden.', 'يوجد حساب بهذا البريد بالفعل. جرّب تسجيل الدخول.', 'Аккаунт с этой почтой уже существует. Попробуйте войти.'],
    ['Adım 1 / 3 · Kişisel Bilgiler', 'Step 1 / 3 · Personal info', 'Schritt 1 / 3 · Persönliche Daten', 'الخطوة 1 / 3 · البيانات الشخصية', 'Шаг 1 / 3 · Личные данные'],
    ['Adım 2 / 3 · Bölge ve Adres', 'Step 2 / 3 · Region and address', 'Schritt 2 / 3 · Region und Adresse', 'الخطوة 2 / 3 · المنطقة والعنوان', 'Шаг 2 / 3 · Район и адрес'],
    ['Adım 3 / 3 · Üyelik Özeti', 'Step 3 / 3 · Membership summary', 'Schritt 3 / 3 · Mitgliedschaft', 'الخطوة 3 / 3 · ملخص العضوية', 'Шаг 3 / 3 · Итог'],
    ['1. Bilgiler', '1. Details', '1. Daten', '1. البيانات', '1. Данные'],
    ['2. Adres & Bölge', '2. Address & region', '2. Adresse & Region', '2. العنوان والمنطقة', '2. Адрес и район'],
    ['3. Özet', '3. Summary', '3. Übersicht', '3. الملخص', '3. Итог'],
    ['Ad Soyad', 'Full name', 'Vor- und Nachname', 'الاسم الكامل', 'Имя и фамилия'],
    ['Cep Telefonu', 'Mobile phone', 'Handynummer', 'رقم الجوال', 'Мобильный телефон'],
    ['Telefon', 'Phone', 'Telefon', 'الهاتف', 'Телефон'],
    ['SMS Gönder', 'Send SMS', 'SMS senden', 'إرسال رسالة SMS', 'Отправить SMS'],
    ['SMS Doğrulama Kodu', 'SMS verification code', 'SMS-Bestätigungscode', 'رمز التحقق عبر SMS', 'Код подтверждения из SMS'],
    ['SMS kodunu doğrula (demo kod: 123456)', 'Verify SMS code (demo code: 123456)', 'SMS-Code bestätigen (Demo-Code: 123456)', 'تحقق من رمز SMS (الرمز التجريبي: 123456)', 'Подтвердить код SMS (демо-код: 123456)'],
    ['Demo modu: doğrulama kodu 123456', 'Demo mode: verification code 123456', 'Demo-Modus: Bestätigungscode 123456', 'الوضع التجريبي: رمز التحقق 123456', 'Демо-режим: код подтверждения 123456'],
    ['Demo: gerçek SMS sonraki aşamada', 'Demo: real SMS comes in the next stage', 'Demo: echte SMS folgt später', 'تجريبي: الرسائل الحقيقية في المرحلة التالية', 'Демо: настоящие SMS позже'],
    ['Doğrulandı', 'Verified', 'Bestätigt', 'تم التحقق', 'Подтверждено'],
    ['Devam Et', 'Continue', 'Weiter', 'متابعة', 'Продолжить'],
    ['Adres Bilgilerine Geç', 'Go to address details', 'Weiter zur Adresse', 'الانتقال إلى العنوان', 'Перейти к адресу'],
    ['Özete Geç', 'Go to summary', 'Weiter zur Übersicht', 'الانتقال إلى الملخص', 'Перейти к итогу'],
    ['Geri', 'Back', 'Zurück', 'رجوع', 'Назад'],
    ['Geri dön', 'Go back', 'Zurück', 'رجوع', 'Назад'],
    // --- bölge / adres
    ['Teslimat Bölgesi ve Adres', 'Delivery area and address', 'Liefergebiet und Adresse', 'منطقة التوصيل والعنوان', 'Район доставки и адрес'],
    ['Teslimat Bölgesi', 'Delivery area', 'Liefergebiet', 'منطقة التوصيل', 'Район доставки'],
    ['Teslimat bölgen seçilmemiş.', 'No delivery area selected.', 'Kein Liefergebiet gewählt.', 'لم تُحدَّد منطقة التوصيل.', 'Район доставки не выбран.'],
    ['Profilden bölgeni değiştir', 'Change your area in your profile', 'Gebiet im Profil ändern', 'غيّر منطقتك من الملف الشخصي', 'Изменить район в профиле'],
    ['İlçesinde henüz hizmet vermiyoruz. Yakında geliyoruz!', 'We do not serve this district yet. Coming soon!', 'In diesem Bezirk liefern wir noch nicht. Bald geht es los!', 'لا نخدم هذه المنطقة بعد. قريبًا!', 'В этом районе мы пока не работаем. Скоро!'],
    ['ilçesinde henüz hizmet vermiyoruz. Yakında geliyoruz!', 'is not served yet. Coming soon!', 'wird noch nicht beliefert. Bald geht es los!', 'لا نخدم هذه المنطقة بعد. قريبًا!', 'пока не обслуживается. Скоро!'],
    ['Bölgeniz aktif', 'Your area is active', 'Ihr Gebiet ist aktiv', 'منطقتك مفعّلة', 'Ваш район активен'],
    ['Bu ilçeye yakında geliyoruz, haber ver', 'Coming to this district soon, notify me', 'Bald auch in diesem Bezirk, sag mir Bescheid', 'سنصل إلى هذه المنطقة قريبًا، أبلغني', 'Скоро будем в этом районе, сообщите мне'],
    ['Haber Ver', 'Notify me', 'Benachrichtigen', 'أبلغني', 'Сообщить мне'],
    [' açıldığında haber vereceğiz.', ' opens, we will let you know.', ' eröffnet, geben wir Bescheid.', ' سنخبرك عند افتتاحه.', ' откроется, мы сообщим вам.'],
    ['Bu mutfağın teslimat bölgesi yok', 'This kitchen has no delivery area', 'Diese Küche hat kein Liefergebiet', 'لا توجد منطقة توصيل لهذا المطبخ', 'У этой кухни нет района доставки'],
    ['İl', 'Province', 'Provinz', 'المحافظة', 'Область'],
    ['İlçe', 'District', 'Bezirk', 'المنطقة', 'Район'],
    ['Mahalle / Cadde', 'Neighborhood / Street', 'Viertel / Straße', 'الحي / الشارع', 'Район / улица'],
    ['Mahalle / cadde / sokak', 'Neighborhood / street', 'Viertel / Straße', 'الحي / الشارع', 'Район / улица'],
    ['Mahalle, sokak veya cadde ara...', 'Search neighborhood, street...', 'Viertel oder Straße suchen...', 'ابحث عن حي أو شارع...', 'Поиск района или улицы...'],
    ['Bina No', 'Building no.', 'Hausnr.', 'رقم المبنى', 'Номер дома'],
    ['Bina numarasını yaz', 'Enter the building number', 'Hausnummer eingeben', 'اكتب رقم المبنى', 'Введите номер дома'],
    ['Bina / blok', 'Building / block', 'Gebäude / Block', 'المبنى / البلوك', 'Здание / блок'],
    ['Bina', 'Building', 'Gebäude', 'المبنى', 'Здание'],
    ['Kat', 'Floor', 'Etage', 'الطابق', 'Этаж'],
    ['Daire / oda', 'Apartment / room', 'Wohnung / Raum', 'الشقة / الغرفة', 'Квартира / комната'],
    ['Daire', 'Apartment', 'Wohnung', 'الشقة', 'Квартира'],
    ['Konumumu kullan', 'Use my location', 'Meinen Standort verwenden', 'استخدم موقعي', 'Использовать моё местоположение'],
    ['Konum alınamadı, pini elle sürükle', 'Could not get location, drag the pin manually', 'Standort nicht verfügbar, Pin manuell verschieben', 'تعذّر تحديد الموقع، اسحب الدبوس يدويًا', 'Не удалось определить местоположение, перетащите метку'],
    ['Adres bulunamadı, pini elle sürükle', 'Address not found, drag the pin manually', 'Adresse nicht gefunden, Pin manuell verschieben', 'لم يُعثر على العنوان، اسحب الدبوس يدويًا', 'Адрес не найден, перетащите метку'],
    ['Pini sürükleyerek konumu netleştir', 'Drag the pin to fine-tune the location', 'Pin ziehen, um den Standort zu präzisieren', 'اسحب الدبوس لتحديد الموقع بدقة', 'Перетащите метку для точного положения'],
    ['Tarayıcı konumu desteklemiyor', 'Browser does not support location', 'Browser unterstützt keine Standortabfrage', 'المتصفح لا يدعم تحديد الموقع', 'Браузер не поддерживает геолокацию'],
    ['Harita yüklenemedi (internet?). Adresi elle yazabilirsin.', 'Map could not load (internet?). You can type the address.', 'Karte konnte nicht geladen werden (Internet?). Adresse manuell eingeben.', 'تعذّر تحميل الخريطة (الإنترنت؟). يمكنك كتابة العنوان.', 'Карта не загрузилась (интернет?). Введите адрес вручную.'],
    ['Adres yazmalısın', 'Please enter an address', 'Bitte Adresse eingeben', 'يجب كتابة العنوان', 'Введите адрес'],
    ['Adresi Kaydet ve Kullan', 'Save and use this address', 'Adresse speichern und verwenden', 'احفظ العنوان واستخدمه', 'Сохранить и использовать адрес'],
    ['Yeni adresi önce kaydet', 'Save the new address first', 'Neue Adresse zuerst speichern', 'احفظ العنوان الجديد أولاً', 'Сначала сохраните новый адрес'],
    ['+ Yeni adres / başka şehir', '+ New address / another city', '+ Neue Adresse / andere Stadt', '+ عنوان جديد / مدينة أخرى', '+ Новый адрес / другой город'],
    ['+ Yeni adres', '+ New address', '+ Neue Adresse', '+ عنوان جديد', '+ Новый адрес'],
    ['Kaydet ve Bu Adrese Sipariş Ver', 'Save and order to this address', 'Speichern und an diese Adresse bestellen', 'احفظ واطلب إلى هذا العنوان', 'Сохранить и заказать на этот адрес'],
    ['Nereye sipariş verelim?', 'Where should we deliver?', 'Wohin sollen wir liefern?', 'إلى أين نوصّل؟', 'Куда доставить?'],
    ['Seçtiğin adresin şehrindeki mutfaktan sipariş verirsin. Başka şehre ya da şantiye/ofis adresine gidiyorsan adresi ekle.', 'You order from the kitchen in the city of the address you pick. Add an address if you are going to another city or a site/office.', 'Du bestellst bei der Küche in der Stadt der gewählten Adresse. Füge eine Adresse hinzu, wenn du in eine andere Stadt oder zu einer Baustelle/einem Büro gehst.', 'ستطلب من المطبخ في مدينة العنوان الذي تختاره. أضف عنوانًا إذا كنت ستذهب إلى مدينة أخرى أو موقع عمل/مكتب.', 'Вы заказываете на кухне города выбранного адреса. Добавьте адрес, если едете в другой город, на стройку или в офис.'],
    ['Kayıtlı adresim', 'My saved address', 'Meine gespeicherte Adresse', 'عنواني المحفوظ', 'Мой сохранённый адрес'],
    ['Kayıtlı Ev Adresi', 'Saved home address', 'Gespeicherte Heimadresse', 'عنوان المنزل المحفوظ', 'Сохранённый домашний адрес'],
    ['Ev (kayıtlı adres)', 'Home (saved address)', 'Zuhause (gespeicherte Adresse)', 'المنزل (العنوان المحفوظ)', 'Дом (сохранённый адрес)'],
    ['Kayıtlı Teslimat Adreslerim', 'My saved delivery addresses', 'Meine gespeicherten Lieferadressen', 'عناوين التوصيل المحفوظة', 'Мои адреса доставки'],
    ['Yeni adres eklemek için sipariş ödeme ekranında "Yeni adres"i kullan.', 'To add a new address, use "New address" on the payment screen.', 'Neue Adresse im Zahlungsbildschirm über „Neue Adresse“ hinzufügen.', 'لإضافة عنوان جديد استخدم "عنوان جديد" في شاشة الدفع.', 'Чтобы добавить адрес, используйте «Новый адрес» на экране оплаты.'],
    ['Bu siparişi nereye getirelim? (ev, iş yeri, ofis, şantiye…)', 'Where should we bring this order? (home, work, office, site…)', 'Wohin sollen wir diese Bestellung bringen? (Zuhause, Arbeit, Büro, Baustelle…)', 'أين نوصّل هذا الطلب؟ (المنزل، العمل، المكتب، موقع البناء…)', 'Куда доставить заказ? (дом, работа, офис, стройка…)'],
    ['Teslimat notu (örn. güvenliğe bırak)', 'Delivery note (e.g. leave with security)', 'Lieferhinweis (z. B. beim Pförtner abgeben)', 'ملاحظة التوصيل (مثال: اتركه عند الأمن)', 'Примечание (напр. оставить охране)'],
    ['Teslimat notu', 'Delivery note', 'Lieferhinweis', 'ملاحظة التوصيل', 'Примечание к доставке'],
    ['İş yeri', 'Workplace', 'Arbeitsplatz', 'مكان العمل', 'Место работы'],
    ['Şantiye', 'Construction site', 'Baustelle', 'موقع البناء', 'Стройплощадка'],
    ['Diğer', 'Other', 'Sonstige', 'أخرى', 'Другое'],
    // --- ana sayfa / index
    ['Ana Sayfa', 'Home', 'Startseite', 'الرئيسية', 'Главная'],
    ['Ev yapımı sıcak Türk yemekleri', 'Hot homemade Turkish meals', 'Heiße hausgemachte türkische Gerichte', 'أطباق تركية منزلية ساخنة', 'Горячие домашние турецкие блюда'],
    ['Bugün sipariş ver, yarın sıcak sıcak gelsin', 'Order today, get it piping hot tomorrow', 'Heute bestellen, morgen heiß geliefert', 'اطلب اليوم واستلم غدًا ساخنًا', 'Закажите сегодня — завтра горячее у вас'],
    ["Yarının sipariş saatleri bu gece 00:00'a kadar açık.", "Tomorrow's orders are open until 00:00 tonight.", 'Bestellungen für morgen sind bis 00:00 Uhr heute Nacht möglich.', 'طلبات الغد مفتوحة حتى الساعة 00:00 الليلة.', 'Заказы на завтра принимаются до 00:00 этой ночью.'],
    ['Yarının sofrası bugünden hazır', "Tomorrow's table is ready today", 'Der Tisch von morgen ist heute schon gedeckt', 'مائدة الغد جاهزة اليوم', 'Завтрашний стол готов уже сегодня'],
    ['Yarının siparişleri için kalan süre', "Time left for tomorrow's orders", 'Verbleibende Zeit für Bestellungen von morgen', 'الوقت المتبقي لطلبات الغد', 'Осталось времени для заказов на завтра'],
    ['Yarının menüsüne bak', "See tomorrow's menu", 'Menü für morgen ansehen', 'اطّلع على قائمة الغد', 'Посмотреть меню на завтра'],
    ['Yarının Menüsü · ', "Tomorrow's Menu · ", 'Menü für morgen · ', 'قائمة الغد · ', 'Меню на завтра · '],
    ['Yarının Menüsü', "Tomorrow's Menu", 'Menü für morgen', 'قائمة الغد', 'Меню на завтра'],
    ['Yarının Siparişi (', "Tomorrow's Order (", 'Bestellung für morgen (', 'طلب الغد (', 'Заказ на завтра ('],
    ['Yarının Sofrası ile tanış', 'Meet Yarının Sofrası', 'Lerne Yarının Sofrası kennen', 'تعرّف على سفرة الغد', 'Знакомство с Yarının Sofrası'],
    ['Bölgenin Lezzeti', 'Taste of the Region', 'Geschmack der Region', 'نكهة المنطقة', 'Вкус региона'],
    ['Bölgenin yemekleri, ev lezzetiyle', 'Regional dishes with a homemade taste', 'Regionale Gerichte mit Hausmannskost-Geschmack', 'أطباق المنطقة بنكهة البيت', 'Блюда региона с домашним вкусом'],
    ['Üyelere Özel', 'Members only', 'Nur für Mitglieder', 'للأعضاء فقط', 'Только для участников'],
    ['Sıfır Atık', 'Zero Waste', 'Null Verschwendung', 'صفر هدر', 'Ноль отходов'],
    ['Sıfır atık, planlı üretim', 'Zero waste, planned production', 'Keine Verschwendung, geplante Produktion', 'صفر هدر وإنتاج مخطّط', 'Ноль отходов, плановое производство'],
    ['Mutfak sadece gelen sipariş kadar pişirir. Ne fazla yemek çöpe gider, ne de lezzetten ödün verilir.', 'The kitchen cooks only what is ordered. No extra food is wasted and no taste is compromised.', 'Die Küche kocht nur so viel, wie bestellt wird. Nichts wird weggeworfen, am Geschmack wird nicht gespart.', 'يطبخ المطبخ بقدر الطلبات فقط. لا يُهدر طعام ولا يُضحّى بالطعم.', 'Кухня готовит ровно столько, сколько заказано. Еда не пропадает, вкус не страдает.'],
    ['Sipariş kapanışı her gece 00:00', 'Orders close every night at 00:00', 'Bestellschluss jede Nacht um 00:00 Uhr', 'يُغلق باب الطلبات كل ليلة عند 00:00', 'Приём заказов закрывается каждую ночь в 00:00'],
    ['Kapanış 00:00', 'Closes 00:00', 'Schluss 00:00', 'الإغلاق 00:00', 'Закрытие 00:00'],
    ['Paketlere Göz At', 'Browse packages', 'Pakete ansehen', 'تصفّح الباقات', 'Смотреть пакеты'],
    ['Tümünü Gör', 'See all', 'Alle anzeigen', 'عرض الكل', 'Смотреть все'],
    ['Destek', 'Support', 'Support', 'الدعم', 'Поддержка'],
    ['Demo: destek hattı sonraki aşamada eklenecek', 'Demo: support line will be added later', 'Demo: Support-Hotline folgt später', 'تجريبي: سيُضاف خط الدعم لاحقًا', 'Демо: линия поддержки появится позже'],
    // --- menü
    ['Günlük Menü Seçimi', 'Daily menu selection', 'Tagesmenü-Auswahl', 'اختيار القائمة اليومية', 'Выбор меню на день'],
    ['Öğün değişince sepetin temizlenecek. Devam edilsin mi?', 'Your cart will be cleared when you change the meal. Continue?', 'Beim Wechsel der Mahlzeit wird der Warenkorb geleert. Fortfahren?', 'ستُفرَّغ السلة عند تغيير الوجبة. هل تتابع؟', 'При смене приёма пищи корзина очистится. Продолжить?'],
    ['Bu öğün için menü henüz hazırlanmadı.', 'The menu for this meal is not ready yet.', 'Das Menü für diese Mahlzeit ist noch nicht fertig.', 'لم تُجهَّز قائمة هذه الوجبة بعد.', 'Меню для этого приёма пищи ещё не готово.'],
    ['Mevcut siparişini düzenliyorsun', 'You are editing your current order', 'Du bearbeitest deine aktuelle Bestellung', 'أنت تعدّل طلبك الحالي', 'Вы редактируете текущий заказ'],
    ['Onayladığında eski sipariş iptal edilip yenisi oluşur.', 'When you confirm, the old order is cancelled and a new one is created.', 'Mit der Bestätigung wird die alte Bestellung storniert und eine neue erstellt.', 'عند التأكيد يُلغى الطلب القديم ويُنشأ طلب جديد.', 'После подтверждения старый заказ отменяется и создаётся новый.'],
    ['Vazgeç', 'Cancel', 'Abbrechen', 'إلغاء', 'Отмена'],
    ['(düzenleme)', '(editing)', '(Bearbeitung)', '(تعديل)', '(редактирование)'],
    ['Sepete Ekle', 'Add to cart', 'In den Warenkorb', 'أضف إلى السلة', 'В корзину'],
    ['Adet', 'Quantity', 'Menge', 'الكمية', 'Количество'],
    ['Artır', 'Increase', 'Erhöhen', 'زيادة', 'Увеличить'],
    ['Azalt', 'Decrease', 'Verringern', 'إنقاص', 'Уменьшить'],
    ['Tükendi · kotamız bitti', 'Sold out · quota reached', 'Ausverkauft · Kontingent erschöpft', 'نفد · انتهت الحصة', 'Распродано · квота закончилась'],
    ['Son ', 'Last ', 'Noch ', 'متبقٍ ', 'Осталось '],
    [' porsiyon kaldı', ' portions left', ' Portionen übrig', ' حصة متبقية', ' порций осталось'],
    [' porsiyon', ' portions', ' Portionen', ' حصة', ' порций'],
    [' için kotamız doldu', ' is sold out for today, our quota is full', ' ist ausverkauft, unser Kontingent ist erschöpft', ' نفدت الحصة المتاحة', ' — квота исчерпана'],
    ['tükendi, kotamız doldu', 'sold out, our quota is full', 'ausverkauft, unser Kontingent ist erschöpft', 'نفد، انتهت حصتنا', 'распродано, квота исчерпана'],
    ['Üzgünüz, ', 'Sorry, ', 'Leider, ', 'نأسف، ', 'К сожалению, '],
    [' için sadece ', ' only ', ' nur noch ', ' متبقٍ فقط ', ' осталось только '],
    ['Bir yemekten en fazla 20 adet', 'Maximum 20 of one dish', 'Höchstens 20 Stück pro Gericht', 'بحد أقصى 20 من الطبق الواحد', 'Не более 20 порций одного блюда'],
    ['Ürün Seçildi', 'items selected', 'Artikel gewählt', 'عنصر محدد', 'позиций выбрано'],
    ['Menü Tipi', 'Menu type', 'Menütyp', 'نوع القائمة', 'Тип меню'],
    ['Önerilen', 'Recommended', 'Empfohlen', 'موصى به', 'Рекомендуем'],
    // --- diyet tipleri / kategori / öğün
    ['Standart', 'Standard', 'Standard', 'عادي', 'Стандартное'],
    ['Vejetaryen', 'Vegetarian', 'Vegetarisch', 'نباتي (بيض وألبان)', 'Вегетарианское'],
    ['Protein Ağırlıklı', 'High protein', 'Proteinreich', 'غني بالبروتين', 'Высокобелковое'],
    ['Sporcu', 'Athlete', 'Sportler', 'للرياضيين', 'Для спортсменов'],
    ['Hafif / Diyet', 'Light / Diet', 'Leicht / Diät', 'خفيف / حمية', 'Лёгкое / диета'],
    ['Glutensiz', 'Gluten-free', 'Glutenfrei', 'خالٍ من الغلوتين', 'Без глютена'],
    ['Vegan', 'Vegan', 'Vegan', 'نباتي صرف', 'Веганское'],
    ['Çorba', 'Soup', 'Suppe', 'شوربة', 'Суп'],
    ['Ana Yemek', 'Main dish', 'Hauptgericht', 'طبق رئيسي', 'Основное блюдо'],
    ['Pilav / Makarna', 'Rice / Pasta', 'Reis / Nudeln', 'أرز / معكرونة', 'Рис / паста'],
    ['Salata', 'Salad', 'Salat', 'سلطة', 'Салат'],
    ['Meze', 'Meze', 'Meze', 'مقبلات', 'Мезе'],
    ['İçecek / Tatlı', 'Drink / Dessert', 'Getränk / Dessert', 'مشروب / حلويات', 'Напиток / десерт'],
    ['Öğle Öğünü', 'Lunch', 'Mittagessen', 'وجبة الغداء', 'Обед'],
    ['Akşam Öğünü', 'Dinner', 'Abendessen', 'وجبة العشاء', 'Ужин'],
    ['Öğle', 'Lunch', 'Mittag', 'الغداء', 'Обед'],
    ['Akşam', 'Dinner', 'Abend', 'العشاء', 'Ужин'],
    ['Bugün', 'Today', 'Heute', 'اليوم', 'Сегодня'],
    ['Yarın', 'Tomorrow', 'Morgen', 'غدًا', 'Завтра'],
    ['Menü', 'Menu', 'Menü', 'القائمة', 'Меню'],
    ['Menü Yönetimi', 'Menu management', 'Menüverwaltung', 'إدارة القائمة', 'Управление меню'],
    // --- sepet / ödeme
    ['Sipariş Özeti ve Ödeme', 'Order summary and payment', 'Bestellübersicht und Zahlung', 'ملخص الطلب والدفع', 'Заказ и оплата'],
    ['Teslimat Yöntemi', 'Delivery method', 'Liefermethode', 'طريقة التوصيل', 'Способ получения'],
    ['Eve Teslim (+', 'Home delivery (+', 'Lieferung nach Hause (+', 'توصيل إلى العنوان (+', 'Доставка (+'],
    ['Eve Teslim', 'Home delivery', 'Lieferung nach Hause', 'توصيل إلى العنوان', 'Доставка'],
    ['Gel Al (Ücretsiz)', 'Pick up (Free)', 'Abholung (kostenlos)', 'استلام (مجاني)', 'Самовывоз (бесплатно)'],
    ['Gel Al Mutfak Noktası', 'Kitchen pickup point', 'Abholstelle in der Küche', 'نقطة الاستلام من المطبخ', 'Пункт самовывоза на кухне'],
    ['Gel Al', 'Pick up', 'Abholung', 'استلام', 'Самовывоз'],
    ['Teslimat Saat Dilimi', 'Delivery time slot', 'Lieferzeitfenster', 'فترة التوصيل', 'Время доставки'],
    ['Teslim Alma Saat Dilimi', 'Pickup time slot', 'Abholzeitfenster', 'فترة الاستلام', 'Время самовывоза'],
    ['Teslim Alma', 'Pickup', 'Abholung', 'الاستلام', 'Самовывоз'],
    ['Teslimat', 'Delivery', 'Lieferung', 'التوصيل', 'Доставка'],
    ['Sıcak teslimat', 'Hot delivery', 'Heiße Lieferung', 'توصيل ساخن', 'Горячая доставка'],
    ['Mutfaktan al', 'Pick up at the kitchen', 'In der Küche abholen', 'استلم من المطبخ', 'Забрать на кухне'],
    ['Kontenjan dolu', 'Fully booked', 'Ausgebucht', 'اكتمل العدد', 'Мест нет'],
    [' kontenjan kaldı', ' spots left', ' Plätze frei', ' أماكن متبقية', ' мест осталось'],
    ['Lütfen bir saat dilimi seç', 'Please choose a time slot', 'Bitte Zeitfenster wählen', 'يرجى اختيار فترة زمنية', 'Выберите время'],
    ['Ödeme Yöntemi', 'Payment method', 'Zahlungsmethode', 'طريقة الدفع', 'Способ оплаты'],
    ['Kredi / Banka Kartı (demo)', 'Credit / Debit card (demo)', 'Kredit-/Debitkarte (Demo)', 'بطاقة ائتمان / خصم (تجريبي)', 'Кредитная / дебетовая карта (демо)'],
    ['Apple Pay / Google Pay (demo)', 'Apple Pay / Google Pay (demo)', 'Apple Pay / Google Pay (Demo)', 'Apple Pay / Google Pay (تجريبي)', 'Apple Pay / Google Pay (демо)'],
    ['Demo sürüm: gerçek tahsilat yapılmaz, ödeme sanal geçişle simüle edilir.', 'Demo version: no real charge, payment is simulated.', 'Demoversion: keine echte Abbuchung, Zahlung wird simuliert.', 'نسخة تجريبية: لا يوجد خصم فعلي، الدفع محاكى.', 'Демо-версия: реальное списание не производится, оплата имитируется.'],
    ['Yemek Tutarı', 'Food total', 'Essen gesamt', 'مبلغ الطعام', 'Стоимость блюд'],
    ['Paket Tutarı', 'Package total', 'Paketpreis', 'مبلغ الباقة', 'Стоимость пакета'],
    ['Teslimat Ücreti', 'Delivery fee', 'Liefergebühr', 'رسوم التوصيل', 'Стоимость доставки'],
    ['Toplam', 'Total', 'Gesamt', 'الإجمالي', 'Итого'],
    ['Siparişi Onayla', 'Confirm order', 'Bestellung bestätigen', 'تأكيد الطلب', 'Подтвердить заказ'],
    ['Paketi Onayla', 'Confirm package', 'Paket bestätigen', 'تأكيد الباقة', 'Подтвердить пакет'],
    ['Sipariş kapanışı bu gece 00:00. ', 'Orders close tonight at 00:00. ', 'Bestellschluss heute Nacht um 00:00 Uhr. ', 'يُغلق باب الطلبات الليلة عند 00:00. ', 'Приём заказов закрывается этой ночью в 00:00. '],
    ['Ondan önce siparişini ücretsiz düzenleyebilirsin.', 'Until then you can edit your order for free.', 'Bis dahin kannst du deine Bestellung kostenlos ändern.', 'يمكنك تعديل طلبك مجانًا قبل ذلك.', 'До этого времени заказ можно бесплатно изменить.'],
    ['Eve teslim için profilinde adres olmalı', 'A saved address is required for home delivery', 'Für die Lieferung ist eine gespeicherte Adresse nötig', 'يلزم عنوان محفوظ في ملفك للتوصيل', 'Для доставки нужен адрес в профиле'],
    // --- sipariş takibi
    ['Siparişiniz Alındı!', 'Your order has been received!', 'Deine Bestellung ist eingegangen!', 'تم استلام طلبك!', 'Ваш заказ принят!'],
    ['Teşekkürler! ', 'Thank you! ', 'Danke! ', 'شكرًا لك! ', 'Спасибо! '],
    ['Sipariş Takibi', 'Order tracking', 'Bestellverfolgung', 'تتبّع الطلب', 'Отслеживание заказа'],
    ['Sipariş Durumu', 'Order status', 'Bestellstatus', 'حالة الطلب', 'Статус заказа'],
    ['Siparişlerim', 'My orders', 'Meine Bestellungen', 'طلباتي', 'Мои заказы'],
    ['Tüm Siparişlerim', 'All my orders', 'Alle meine Bestellungen', 'كل طلباتي', 'Все мои заказы'],
    ['Geçmiş Siparişler', 'Past orders', 'Frühere Bestellungen', 'الطلبات السابقة', 'Прошлые заказы'],
    ['Henüz siparişin yok.', 'You have no orders yet.', 'Du hast noch keine Bestellungen.', 'ليس لديك طلبات بعد.', 'У вас пока нет заказов.'],
    ['Henüz geçmiş siparişin yok.', 'You have no past orders yet.', 'Du hast noch keine früheren Bestellungen.', 'ليس لديك طلبات سابقة بعد.', 'У вас пока нет прошлых заказов.'],
    ['Sipariş alındı', 'Order received', 'Bestellung eingegangen', 'تم استلام الطلب', 'Заказ принят'],
    ['Planlama', 'Planning', 'Planung', 'التخطيط', 'Планирование'],
    ['Hazırlanıyor', 'Being prepared', 'Wird zubereitet', 'قيد التحضير', 'Готовится'],
    ['Hazır (Gel Al)', 'Ready (pick up)', 'Bereit (Abholung)', 'جاهز (للاستلام)', 'Готов (самовывоз)'],
    ['Yolda', 'On the way', 'Unterwegs', 'في الطريق', 'В пути'],
    ['Teslim alındı', 'Picked up', 'Abgeholt', 'تم الاستلام', 'Получен'],
    ['Teslim edildi', 'Delivered', 'Geliefert', 'تم التسليم', 'Доставлен'],
    ['Bölge Kuryesi: ', 'Area courier: ', 'Kurier im Gebiet: ', 'مندوب المنطقة: ', 'Курьер района: '],
    ['Kurye henüz atanmadı', 'No courier assigned yet', 'Noch kein Kurier zugewiesen', 'لم يُعيَّن مندوب بعد', 'Курьер ещё не назначен'],
    ['Siparişi Düzenle', 'Edit order', 'Bestellung ändern', 'تعديل الطلب', 'Изменить заказ'],
    ['İptal Et', 'Cancel order', 'Stornieren', 'إلغاء الطلب', 'Отменить заказ'],
    ['Tekrar Sipariş Ver', 'Order again', 'Erneut bestellen', 'أعد الطلب', 'Заказать снова'],
    ['Siparişi iptal etmek istediğine emin misin?', 'Are you sure you want to cancel the order?', 'Möchtest du die Bestellung wirklich stornieren?', 'هل أنت متأكد من إلغاء الطلب؟', 'Вы уверены, что хотите отменить заказ?'],
    ['Sipariş iptal edildi', 'Order cancelled', 'Bestellung storniert', 'تم إلغاء الطلب', 'Заказ отменён'],
    ['Bu sipariş iptal edildi.', 'This order was cancelled.', 'Diese Bestellung wurde storniert.', 'تم إلغاء هذا الطلب.', 'Этот заказ отменён.'],
    ['Bu sipariş artık düzenlenemez (00:00 kapanışı geçti)', 'This order can no longer be edited (00:00 cut-off passed)', 'Diese Bestellung kann nicht mehr geändert werden (00:00-Schluss vorbei)', 'لا يمكن تعديل هذا الطلب (انتهى وقت 00:00)', 'Заказ больше нельзя изменить (прошло 00:00)'],
    ['Siparişini bu gece saat 00:00\'a kadar ücretsiz düzenleyebilir veya iptal edebilirsin.', 'You can edit or cancel your order for free until 00:00 tonight.', 'Du kannst deine Bestellung bis 00:00 Uhr heute Nacht kostenlos ändern oder stornieren.', 'يمكنك تعديل طلبك أو إلغاءه مجانًا حتى الساعة 00:00 الليلة.', 'Заказ можно бесплатно изменить или отменить до 00:00 этой ночью.'],
    ['Siparişini bu gece saat 00:00’a kadar ücretsiz düzenleyebilir veya iptal edebilirsin.', 'You can edit or cancel your order for free until 00:00 tonight.', 'Du kannst deine Bestellung bis 00:00 Uhr heute Nacht kostenlos ändern oder stornieren.', 'يمكنك تعديل طلبك أو إلغاءه مجانًا حتى الساعة 00:00 الليلة.', 'Заказ можно бесплатно изменить или отменить до 00:00 этой ночью.'],
    [' üretimi için son saat', ' last time for production', ' letzter Zeitpunkt für die Produktion', ' آخر موعد للإنتاج', ' — крайний срок для приготовления'],
    ['Bu siparişi nasıl buldun?', 'How was this order?', 'Wie war diese Bestellung?', 'كيف وجدت هذا الطلب؟', 'Как вам этот заказ?'],
    [' yıldız', ' stars', ' Sterne', ' نجوم', ' звёзд'],
    ['Pakete dahil', 'Included in package', 'Im Paket enthalten', 'مشمول في الباقة', 'Входит в пакет'],
    // --- paketler / üyelik
    ['Yemek Paketleri', 'Meal packages', 'Essenspakete', 'باقات الوجبات', 'Пакеты питания'],
    ['Paketler', 'Packages', 'Pakete', 'الباقات', 'Пакеты'],
    ['Haftalık ve Aylık Ev Paketleri', 'Weekly and monthly home packages', 'Wöchentliche und monatliche Hauspakete', 'باقات منزلية أسبوعية وشهرية', 'Недельные и месячные домашние пакеты'],
    ['Haftalık', 'Weekly', 'Wöchentlich', 'أسبوعي', 'Недельный'],
    ['Aylık', 'Monthly', 'Monatlich', 'شهري', 'Месячный'],
    ['Haftalık veya aylık pakete geçerek %22\'ye varan avantaj kazan, her gün sipariş vermekle uğraşma.', 'Switch to a weekly or monthly package, save up to 22% and skip the daily ordering.', 'Wechsle zu einem Wochen- oder Monatspaket, spare bis zu 22 % und bestelle nicht mehr täglich.', 'انتقل إلى باقة أسبوعية أو شهرية ووفّر حتى 22% دون عناء الطلب كل يوم.', 'Перейдите на недельный или месячный пакет, экономьте до 22% и не заказывайте каждый день.'],
    ['%22\'ye Varan Avantaj', 'Save up to 22%', 'Bis zu 22 % sparen', 'وفّر حتى 22%', 'Экономия до 22%'],
    ['4 kap ev yemeğini günlük seç, istediğin gün atla.', 'Pick the 4-dish home meal daily, skip any day you like.', 'Wähle täglich das 4-Gang-Hausessen und überspringe Tage nach Wunsch.', 'اختر وجبة البيت من 4 أطباق يوميًا وتخطَّ أي يوم تشاء.', 'Выбирайте домашний обед из 4 блюд и пропускайте любой день.'],
    [' İndirimli', ' discount', ' Rabatt', ' خصم', ' скидка'],
    ['Günlük ', 'Daily ', 'Täglich ', 'يوميًا ', 'В день '],
    [' Gün)', ' days)', ' Tage)', ' يومًا)', ' дн.)'],
    [' gün teslimat', ' days of delivery', ' Liefertage', ' أيام توصيل', ' дней доставки'],
    [' günü atlandı', ' days skipped', ' Tage übersprungen', ' أيام تم تخطيها', ' дн. пропущено'],
    [' gün daha', ' more days', ' weitere Tage', ' أيام أخرى', ' дн. ещё'],
    [' gün', ' days', ' Tage', ' يومًا', ' дн.'],
    ['Seçili: ', 'Selected: ', 'Ausgewählt: ', 'المحدد: ', 'Выбрано: '],
    ['. Paketler hafta içi günleri kapsar.', '. Packages cover weekdays.', '. Pakete gelten für Werktage.', '. تشمل الباقات أيام الأسبوع.', '. Пакеты действуют в будние дни.'],
    ['Paketi Seç ve Devam Et', 'Choose package and continue', 'Paket wählen und fortfahren', 'اختر الباقة وتابع', 'Выбрать пакет и продолжить'],
    ['Paketler henüz hazır değil.', 'Packages are not ready yet.', 'Pakete sind noch nicht verfügbar.', 'الباقات غير جاهزة بعد.', 'Пакеты пока не готовы.'],
    [' günü yemeği atla', ' skip this day', ' Essen überspringen', ' تخطَّ وجبة هذا اليوم', ' пропустить этот день'],
    ['Atlanan gün için sipariş oluşmaz, hakkın korunur', 'No order is created for a skipped day, your credit is kept', 'Für übersprungene Tage entsteht keine Bestellung, dein Guthaben bleibt', 'لا يُنشأ طلب لليوم المتخطّى ويبقى حقك محفوظًا', 'Для пропущенного дня заказ не создаётся, право сохраняется'],
    ['En az bir gün seçili olmalı', 'At least one day must be selected', 'Mindestens ein Tag muss gewählt sein', 'يجب اختيار يوم واحد على الأقل', 'Нужно выбрать хотя бы один день'],
    ['Günü atla', 'Skip day', 'Tag überspringen', 'تخطَّ اليوم', 'Пропустить день'],
    ['Hangi günü atlamak istiyorsun?', 'Which day do you want to skip?', 'Welchen Tag möchtest du überspringen?', 'أي يوم تريد تخطيه؟', 'Какой день хотите пропустить?'],
    ['Atlanabilecek gün yok (bugün kapanan günler atlanamaz).', 'No days can be skipped (days that closed today cannot be skipped).', 'Keine Tage zum Überspringen (heute geschlossene Tage nicht möglich).', 'لا توجد أيام يمكن تخطيها (الأيام المغلقة اليوم لا تُتخطى).', 'Нет дней для пропуска (закрытые сегодня дни пропустить нельзя).'],
    ['Aktif Üyelik', 'Active membership', 'Aktive Mitgliedschaft', 'عضوية نشطة', 'Активная подписка'],
    ['Aktif paketin yok', 'You have no active package', 'Du hast kein aktives Paket', 'ليس لديك باقة نشطة', 'У вас нет активного пакета'],
    ['Üyeliğim', 'My membership', 'Meine Mitgliedschaft', 'عضويتي', 'Моя подписка'],
    ['Üyelik', 'Membership', 'Mitgliedschaft', 'العضوية', 'Подписка'],
    ['Sonraki Teslimat', 'Next delivery', 'Nächste Lieferung', 'التوصيل القادم', 'Следующая доставка'],
    ['Planlı gün yok', 'No planned days', 'Keine geplanten Tage', 'لا توجد أيام مخطّطة', 'Нет запланированных дней'],
    ['Duraklatıldı', 'Paused', 'Pausiert', 'متوقفة مؤقتًا', 'Приостановлено'],
    ['Duraklat', 'Pause', 'Pausieren', 'إيقاف مؤقت', 'Приостановить'],
    ['Devam Ettir', 'Resume', 'Fortsetzen', 'استئناف', 'Возобновить'],
    ['Paketi yenile', 'Renew package', 'Paket erneuern', 'جدّد الباقة', 'Продлить пакет'],
    ['Paket duraklatıldı, gelecek siparişler iptal edildi', 'Package paused, upcoming orders cancelled', 'Paket pausiert, kommende Bestellungen storniert', 'تم إيقاف الباقة مؤقتًا وإلغاء الطلبات القادمة', 'Пакет приостановлен, будущие заказы отменены'],
    ['Paket yeniden başladı', 'Package resumed', 'Paket wieder aktiv', 'تم استئناف الباقة', 'Пакет возобновлён'],
    ['Paketin aktif! ', 'Your package is active! ', 'Dein Paket ist aktiv! ', 'باقتك نشطة! ', 'Ваш пакет активен! '],
    [' tarihinde başlıyor.', ' it starts on this date.', ' startet an diesem Datum.', ' تبدأ في هذا التاريخ.', ' начинается в эту дату.'],
    [' günlük hakkın saklı. Yeni paketle birlikte kullanabilirsin.', ' days of credit are saved. You can use them with a new package.', ' Tage Guthaben sind gespeichert. Du kannst sie mit einem neuen Paket nutzen.', ' يومًا من رصيدك محفوظ. يمكنك استخدامه مع باقة جديدة.', ' дн. сохранены. Их можно использовать с новым пакетом.'],
    [' gün kaldı', ' days left', ' Tage übrig', ' أيام متبقية', ' дн. осталось'],
    [' · Paket', ' · Package', ' · Paket', ' · باقة', ' · Пакет'],
    [' Özel', ' Special', ' Spezial', ' مميز', ' Особое'],
    // --- profil / genel
    ['Profil', 'Profile', 'Profil', 'الملف الشخصي', 'Профиль'],
    ['Profilin güncellendi', 'Profile updated', 'Profil aktualisiert', 'تم تحديث ملفك', 'Профиль обновлён'],
    ['Kaydet', 'Save', 'Speichern', 'حفظ', 'Сохранить'],
    ['Sil', 'Delete', 'Löschen', 'حذف', 'Удалить'],
    ['Ara', 'Search', 'Suchen', 'بحث', 'Поиск'],
    ['Yönetici Paneli', 'Admin panel', 'Admin-Bereich', 'لوحة المدير', 'Панель администратора'],
    ['Mutfak Paneline Git', 'Go to kitchen panel', 'Zum Küchenbereich', 'الانتقال إلى لوحة المطبخ', 'Перейти в панель кухни'],
    ['Uygulamaya dön', 'Back to the app', 'Zurück zur App', 'العودة إلى التطبيق', 'Вернуться в приложение'],
    ['Bu sayfa mutfak personeline özeldir', 'This page is for kitchen staff only', 'Diese Seite ist nur für Küchenpersonal', 'هذه الصفحة لطاقم المطبخ فقط', 'Эта страница только для персонала кухни'],
    ['Tarayıcı oturum depolaması kapalı', 'Browser session storage is disabled', 'Sitzungsspeicher des Browsers ist deaktiviert', 'تخزين جلسة المتصفح معطّل', 'Хранилище сеанса браузера отключено'],
    ['Alt menü', 'Bottom menu', 'Untere Navigation', 'القائمة السفلية', 'Нижнее меню'],
    ['Giriş yapmalısın', 'You need to log in', 'Du musst dich anmelden', 'يجب تسجيل الدخول', 'Нужно войти'],
    ['Bu saat dilimi doldu', 'This time slot is full', 'Dieses Zeitfenster ist voll', 'اكتملت هذه الفترة الزمنية', 'Это время занято'],
    ['Sepet boş veya geçersiz', 'Cart is empty or invalid', 'Warenkorb ist leer oder ungültig', 'السلة فارغة أو غير صالحة', 'Корзина пуста или недействительна'],
    ['Bu adres seçili mutfağın teslimat bölgesinde değil', 'This address is outside the selected kitchen\'s delivery area', 'Diese Adresse liegt nicht im Liefergebiet der gewählten Küche', 'هذا العنوان خارج منطقة توصيل المطبخ المحدد', 'Этот адрес вне зоны доставки выбранной кухни'],
    ['Kayıtlı adresin bu mutfağın teslimat bölgesinde değil, bu şehir için yeni adres ekle', 'Your saved address is outside this kitchen\'s area, add a new address for this city', 'Deine gespeicherte Adresse liegt nicht im Gebiet dieser Küche, füge eine neue Adresse für diese Stadt hinzu', 'عنوانك المحفوظ خارج منطقة هذا المطبخ، أضف عنوانًا جديدًا لهذه المدينة', 'Ваш сохранённый адрес вне зоны этой кухни, добавьте новый адрес для этого города'],
    ['Bu adres silinsin mi?', 'Delete this address?', 'Diese Adresse löschen?', 'هل تريد حذف هذا العنوان؟', 'Удалить этот адрес?'],
    ["Yarının öğle ve akşam yemeklerini bu gece 00:00'a kadar seç, tam saatinde kapında ya da mutfakta hazır olsun.", "Choose tomorrow's lunch and dinner until 00:00 tonight; it will be at your door or ready at the kitchen right on time.", 'Wähle die Gerichte für morgen bis 00:00 Uhr heute Nacht – pünktlich an deiner Tür oder abholbereit in der Küche.', 'اختر وجبات غدٍ حتى الساعة 00:00 الليلة لتصلك في موعدها أو تكون جاهزة في المطبخ.', 'Выберите обед и ужин на завтра до 00:00 этой ночью — всё придёт вовремя к вашей двери или будет ждать на кухне.'],
    ["Alanya'nın yöresel çorbalarından Hatay'ın kabak boranisine, bulunduğun ilçeye özel günlük taze menü.", "From Alanya's regional soups to Hatay's squash boranis, a fresh daily menu special to your district.", 'Von Alanyas regionalen Suppen bis zu Hatays Kürbis-Borani – ein frisches Tagesmenü speziell für deinen Bezirk.', 'من شوربات ألانيا المحلية إلى كوسا بورانيا من هاتاي، قائمة يومية طازجة خاصة بمنطقتك.', 'От региональных супов Аланьи до тыквенного борани Хатая — свежее дневное меню для вашего района.'],
    ['sıcak teslimat', 'hot delivery', 'heiße Lieferung', 'توصيل ساخن', 'горячая доставка'],
    ['Kapat', 'Close', 'Schließen', 'إغلاق', 'Закрыть'],
    // --- aylar / günler
    ['Ocak', 'January', 'Januar', 'يناير', 'января'],
    ['Şubat', 'February', 'Februar', 'فبراير', 'февраля'],
    ['Mart', 'March', 'März', 'مارس', 'марта'],
    ['Nisan', 'April', 'April', 'أبريل', 'апреля'],
    ['Mayıs', 'May', 'Mai', 'مايو', 'мая'],
    ['Haziran', 'June', 'Juni', 'يونيو', 'июня'],
    ['Temmuz', 'July', 'Juli', 'يوليو', 'июля'],
    ['Ağustos', 'August', 'August', 'أغسطس', 'августа'],
    ['Eylül', 'September', 'September', 'سبتمبر', 'сентября'],
    ['Ekim', 'October', 'Oktober', 'أكتوبر', 'октября'],
    ['Kasım', 'November', 'November', 'نوفمبر', 'ноября'],
    ['Aralık', 'December', 'Dezember', 'ديسمبر', 'декабря'],
    ['Paz', 'Sun', 'So', 'الأحد', 'Вс'],
    ['Pzt', 'Mon', 'Mo', 'الاثنين', 'Пн'],
    ['Sal', 'Tue', 'Di', 'الثلاثاء', 'Вт'],
    ['Çar', 'Wed', 'Mi', 'الأربعاء', 'Ср'],
    ['Per', 'Thu', 'Do', 'الخميس', 'Чт'],
    ['Cum', 'Fri', 'Fr', 'الجمعة', 'Пт'],
    ['Cmt', 'Sat', 'Sa', 'السبت', 'Сб']
  ];

  var EXACT = { 'Ev': ['Home', 'Zuhause', 'المنزل', 'Дом'], 'Ofis': ['Office', 'Büro', 'المكتب', 'Офис'] };
  var IDX = { tr: 0, en: 1, de: 2, ar: 3, ru: 4 };
  var map = {}, rx = null;
  function build() {
    if (cur === 'tr') return;
    var i = IDX[cur], keys = [];
    R.forEach(function (r) { if (!map[r[0]]) { map[r[0]] = r[i]; keys.push(r[0]); } });
    keys.sort(function (a, b) { return b.length - a.length; });
    var esc = function (s) { return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); };
    var L = /^[\p{L}\p{N}]/u, E = /[\p{L}\p{N}]$/u;
    rx = new RegExp(keys.map(function (k) { return (L.test(k) ? '(?<![\\p{L}\\p{N}])' : '') + esc(k) + (E.test(k) ? '(?![\\p{L}\\p{N}])' : ''); }).join('|'), 'gu');
  }
  function tr(s) {
    if (cur === 'tr' || !s || !rx) return s;
    var tt = s.trim(); if (EXACT[tt]) return s.replace(tt, EXACT[tt][IDX[cur] - 1]);
    return s.replace(rx, function (m) { return map[m] != null ? map[m] : m; });
  }

  var done = new WeakMap();
  function node(n) {
    var t = n.nodeType;
    if (t === 3) {
      var p = n.parentNode; if (!p) return;
      var tag = p.nodeName; if (tag === 'SCRIPT' || tag === 'STYLE' || tag === 'TEXTAREA') return;
      if (p.classList && p.classList.contains('material-symbols-outlined')) return;
      var prev = done.get(n); if (prev !== undefined && prev === n.data) return;
      if (!/\S/.test(n.data)) return;
      var out = tr(n.data); if (out !== n.data) { n.data = out; } done.set(n, n.data);
    } else if (t === 1) {
      if (n.nodeName === 'SCRIPT' || n.nodeName === 'STYLE') return;
      ['placeholder', 'aria-label', 'title', 'alt'].forEach(function (a) { if (n.hasAttribute && n.hasAttribute(a)) { var v = n.getAttribute(a), o = tr(v); if (o !== v) n.setAttribute(a, o); } });
      for (var c = n.firstChild; c; c = c.nextSibling) node(c);
    }
  }

  function setDir() { document.documentElement.lang = cur; document.documentElement.dir = cur === 'ar' ? 'rtl' : 'ltr'; }

  function mountSwitcher() {
    if (document.getElementById('es-lang-btn')) return;
    var st = document.createElement('style');
    st.textContent = '#es-lang-btn{position:fixed;right:14px;bottom:136px;z-index:99999;min-width:44px;height:44px;padding:0 10px;border-radius:22px;border:1px solid rgba(0,0,0,.2);background:#fff;color:#222;font:700 13px/1 sans-serif;box-shadow:0 2px 8px rgba(0,0,0,.25);cursor:pointer}#es-lang-menu{position:fixed;right:14px;bottom:188px;z-index:99999;background:#fff;color:#222;border-radius:12px;box-shadow:0 4px 16px rgba(0,0,0,.3);padding:6px;display:none;flex-direction:column;min-width:140px}#es-lang-menu button{background:none;border:0;text-align:left;padding:10px 12px;font:600 14px sans-serif;border-radius:8px;cursor:pointer;color:#222}#es-lang-menu button:hover{background:#eee}#es-lang-menu button.on{background:#D6E3FF}';
    document.head.appendChild(st);
    var b = document.createElement('button'); b.id = 'es-lang-btn'; b.type = 'button'; b.setAttribute('aria-label', 'Language');
    b.textContent = '🌐 ' + LANGS.filter(function (l) { return l[0] === cur; })[0][2];
    var m = document.createElement('div'); m.id = 'es-lang-menu';
    LANGS.forEach(function (l) {
      var o = document.createElement('button'); o.type = 'button'; o.textContent = l[1]; if (l[0] === cur) o.className = 'on';
      o.onclick = function () { try { localStorage.setItem('es_lang', l[0]); } catch (e) { /* yok say */ } location.reload(); };
      m.appendChild(o);
    });
    b.onclick = function () { m.style.display = m.style.display === 'flex' ? 'none' : 'flex'; };
    document.documentElement.appendChild(m); document.documentElement.appendChild(b);
  }

  function start() {
    setDir();
    if (!STAFF) mountSwitcher();
    if (cur === 'tr' || STAFF) return;
    build();
    var queued = false, pending = [];
    function flush() { queued = false; var l = pending; pending = []; l.forEach(node); }
    var mo = new MutationObserver(function (muts) {
      muts.forEach(function (m) {
        if (m.type === 'childList') m.addedNodes.forEach(function (n) { pending.push(n); });
        else if (m.type === 'characterData') pending.push(m.target);
      });
      if (!queued) { queued = true; requestAnimationFrame(flush); }
    });
    node(document.body || document.documentElement);
    mo.observe(document.documentElement, { childList: true, subtree: true, characterData: true });
    // confirm() ve alert() metinleri
    var oc = window.confirm.bind(window), oa = window.alert.bind(window);
    window.confirm = function (m) { return oc(tr(String(m))); };
    window.alert = function (m) { return oa(tr(String(m))); };
  }

  window.ES_I18N = { lang: cur, tr: tr };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start); else start();
})();
