/* aqw-shared.js — AQW Data Store
   All pages read/write from here via localStorage.
   Initialised with default data on first visit. */
(function (global) {
  'use strict';

  var K = { JOBS: 'aqw_jobs', NEWS: 'aqw_news', SUBS: 'aqw_subs' };

  /* ── Default data ───────────────────────────── */
  var DEFAULT_JOBS = [
    {
      id: 1, active: true, featured: true,
      title:        'Оператор виробництва автомобільних фар',
      country:      'Словаччина',
      city:         'м. Топольчани',
      salary:       '850–1000€ нетто',
      requirements: 'Чоловіки, жінки та сімейні пари від 18 до 55 років',
      schedule:     'Тризмінний графік, 8 год / зміна',
      image:        'https://alexxqualitywork.com/pic/0NN5QOACIqmqPAFyWDPBGPZI.jpg',
      description:  '<p>Виробниче підприємство з виготовлення автомобільних фар запрошує операторів виробничої лінії.</p><h4>Обов\'язки</h4><ul><li>Контроль автоматичного обладнання</li><li>Складання автомобільних фар</li><li>Упаковка готової продукції</li><li>Перевірка якості за стандартами</li></ul><h4>Умови</h4><ul><li>Офіційний контракт</li><li>Медичне страхування</li><li>Організоване житло</li><li>Безкоштовний доїзд до роботи</li><li>Допомога на харчування</li></ul>',
      createdAt: '2024-08-01'
    },
    {
      id: 2, active: true, featured: true,
      title:        'Оператор виробництва фар',
      country:      'Словаччина',
      city:         'с. Кочовце',
      salary:       '950–1150€ нетто',
      requirements: 'Чоловіки, жінки та сімейні пари від 18 до 42 років',
      schedule:     'Двозмінний графік, 12 год / зміна',
      image:        'https://alexxqualitywork.com/pic/N8xe6XoXG0U_ywzDzPBsOus3.jpg',
      description:  '<p>Сучасний завод з виробництва автомобільних фар у Словаччині запрошує кандидатів без досвіду.</p><h4>Обов\'язки</h4><ul><li>Виробництво та складання фар</li><li>Контроль автоматичного устаткування</li><li>Упаковка готової продукції</li><li>Перевірка якості</li></ul><h4>Умови</h4><ul><li>Офіційний контракт</li><li>Медичне страхування</li><li>Гуртожиток або оренда</li><li>Транспорт до роботи</li></ul>',
      createdAt: '2024-08-15'
    },
    {
      id: 3, active: true, featured: true,
      title:        'Оператор ЧПУ',
      country:      'Словаччина',
      city:         'м. Sučany',
      salary:       '5.40 €/год',
      requirements: 'Жінки 18–50 років',
      schedule:     'Денна зміна, Пн–Пт',
      image:        'https://alexxqualitywork.com/pic/e9FERS-uXJ5NNNoJB9oD2_30.jpg',
      description:  '<p>Машинобудівне підприємство запрошує операторів ЧПУ-обладнання.</p><h4>Обов\'язки</h4><ul><li>Візуальний контроль виготовлення деталей</li><li>Перевірка якості згідно кресленням</li><li>Обслуговування ЧПУ-верстата</li></ul><h4>Умови</h4><ul><li>Офіційний контракт</li><li>Медичне страхування</li><li>Розміщення на підприємстві</li></ul>',
      createdAt: '2024-09-01'
    }
  ];

  var DEFAULT_NEWS = [
    {
      id: 1, active: true,
      title:   'Посилені поліцейські перевірки на кордонах ЄС. Наслідки для українців.',
      excerpt: 'Словаччина розмістила сотні поліцейських і військових на кордоні з Угорщиною через зростання міграції.',
      content: '<p>Словаччина розмістила сотні поліцейських і військових на кордоні з Угорщиною через зростання міграції. Це рішення не перше в державах ЄС.</p><p>Для українців, які мають офіційні документи та легальний статус перебування, посилені перевірки не є суттєвою перешкодою. Наша агенція оформлює всі необхідні документи заздалегідь, тому клієнти AQW проходять кордон без проблем.</p>',
      image:       'https://alexxqualitywork.com/pic/eRNq9eNKriClPclPBv_2UaY-.jpg',
      publishedAt: '2023-11-02'
    },
    {
      id: 2, active: true,
      title:   'Спільні кроки для покращення умов працевлаштування українців за кордоном.',
      excerpt: 'Зустріч громадськості та бізнесу для покращення інформування українців, які виїхали за кордон.',
      content: '<p>За участі провідних агентств з працевлаштування, громадських організацій та представників влади відбулась конференція щодо захисту прав українських трудових мігрантів.</p><p>Компанія Alexx Quality Work взяла активну участь у заході та представила власний досвід офіційного працевлаштування.</p>',
      image:       'https://alexxqualitywork.com/pic/3oBt_Nc2rOMGQ2mB9xsZhT3S.jpg',
      publishedAt: '2023-10-30'
    },
    {
      id: 3, active: true,
      title:   'Як не натрапити на шахраїв при пошуку роботи за кордоном?',
      excerpt: 'Alexx Quality Work були експертами на конференції Департаменту кіберполіції в Ужгороді.',
      content: '<p>Фахівці Alexx Quality Work взяли участь у конференції, організованій Департаментом кіберполіції Національної поліції України в місті Ужгород.</p><p>На заході обговорювались схеми шахрайства при пошуку роботи за кордоном та методи захисту громадян.</p><h4>Як перевірити агенцію?</h4><ul><li>Перевірте наявність ліцензії на діяльність</li><li>Не платіть гроші до підписання контракту</li><li>Вимагайте офіційний договір</li><li>Перевіряйте відгуки реальних клієнтів</li></ul>',
      image:       'https://alexxqualitywork.com/pic/5MifWJud0OrJnOiSbXcJNN8a.jpg',
      publishedAt: '2023-08-02'
    }
  ];

  /* ── localStorage helpers ───────────────────── */
  function load(key, defaults) {
    try {
      var raw = localStorage.getItem(key);
      return raw ? JSON.parse(raw) : defaults.map(function (d) { return Object.assign({}, d); });
    } catch (e) { return defaults.map(function (d) { return Object.assign({}, d); }); }
  }

  function save(key, data) {
    try { localStorage.setItem(key, JSON.stringify(data)); } catch (e) { /* quota */ }
  }

  function nextId(arr) {
    return arr.reduce(function (m, x) { return Math.max(m, x.id || 0); }, 0) + 1;
  }

  /* ── Public API ─────────────────────────────── */
  var AQW = {

    /* ─── JOBS ─── */
    getJobs: function () { return load(K.JOBS, DEFAULT_JOBS); },
    getJob:  function (id) {
      return this.getJobs().find(function (j) { return j.id === +id; }) || null;
    },
    saveJob: function (job) {
      var jobs = this.getJobs();
      if (job.id) {
        var idx = jobs.findIndex(function (j) { return j.id === job.id; });
        if (idx > -1) jobs[idx] = job; else jobs.unshift(job);
      } else {
        job.id = nextId(jobs);
        job.createdAt = new Date().toISOString().slice(0, 10);
        jobs.unshift(job);
      }
      save(K.JOBS, jobs);
      return job;
    },
    deleteJob: function (id) {
      save(K.JOBS, this.getJobs().filter(function (j) { return j.id !== +id; }));
    },

    /* ─── NEWS ─── */
    getNews:    function () { return load(K.NEWS, DEFAULT_NEWS); },
    getArticle: function (id) {
      return this.getNews().find(function (n) { return n.id === +id; }) || null;
    },
    saveArticle: function (article) {
      var news = this.getNews();
      if (article.id) {
        var idx = news.findIndex(function (n) { return n.id === article.id; });
        if (idx > -1) news[idx] = article; else news.unshift(article);
      } else {
        article.id = nextId(news);
        article.publishedAt = new Date().toISOString().slice(0, 10);
        news.unshift(article);
      }
      save(K.NEWS, news);
      return article;
    },
    deleteArticle: function (id) {
      save(K.NEWS, this.getNews().filter(function (n) { return n.id !== +id; }));
    },

    /* ─── SUBMISSIONS ─── */
    getSubmissions: function () { return load(K.SUBS, []); },
    addSubmission: function (sub) {
      var subs = this.getSubmissions();
      sub.id = nextId(subs);
      sub.submittedAt = new Date().toISOString();
      sub.read = false;
      subs.unshift(sub);
      save(K.SUBS, subs);
      return sub;
    },
    markRead: function (id) {
      var subs = this.getSubmissions().map(function (s) {
        return s.id === +id ? Object.assign({}, s, { read: true }) : s;
      });
      save(K.SUBS, subs);
    },
    deleteSubmission: function (id) {
      save(K.SUBS, this.getSubmissions().filter(function (s) { return s.id !== +id; }));
    },

    /* ─── UTILS ─── */
    formatDate: function (str) {
      if (!str) return '';
      try {
        return new Date(str).toLocaleDateString('uk-UA', { day: '2-digit', month: '2-digit', year: 'numeric' });
      } catch (e) { return str; }
    }
  };

  global.AQW = AQW;
}(window));
