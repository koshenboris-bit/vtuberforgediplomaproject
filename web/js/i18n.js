const translations = {
  en: {
    brandSubtitle: "Learning platform",
    navHome: "Home", navLogin: "Login", navRegister: "Register", navLessons: "Lessons", navNews: "News", navProfile: "Profile", navAdmin: "Admin", navLogout: "Logout",
    heroKicker: "VTuber creator academy by AITU",
    heroTitle: 'Forge your virtual identity <span class="gradient-text">and go live like a pro</span>.',
    heroSubtitle: "Learn avatar creation, OBS setup, streaming confidence, visual branding, and the tech workflow behind modern VTubing.",
    ctaTryVtuber: "Try becoming a VTuber", ctaStart: "Start the forge", ctaLogin: "Enter lab", ctaContinue: "Continue learning",
    statTracks: "Creator tracks from avatar basics to full stream production.", statAccess: "Role-based access for students, creators, and admins.", statSync: "Tap to pass lessons and sync progress with the backend.", holoLive: "Live-ready", holoCreator: "Creator mode",
    whatLabel: "What you unlock", whatTitle: "A futuristic creator hub with real learning flow.", whatText: "VTuberForge feels like a digital studio: clear structure, protected pages, lesson progress, and a premium academic-tech atmosphere.",
    featureAccessTitle: "Smart access", featureAccessText: "Guests see the welcome path. Students enter lessons. Admin tools stay locked behind role checks.", featureRoadmapTitle: "Studio roadmap", featureRoadmapText: "Lessons are grouped into intro videos and full tutorial series, so every step feels clear and cinematic.", featureProgressTitle: "Progress sync", featureProgressText: "Completed courses connect to the backend API and show up across profile and lesson cards.",
    aboutLabel: "About us", aboutTitle: "Meet the team behind VTuberForge.", aboutText: "We are a small creator-focused team from Astana IT University building a practical space for future VTubers.",
    ariRole: "VTuber Consultant", ariText: "VTuber and 3D artist. Ari helps students choose a character concept, understand stream culture, and plan first content ideas.", bekaRole: "Tech & Tools Expert", bekaText: "Beka handles OBS, tracking, microphone setup, plugins, and clean explanations for confusing tools.", dideRole: "Art & Design Lead", dideText: "Dide guides VRoid Studio, Blender basics, color palettes, avatar personality, and expressions.",
    point1: "OBS scenes, overlays, audio, and stream polish", point2: "2D/3D avatar workflow from idea to presentation", point3: "Creator growth, content planning, and personal branding",
    loginLabel: "Sign in", loginTitle: "Welcome back", loginText: "Use your account to access lessons, news, and your profile.", inputLogin: "Login", inputPassword: "Password", loginButton: "Login",
    registerLabel: "Create account", registerTitle: "Join the platform", registerText: "Registration creates your user, generates tokens, and sends you straight into learning.", registerButton: "Create account",
    lessonsLabel: "Watch & learn", lessonsTitle: "Video Library", lessonsText: 'Lessons are split into two visual categories: <strong>Introduction Videos</strong> and <strong>Full Tutorial Series</strong>.', lessonSearchPlaceholder: "Search lessons...", introVideos: "Introduction Videos", fullSeries: "Full Tutorial Series",
    lessonFullCourse: "Full Course", lessonIntro: "Intro", lessonCompleted: "Completed", lessonWatch: "Watch", lessonAlreadyCompleted: "Already completed", lessonMarkCompleted: "Mark completed", noIntroLessons: "No intro lessons yet.", noFullLessons: "No full courses yet.", noSearchLessons: "No lessons match your search.",
    newsLabel: "Newsroom", newsTitle: "Platform News & Updates", newsText: "A more interesting news layout with a featured update, then a feed of live cards.", featuredUpdate: "Featured update", newsUpdate: "Update", newsBulletin: "VTuberForge bulletin", newsLive: "Live", noNews: "No news yet.", noMoreNews: "No more news items yet.",
    newsComments: "Comments", newsNoComments: "No comments yet.", newsCommentPlaceholder: "Write a comment...", newsShowComments: "Show all comments", newsLike: "Like", newsSave: "Save",
    profileLabel: "Your profile", profileTitle: "Progress Dashboard", profileRoleLabel: "Role:", profileLearner: "Learner", profileTracked: "Progress tracked", profileLastTitle: "Last completed lesson", profileCompletedTitle: "Completed courses", profileFinished: "finished lesson(s)", profileListTitle: "Completed list", profileTipTitle: "Tip", profileTipText: 'Open the lessons page and click <strong>Mark completed</strong> after you finish a course. Your profile will update immediately.', profileNoCompleted: "No completed lessons yet", profileNoLessons: "You have not completed any lessons yet.",
    profileLikedNewsTitle: "Liked news", profileLikedNewsCount: "liked item(s)", profileSavedNewsTitle: "Saved news", profileSavedNewsCount: "saved item(s)", profileNewsCommentsTitle: "Your news comments", profileNewsCommentsCount: "comment(s)", profileNoLikedNews: "No liked news yet.", profileNoSavedNews: "No saved news yet.", profileNoNewsComments: "No comments yet.", profileNewsComment: "News comment",
    adminLabel: "Admin only", adminTitle: "Control Panel", adminText: "This page is hidden from normal users in the navbar and protected by route checks.", adminCreateLesson: "Create lesson", adminLessonTitlePh: "Lesson title", adminLessonDescPh: "Lesson description", adminIntroOption: "Intro", adminFullOption: "Full Course", adminYoutubePh: "YouTube link", adminCreateLessonButton: "Create lesson", adminCreateNews: "Create news", adminNewsTitlePh: "News title", adminNewsContentPh: "News content", adminCreateNewsButton: "Create news", adminCurrentLessons: "Current lessons", adminCurrentNews: "Current news", adminNoLessons: "No lessons yet.", adminNoNews: "No news yet.", adminDelete: "Delete",
    tryLabel: "Live avatar test", tryTitle: "Try becoming a VTuber", tryText: "Upload a 3D VRM/GLB model or a Live2D model folder, turn on your camera, and watch it follow your movement.", tryMode3d: "3D model", tryMode2d: "Live2D model", tryEmptyTitle: "Upload a 3D model", tryEmptyText: "VRM, GLB, or GLTF works best.", tryUploadLabel: "3D model file", tryCameraButton: "Start camera", tryResetButton: "Reset pose", tryStatusLabel: "Status", tryStatusIdle: "Waiting for model", tryFaceLabel: "Face tracking", tryFaceOff: "Off", tryModelLabel: "Model", tryModelEmpty: "Not loaded", tryDebugTitle: "Live2D debug", tryNoteTitle: "Important", tryNoteText: "Facial mimic works best on VRM models or GLB models with morph targets.",
    toastMissingData: "Missing data", toastLoginPassword: "Please enter login and password.", toastLoginFailed: "Login failed", toastWelcomeBack: "Welcome back", toastLoginSuccess: "Login successful.", toastRegistrationFailed: "Registration failed", toastAccountCreated: "Account created", toastRegisterSuccess: "Registration successful.", toastNotLoggedIn: "Not logged in", toastSignInAgain: "Please sign in again.", toastCantMark: "Can't mark lesson", toastCompleted: "Completed", toastLessonPassed: "Lesson marked as passed.", toastError: "Error", toastLessonCreated: "Lesson created", toastLessonAdded: "New lesson added.", toastLessonDeleted: "Lesson deleted", toastRemoved: "Removed successfully.", toastNewsCreated: "News created", toastNewsAdded: "Announcement added.", toastNewsDeleted: "News deleted", toastProfileError: "Profile error", toastFillLesson: "Fill all lesson fields.", toastFillNews: "Enter title and content.", toastCommentEmpty: "Enter a comment.", toastCommentAdded: "Comment added.", toastNewsLiked: "Liked", toastNewsUnliked: "Like removed", toastNewsSaved: "Saved", toastNewsUnsaved: "Save removed", confirmDeleteLesson: "Delete this lesson?", confirmDeleteNews: "Delete this news item?",
    footerBrand: "VTuberForge x Astana IT University", footerBackend: "KBA"
  },
  ru: {
    brandSubtitle: "Обучающая платформа",
    navHome: "Главная", navLogin: "Войти", navRegister: "Регистрация", navLessons: "Уроки", navNews: "Новости", navProfile: "Профиль", navAdmin: "Админ", navLogout: "Выйти",
    heroKicker: "VTuber creator academy от AITU", heroTitle: 'Создай свою виртуальную личность <span class="gradient-text">и выходи в эфир как профи</span>.', heroSubtitle: "Изучи создание аватара, настройку OBS, уверенный стриминг, визуальный брендинг и технический workflow современного VTubing.",
    ctaTryVtuber: "Попробуй стать витубером", ctaStart: "Начать", ctaLogin: "Войти", ctaContinue: "Продолжить обучение",
    statTracks: "Треки от основ аватара до полноценного стрима.", statAccess: "Доступ для студентов, креаторов и админов.", statSync: "Отмечай уроки и синхронизируй прогресс.", holoLive: "Готов к эфиру", holoCreator: "Creator mode",
    whatLabel: "Что внутри", whatTitle: "Футуристичный creator hub с настоящим learning flow.", whatText: "VTuberForge ощущается как digital studio: понятная структура, защищенные страницы и прогресс уроков.",
    featureAccessTitle: "Smart access", featureAccessText: "Гости видят welcome path. Студенты переходят к урокам. Admin tools закрыты.", featureRoadmapTitle: "Studio roadmap", featureRoadmapText: "Уроки разделены на вводные видео и полные серии туториалов.", featureProgressTitle: "Progress sync", featureProgressText: "Пройденные курсы отображаются в профиле и карточках.",
    aboutLabel: "О нас", aboutTitle: "Познакомьтесь с командой VTuberForge.", aboutText: "Мы команда из Astana IT University, которая делает практичное пространство для будущих VTubers.",
    ariRole: "VTuber-консультант", ariText: "Ari помогает выбрать концепт персонажа, понять культуру стримов и спланировать первые идеи.", bekaRole: "Tech & Tools Expert", bekaText: "Beka отвечает за OBS, tracking, микрофон, плагины и понятные объяснения.", dideRole: "Art & Design Lead", dideText: "Dide ведет VRoid Studio, Blender, палитры, характер аватара и выражения.",
    point1: "OBS сцены, оверлеи, аудио и полировка стрима", point2: "2D/3D avatar workflow от идеи до презентации", point3: "Рост креатора, контент-план и личный бренд",
    loginLabel: "Вход", loginTitle: "С возвращением", loginText: "Войдите в аккаунт, чтобы открыть уроки, новости и профиль.", inputLogin: "Логин", inputPassword: "Пароль", loginButton: "Войти",
    registerLabel: "Создать аккаунт", registerTitle: "Присоединяйся к платформе", registerText: "Регистрация создаст пользователя и отправит тебя к обучению.", registerButton: "Создать аккаунт",
    lessonsLabel: "Смотри и учись", lessonsTitle: "Видео библиотека", lessonsText: 'Уроки разделены на две визуальные категории: <strong>Вводные видео</strong> и <strong>Полные серии туториалов</strong>.', lessonSearchPlaceholder: "Поиск уроков...", introVideos: "Вводные видео", fullSeries: "Полные серии туториалов",
    lessonFullCourse: "Полный курс", lessonIntro: "Вводный", lessonCompleted: "Завершено", lessonWatch: "Смотреть", lessonAlreadyCompleted: "Уже завершено", lessonMarkCompleted: "Отметить", noIntroLessons: "Вводных уроков пока нет.", noFullLessons: "Полных курсов пока нет.", noSearchLessons: "По вашему запросу уроки не найдены.",
    newsLabel: "Новости", newsTitle: "Новости и обновления платформы", newsText: "Главный апдейт и карточки свежих новостей.", featuredUpdate: "Главное обновление", newsUpdate: "Обновление", newsBulletin: "Бюллетень VTuberForge", newsLive: "Live", noNews: "Новостей пока нет.", noMoreNews: "Больше новостей пока нет.",
    newsComments: "Комментарии", newsNoComments: "Комментариев пока нет.", newsCommentPlaceholder: "Написать комментарий...", newsShowComments: "Показать все комментарии", newsLike: "Лайк", newsSave: "Сохранить",
    profileLabel: "Твой профиль", profileTitle: "Панель прогресса", profileRoleLabel: "Роль:", profileLearner: "Ученик", profileTracked: "Прогресс отслеживается", profileLastTitle: "Последний завершенный урок", profileCompletedTitle: "Завершенные курсы", profileFinished: "завершенных урок(ов)", profileListTitle: "Список завершенных", profileTipTitle: "Совет", profileTipText: 'Открой страницу уроков и нажми <strong>Отметить</strong> после завершения курса.', profileNoCompleted: "Завершенных уроков пока нет", profileNoLessons: "Ты пока не завершил ни одного урока.",
    profileLikedNewsTitle: "Понравившиеся новости", profileLikedNewsCount: "лайк(ов)", profileSavedNewsTitle: "Сохраненные новости", profileSavedNewsCount: "сохранено", profileNewsCommentsTitle: "Твои комментарии", profileNewsCommentsCount: "комментариев", profileNoLikedNews: "Нет понравившихся новостей.", profileNoSavedNews: "Нет сохраненных новостей.", profileNoNewsComments: "Комментариев пока нет.", profileNewsComment: "Комментарий к новости",
    adminLabel: "Только админ", adminTitle: "Панель управления", adminText: "Эта страница скрыта от обычных пользователей и защищена проверками маршрута.", adminCreateLesson: "Создать урок", adminLessonTitlePh: "Название урока", adminLessonDescPh: "Описание урока", adminIntroOption: "Вводный", adminFullOption: "Полный курс", adminYoutubePh: "Ссылка YouTube", adminCreateLessonButton: "Создать урок", adminCreateNews: "Создать новость", adminNewsTitlePh: "Заголовок новости", adminNewsContentPh: "Текст новости", adminCreateNewsButton: "Создать новость", adminCurrentLessons: "Текущие уроки", adminCurrentNews: "Текущие новости", adminNoLessons: "Уроков пока нет.", adminNoNews: "Новостей пока нет.", adminDelete: "Удалить",
    tryLabel: "Тест live-аватара", tryTitle: "Попробуй стать витубером", tryText: "Загрузи 3D модель или папку Live2D, включи камеру и посмотри, как аватар повторяет движения.", tryMode3d: "3D модель", tryMode2d: "Live2D модель", tryEmptyTitle: "Загрузи 3D модель", tryEmptyText: "Лучше всего подходят VRM, GLB или GLTF.", tryUploadLabel: "Файл 3D модели", tryCameraButton: "Включить камеру", tryResetButton: "Сбросить позу", tryStatusLabel: "Статус", tryStatusIdle: "Ожидание модели", tryFaceLabel: "Face tracking", tryFaceOff: "Выключен", tryModelLabel: "Модель", tryModelEmpty: "Не загружена", tryDebugTitle: "Live2D debug", tryNoteTitle: "Важно", tryNoteText: "Мимика лучше работает на VRM или GLB моделях с morph targets.",
    toastMissingData: "Не хватает данных", toastLoginPassword: "Введите логин и пароль.", toastLoginFailed: "Вход не удался", toastWelcomeBack: "С возвращением", toastLoginSuccess: "Вход выполнен успешно.", toastRegistrationFailed: "Регистрация не удалась", toastAccountCreated: "Аккаунт создан", toastRegisterSuccess: "Регистрация прошла успешно.", toastNotLoggedIn: "Вы не вошли", toastSignInAgain: "Пожалуйста, войдите снова.", toastCantMark: "Не удалось отметить урок", toastCompleted: "Готово", toastLessonPassed: "Урок отмечен как пройденный.", toastError: "Ошибка", toastLessonCreated: "Урок создан", toastLessonAdded: "Новый урок добавлен.", toastLessonDeleted: "Урок удален", toastRemoved: "Успешно удалено.", toastNewsCreated: "Новость создана", toastNewsAdded: "Объявление добавлено.", toastNewsDeleted: "Новость удалена", toastProfileError: "Ошибка профиля", toastFillLesson: "Заполните все поля урока.", toastFillNews: "Введите заголовок и текст.", toastCommentEmpty: "Введите комментарий.", toastCommentAdded: "Комментарий добавлен.", toastNewsLiked: "Лайк поставлен", toastNewsUnliked: "Лайк убран", toastNewsSaved: "Сохранено", toastNewsUnsaved: "Удалено из сохраненных", confirmDeleteLesson: "Удалить этот урок?", confirmDeleteNews: "Удалить эту новость?",
    footerBrand: "VTuberForge x Astana IT University", footerBackend: "KBA"
  },

  kk: {
    brandSubtitle: "Оқыту платформасы",
    navHome: "Басты бет", navLogin: "Кіру", navRegister: "Тіркелу", navLessons: "Сабақтар", navNews: "Жаңалықтар", navProfile: "Профиль", navAdmin: "Әкімші", navLogout: "Шығу",
    heroKicker: "AITU-дан VTuber creator academy",
    heroTitle: 'Виртуалды тұлғаңды жаса <span class="gradient-text">және эфирге профессионалдай шық</span>.',
    heroSubtitle: "Аватар жасауды, OBS баптауды, стриминг сенімділігін, визуалды брендингті және заманауи VTubing-тің техникалық workflow-ын үйрен.",
    ctaTryVtuber: "VTuber болып көр", ctaStart: "Бастау", ctaLogin: "Зертханаға кіру", ctaContinue: "Оқуды жалғастыру",
    statTracks: "Аватар негіздерінен толық стрим өндірісіне дейінгі трек.", statAccess: "Студенттер, креаторлар және әкімшілер үшін рөлге негізделген қол жеткізу.", statSync: "Сабақтарды белгілеп, серверге прогресті синхрондаңыз.", holoLive: "Эфирге дайын", holoCreator: "Creator mode",
    whatLabel: "Не ашасың", whatTitle: "Нақты оқу ағымы бар футуристік creator hub.", whatText: "VTuberForge цифрлық студия сияқты сезіледі: анық құрылым, қорғалған беттер, сабақ прогресі және premium academic-tech атмосфера.",
    featureAccessTitle: "Ақылды қол жеткізу", featureAccessText: "Қонақтар welcome path-ты көреді. Студенттер сабаққа кіреді. Admin tools рөл тексеруімен жабылған.", featureRoadmapTitle: "Studio roadmap", featureRoadmapText: "Сабақтар кіріспе бейнелер мен толық оқу сериялары болып бөлінген, сондықтан әр қадам анық.", featureProgressTitle: "Progress sync", featureProgressText: "Аяқталған курстар бэкенд API-мен байланысып, профиль мен сабақ карточкаларында көрінеді.",
    aboutLabel: "Біз туралы", aboutTitle: "VTuberForge командасымен танысыңыз.", aboutText: "Біз болашақ VTuber-лерге арналған практикалық кеңістік жасайтын Astana IT University-дің шағын командасымыз.",
    ariRole: "VTuber кеңесшісі", ariText: "VTuber және 3D суретші. Ari студенттерге кейіпкер концептін таңдауға, стрим мәдениетін түсінуге және алғашқы контент идеяларын жоспарлауға көмектеседі.", bekaRole: "Tech & Tools сарапшысы", bekaText: "Beka OBS, tracking, микрофон баптауы, плагиндер және күрделі құралдарға түсінікті түсіндірмелерді қамтамасыз етеді.", dideRole: "Art & Design жетекшісі", dideText: "Dide VRoid Studio, Blender негіздері, түс палитралары, аватар тұлғасы мен эмоцияларды бағыттайды.",
    point1: "OBS сахналары, оверлейлер, аудио және стрим сапасы", point2: "Идеядан презентацияға дейінгі 2D/3D аватар workflow", point3: "Креатор өсімі, контент жоспарлау және жеке бренд",
    loginLabel: "Кіру", loginTitle: "Қайта келдіңіз", loginText: "Сабақтарға, жаңалықтарға және профиліңізге кіру үшін аккаунтыңызды пайдаланыңыз.", inputLogin: "Логин", inputPassword: "Құпия сөз", loginButton: "Кіру",
    registerLabel: "Аккаунт жасау", registerTitle: "Платформаға қосылыңыз", registerText: "Тіркелу пайдаланушы жасайды, токендер береді және сізді оқуға жібереді.", registerButton: "Аккаунт жасау",
    lessonsLabel: "Көріп үйрен", lessonsTitle: "Бейне кітапхана", lessonsText: 'Сабақтар екі визуалды санатқа бөлінген: <strong>Кіріспе бейнелер</strong> және <strong>Толық оқу сериялары</strong>.', lessonSearchPlaceholder: "Сабақтарды іздеу...", introVideos: "Кіріспе бейнелер", fullSeries: "Толық оқу сериялары",
    lessonFullCourse: "Толық курс", lessonIntro: "Кіріспе", lessonCompleted: "Аяқталды", lessonWatch: "Көру", lessonAlreadyCompleted: "Аяқталған", lessonMarkCompleted: "Аяқталды деп белгілеу", noIntroLessons: "Кіріспе сабақтар әлі жоқ.", noFullLessons: "Толық курстар әлі жоқ.", noSearchLessons: "Іздеуіңізге сай сабақтар табылмады.",
    newsLabel: "Жаңалықтар бөлімі", newsTitle: "Платформа жаңалықтары мен жаңартулары", newsText: "Негізгі жаңарту және тірі карточкалар ағыны.", featuredUpdate: "Негізгі жаңарту", newsUpdate: "Жаңарту", newsBulletin: "VTuberForge бюллетені", newsLive: "Тікелей эфир", noNews: "Жаңалықтар әлі жоқ.", noMoreNews: "Басқа жаңалықтар әлі жоқ.",
    newsComments: "Пікірлер", newsNoComments: "Пікірлер әлі жоқ.", newsCommentPlaceholder: "Пікір жазыңыз...", newsShowComments: "Барлық пікірлерді көрсету", newsLike: "Ұнату", newsSave: "Сақтау",
    profileLabel: "Сіздің профиліңіз", profileTitle: "Прогресс тақтасы", profileRoleLabel: "Рөл:", profileLearner: "Оқушы", profileTracked: "Прогресс қадағаланады", profileLastTitle: "Соңғы аяқталған сабақ", profileCompletedTitle: "Аяқталған курстар", profileFinished: "аяқталған сабақ(тар)", profileListTitle: "Аяқталғандар тізімі", profileTipTitle: "Кеңес", profileTipText: 'Сабақтар бетін ашып, курсты аяқтағаннан кейін <strong>Аяқталды деп белгілеу</strong> батырмасын басыңыз.', profileNoCompleted: "Аяқталған сабақтар әлі жоқ", profileNoLessons: "Сіз әлі ешбір сабақты аяқтаған жоқсыз.",
    profileLikedNewsTitle: "Ұнатылған жаңалықтар", profileLikedNewsCount: "ұнату(лар)", profileSavedNewsTitle: "Сақталған жаңалықтар", profileSavedNewsCount: "сақталған(дар)", profileNewsCommentsTitle: "Сіздің пікірлеріңіз", profileNewsCommentsCount: "пікір(лер)", profileNoLikedNews: "Ұнатылған жаңалықтар жоқ.", profileNoSavedNews: "Сақталған жаңалықтар жоқ.", profileNoNewsComments: "Пікірлер әлі жоқ.", profileNewsComment: "Жаңалыққа пікір",
    adminLabel: "Тек әкімші", adminTitle: "Басқару тақтасы", adminText: "Бұл бет қарапайым пайдаланушылардан жасырын және маршрут тексеруімен қорғалған.", adminCreateLesson: "Сабақ жасау", adminLessonTitlePh: "Сабақ атауы", adminLessonDescPh: "Сабақ сипаттамасы", adminIntroOption: "Кіріспе", adminFullOption: "Толық курс", adminYoutubePh: "YouTube сілтемесі", adminCreateLessonButton: "Сабақ жасау", adminCreateNews: "Жаңалық жасау", adminNewsTitlePh: "Жаңалық тақырыбы", adminNewsContentPh: "Жаңалық мазмұны", adminCreateNewsButton: "Жаңалық жасау", adminCurrentLessons: "Ағымдағы сабақтар", adminCurrentNews: "Ағымдағы жаңалықтар", adminNoLessons: "Сабақтар әлі жоқ.", adminNoNews: "Жаңалықтар әлі жоқ.", adminDelete: "Жою",
    tryLabel: "Тірі аватар сынағы", tryTitle: "VTuber болып көріңіз", tryText: "3D VRM/GLB немесе Live2D модель папкасын жүктеп, камераны қосып, аватардың қозғалысыңызды қайталауын бақылаңыз.", tryMode3d: "3D модель", tryMode2d: "Live2D модель", tryEmptyTitle: "3D модель жүктеңіз", tryEmptyText: "VRM, GLB немесе GLTF жақсы жұмыс істейді.", tryUploadLabel: "3D модель файлы", tryCameraButton: "Камераны қосу", tryResetButton: "Позаны сіфірлеу", tryStatusLabel: "Күй", tryStatusIdle: "Модель күтілуде", tryFaceLabel: "Face tracking", tryFaceOff: "Өшірулі", tryModelLabel: "Модель", tryModelEmpty: "Жүктелмеген", tryDebugTitle: "Live2D debug", tryNoteTitle: "Маңызды", tryNoteText: "Бет мимикасы VRM немесе morph target-пен GLB модельдерінде жақсы жұмыс істейді.",
    toastMissingData: "Деректер жетіспейді", toastLoginPassword: "Логин мен құпия сөзді енгізіңіз.", toastLoginFailed: "Кіру сәтсіз болды", toastWelcomeBack: "Қайта келдіңіз", toastLoginSuccess: "Сәтті кіру.", toastRegistrationFailed: "Тіркелу сәтсіз болды", toastAccountCreated: "Аккаунт жасалды", toastRegisterSuccess: "Тіркелу сәтті аяқталды.", toastNotLoggedIn: "Сіз кірмегенсіз", toastSignInAgain: "Қайта кіріңіз.", toastCantMark: "Сабақты белгілеу мүмкін емес", toastCompleted: "Аяқталды", toastLessonPassed: "Сабақ өтілді деп белгіленді.", toastError: "Қате", toastLessonCreated: "Сабақ жасалды", toastLessonAdded: "Жаңа сабақ қосылды.", toastLessonDeleted: "Сабақ жойылды", toastRemoved: "Сәтті жойылды.", toastNewsCreated: "Жаңалық жасалды", toastNewsAdded: "Хабарландыру қосылды.", toastNewsDeleted: "Жаңалық жойылды", toastProfileError: "Профиль қатесі", toastFillLesson: "Сабақтың барлық өрістерін толтырыңыз.", toastFillNews: "Тақырып пен мазмұнды енгізіңіз.", toastCommentEmpty: "Пікір енгізіңіз.", toastCommentAdded: "Пікір қосылды.", toastNewsLiked: "Ұнатылды", toastNewsUnliked: "Ұнату алынды", toastNewsSaved: "Сақталды", toastNewsUnsaved: "Сақтаудан алынды", confirmDeleteLesson: "Бұл сабақты жою керек пе?", confirmDeleteNews: "Бұл жаңалықты жою керек пе?",
    footerBrand: "VTuberForge x Astana IT University", footerBackend: "KBA"
  }
};

function getCurrentLanguage() {
  return localStorage.getItem("vtuberforge-lang") || "en";
}

function fallbackLabel(key) {
  const manual = { adminDelete: "Delete", lessonDelete: "Delete", newsDelete: "Delete" };
  if (manual[key]) return manual[key];
  return String(key || "")
    .replace(/([a-z0-9])([A-Z])/g, "$1 $2")
    .replace(/[_-]+/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .replace(/^./, char => char.toUpperCase());
}

function t(key) {
  const lang = getCurrentLanguage();
  return translations[lang]?.[key] ?? translations.en[key] ?? fallbackLabel(key);
}

function setLanguage(lang) {
  const dictionary = translations[lang] || translations.en;
  document.documentElement.lang = lang;

  document.querySelectorAll("[data-i18n]").forEach((element) => {
    element.textContent = dictionary[element.dataset.i18n] ?? translations.en[element.dataset.i18n] ?? fallbackLabel(element.dataset.i18n);
  });
  document.querySelectorAll("[data-i18n-html]").forEach((element) => {
    element.innerHTML = dictionary[element.dataset.i18nHtml] ?? translations.en[element.dataset.i18nHtml] ?? fallbackLabel(element.dataset.i18nHtml);
  });
  document.querySelectorAll("[data-i18n-placeholder]").forEach((element) => {
    const key = element.dataset.i18nPlaceholder;
    element.setAttribute("placeholder", dictionary[key] ?? translations.en[key] ?? fallbackLabel(key));
  });
  document.querySelectorAll("[data-lang-btn]").forEach((button) => {
    button.classList.toggle("active", button.dataset.langBtn === lang);
  });

  localStorage.setItem("vtuberforge-lang", lang);
  window.dispatchEvent(new CustomEvent("vtuberforge:languagechange", { detail: { lang } }));
}

function localizeLesson(lesson) {
  const lang = getCurrentLanguage();
  const current = lesson?.translations?.[lang] || lesson?.translations?.en || {};
  return { ...lesson, title: current.title || lesson?.title || "", description: current.description || lesson?.description || "" };
}

function localizeNews(item) {
  const lang = getCurrentLanguage();
  const current = item?.translations?.[lang] || item?.translations?.en || {};
  return { ...item, title: current.title || item?.title || "", content: current.content || item?.content || "" };
}

window.t = t;
window.setLanguage = setLanguage;
window.getCurrentLanguage = getCurrentLanguage;
window.localizeLesson = localizeLesson;
window.localizeNews = localizeNews;

document.addEventListener("DOMContentLoaded", () => {
  document.querySelectorAll("[data-lang-btn]").forEach((button) => {
    button.addEventListener("click", () => setLanguage(button.dataset.langBtn));
  });
  setLanguage(getCurrentLanguage());
});
