import { useId } from 'react';
import { Link } from 'react-router-dom';
import { BarChart3, MessageSquare, Calendar, Mail, TrendingUp, PieChart, FileText, Sparkles, ArrowRight, Check } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import Logo from '../components/Logo';

function HeroCanvasPreview({ theme }) {
  const connectorGradientId = useId();

  const frameClasses = theme === 'dark'
    ? 'bg-gray-900/70 border-white/10'
    : 'bg-white/80 border-gray-200/70';

  const cardClasses = theme === 'dark'
    ? 'bg-gray-950/80 border-white/10 text-white/90'
    : 'bg-white/95 border-gray-100 text-gray-900';

  const subTextClass = theme === 'dark' ? 'text-gray-400' : 'text-gray-500';

  const connectorPortClass = theme === 'dark'
    ? 'bg-blue-400/80 border-white/20'
    : 'bg-blue-500/80 border-white/70';

  const connectors = [
    { id: 'c1', d: 'M 190 150 Q 360 70 560 200', delay: '0s' },
    { id: 'c2', d: 'M 210 360 Q 360 320 560 260', delay: '0.45s' },
    { id: 'c3', d: 'M 760 320 Q 640 260 580 235', delay: '0.9s' }
  ];

  const nodes = [
    { id: 'n1', top: '32%', left: '47%', delay: '0s' },
    { id: 'n2', top: '44%', left: '56%', delay: '0.25s' },
    { id: 'n3', top: '57%', left: '60%', delay: '0.5s' }
  ];

  return (
    <div className="absolute inset-0 flex items-center justify-center pointer-events-none" aria-hidden="true">
      <div className={`hero-canvas-preview relative w-[min(980px,92vw)] h-[520px] rounded-[48px] border backdrop-blur-[28px] overflow-hidden ${frameClasses}`}>
        <div className="hero-canvas-dots absolute inset-0" />
        <div className="absolute inset-0 opacity-70 bg-gradient-to-br from-white/50 via-transparent to-transparent dark:from-white/10 mix-blend-overlay" />
        <div
          className="absolute inset-0 blur-[100px] opacity-70"
          style={{
            background: 'radial-gradient(circle at 25% 30%, rgba(59,130,246,0.38), transparent 55%), radial-gradient(circle at 75% 70%, rgba(236,72,153,0.32), transparent 45%)'
          }}
        />
        <svg
          className="absolute inset-0 w-full h-full pointer-events-none"
          viewBox="0 0 960 520"
          preserveAspectRatio="none"
          aria-hidden="true"
        >
          <defs>
            <linearGradient id={connectorGradientId} x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#60a5fa" stopOpacity="0.9" />
              <stop offset="100%" stopColor="#34d399" stopOpacity="0.9" />
            </linearGradient>
          </defs>
          {connectors.map((connector) => (
            <path
              key={connector.id}
              d={connector.d}
              stroke={`url(#${connectorGradientId})`}
              fill="none"
              className="hero-connector-line"
              style={{ animationDelay: connector.delay }}
            />
          ))}
        </svg>
        <div className="relative w-full h-full">
          <div
            className={`absolute hero-widget-float rounded-3xl border px-5 py-4 shadow-xl ${cardClasses}`}
            style={{ top: '11%', left: '8%', width: '230px', animationDelay: '0s' }}
          >
            <p className={`text-xs font-semibold tracking-wide uppercase ${subTextClass}`}>MRR</p>
            <p className="text-2xl font-bold mt-2">₽ 2,3 млн</p>
            <p className="text-xs font-semibold text-emerald-400 mt-1">+18% WoW</p>
            <div className="mt-4 h-1.5 rounded-full bg-white/10 dark:bg-white/5 overflow-hidden">
              <div className="h-full w-3/4 rounded-full bg-gradient-to-r from-blue-500 to-cyan-400" />
            </div>
            <span
              className={`absolute -right-3 top-1/2 w-3 h-3 rounded-full border ${connectorPortClass} hero-node-pulse`}
              style={{ animationDelay: '0.15s' }}
            />
          </div>

          <div
            className={`absolute hero-widget-float rounded-3xl border px-5 py-4 shadow-xl ${cardClasses}`}
            style={{ top: '58%', left: '10%', width: '250px', animationDelay: '0.3s' }}
          >
            <p className={`text-xs font-semibold tracking-wide uppercase ${subTextClass}`}>Календарь</p>
            <div className="grid grid-cols-4 gap-1 mt-3">
              {[...Array(8)].map((_, index) => (
                <span
                  key={index}
                  className={`h-6 rounded-lg ${index === 2 || index === 6 ? 'bg-gradient-to-br from-emerald-400 to-green-500' : theme === 'dark' ? 'bg-white/5' : 'bg-gray-100/80'}`}
                />
              ))}
            </div>
            <div className={`mt-4 text-xs font-semibold ${subTextClass}`}>
              Следующая встреча через 25 минут
            </div>
            <span
              className={`absolute -right-3 top-1/3 w-3 h-3 rounded-full border ${connectorPortClass} hero-node-pulse`}
              style={{ animationDelay: '0.45s' }}
            />
          </div>

          <div
            className={`absolute hero-widget-float rounded-[32px] border px-6 py-5 shadow-xl ${cardClasses}`}
            style={{ top: '20%', left: '44%', width: '280px', animationDelay: '0.6s' }}
          >
            <div className="flex items-center gap-2 text-sm font-semibold">
              <Sparkles className="w-4 h-4 text-blue-400" />
              ИИ-копилот
            </div>
            <p className={`mt-2 text-sm leading-relaxed ${subTextClass}`}>
              «Нашёл 3 инсайта по продажам и подготовил сводку для команды маркетинга.»
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              {['CRM', 'Финансы', 'Маркетинг'].map((label) => (
                <span
                  key={label}
                  className="px-3 py-1 rounded-full text-xs font-semibold bg-gradient-to-r from-blue-500/10 to-purple-500/10 text-blue-500 dark:text-blue-300"
                >
                  {label}
                </span>
              ))}
            </div>
            <span
              className={`absolute -left-3 top-1/3 w-3 h-3 rounded-full border ${connectorPortClass} hero-node-pulse`}
              style={{ animationDelay: '0.75s' }}
            />
            <span
              className={`absolute -left-3 bottom-1/3 w-3 h-3 rounded-full border ${connectorPortClass} hero-node-pulse`}
              style={{ animationDelay: '0.9s' }}
            />
            <span
              className={`absolute -right-3 top-1/2 w-3 h-3 rounded-full border ${connectorPortClass} hero-node-pulse`}
              style={{ animationDelay: '1.05s' }}
            />
          </div>

          <div
            className={`absolute hero-widget-float rounded-3xl border px-5 py-4 shadow-xl ${cardClasses}`}
            style={{ top: '55%', left: '65%', width: '240px', animationDelay: '0.9s' }}
          >
            <p className={`text-xs font-semibold tracking-wide uppercase ${subTextClass}`}>Маржинальность</p>
            <div className="mt-3 flex items-end gap-1 h-24">
              {[50, 65, 38, 80, 60, 72].map((height, index) => (
                <span
                  key={height}
                  className={`flex-1 rounded-t-xl ${index % 2 === 0 ? 'bg-gradient-to-t from-blue-600 to-purple-500' : 'bg-gradient-to-t from-cyan-400 to-emerald-400'}`}
                  style={{ height: `${height}%` }}
                />
              ))}
            </div>
            <div className="mt-3 flex items-center justify-between text-xs font-semibold">
              <span className={subTextClass}>AVG</span>
              <span className="text-emerald-400">+12%</span>
            </div>
            <span
              className={`absolute -left-3 top-1/2 w-3 h-3 rounded-full border ${connectorPortClass} hero-node-pulse`}
              style={{ animationDelay: '1.05s' }}
            />
          </div>

          {nodes.map((node) => (
            <span
              key={node.id}
              className={`absolute block w-3 h-3 rounded-full ${connectorPortClass} hero-node-pulse`}
              style={{ top: node.top, left: node.left, animationDelay: node.delay }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

export default function LandingPage() {
  const { theme, toggleTheme } = useTheme();

  const features = [
    {
      icon: <MessageSquare className="w-6 h-6" />,
      title: "Радар социальных сетей",
      description: "Отслеживайте настроения клиентов в VK, Instagram, Telegram и WhatsApp. ИИ-анализ выявляет тренды и ключевые темы — понимайте аудиторию лучше конкурентов за 5 минут в день.",
      highlight: "Экономия 3+ часов ежедневно на мониторинге"
    },
    {
      icon: <Mail className="w-6 h-6" />,
      title: "Автопилот входящих писем",
      description: "Умный фильтр отсекает спам и промо, оставляя только важное. ИИ-сводки за секунды: кто требует срочного ответа, какие счета на оплату, что можно отложить.",
      highlight: "От 200+ писем к 10 критически важным"
    },
    {
      icon: <Calendar className="w-6 h-6" />,
      title: "Командный диспетчер встреч",
      description: "Единый календарь синхронизирует Google, Битрикс24, AmoCRM и Яндекс Трекер. Видеоссылки, описания, напоминания — всё в одном месте. Никогда не пропустите важную встречу с клиентом.",
      highlight: "Все встречи команды на одном экране"
    },
    {
      icon: <TrendingUp className="w-6 h-6" />,
      title: "Финансовый высотомер",
      description: "Доходы, расходы, чистая прибыль в реальном времени. Детальная разбивка по клиентам и категориям. Видите тренды раньше бухгалтера — принимайте решения на опережение.",
      highlight: "Контроль прибыльности в один клик"
    },
    {
      icon: <PieChart className="w-6 h-6" />,
      title: "Визуальная аналитика",
      description: "Превращайте сухие цифры в понятные графики. Стройте кастомные дашборды под ваши KPI — от конверсий до маржинальности. Все данные визуализированы так, как нужно именно вам.",
      highlight: "Любые метрики — любая визуализация"
    },
    {
      icon: <Sparkles className="w-6 h-6" />,
      title: "ИИ бизнес-копилот",
      description: "ChatGPT встроен прямо в систему. Загружайте отчёты, задавайте вопросы, получайте рекомендации. От анализа конкурентов до прогноза продаж — ваш личный стратег 24/7.",
      highlight: "Решения на основе ИИ за минуты, не дни"
    },
    {
      icon: <FileText className="w-6 h-6" />,
      title: "Информационная лента новостей",
      description: "Агрегация профильных новостей из BBC, Reuters, TechCrunch и других источников. ИИ выделяет главное по вашей отрасли — будьте в курсе трендов рынка раньше других.",
      highlight: "Ваша индустрия в одной ленте"
    },
    {
      icon: <FileText className="w-6 h-6" />,
      title: "Быстрые заметки и база знаний",
      description: "Фиксируйте идеи, прикрепляйте файлы, форматируйте текст. Всё важное всегда под рукой — от заметок со встреч до контрактов и инструкций для команды.",
      highlight: "Вся информация в одном месте"
    }
  ];

  return (
    <div className={`min-h-screen transition-smooth ${
      theme === 'dark' ? 'bg-black text-white' : 'bg-white text-black'
    }`}>
      {/* Navigation */}
      <nav className={`border-b transition-smooth ${
        theme === 'dark' ? 'border-gray-800/50 bg-black/80 backdrop-blur-md' : 'border-gray-200 bg-white/80 backdrop-blur-md'
      }`}>
        <div className="w-full px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Logo showText={true} />
            <div className="flex items-center gap-3">
              <button
                onClick={toggleTheme}
                className={`p-2 rounded-lg transition-smooth hover:scale-110 ${
                  theme === 'dark'
                    ? 'bg-gray-900/50 hover:bg-gray-800'
                    : 'bg-gray-100 hover:bg-gray-200'
                }`}
                aria-label="Toggle theme"
              >
                {theme === 'dark' ? '☀️' : '🌙'}
              </button>
              <Link
                to="/login"
                className={`px-6 py-3 rounded-lg transition-smooth hover:scale-105 ${
                  theme === 'dark'
                    ? 'hover:bg-gray-900'
                    : 'hover:bg-gray-100'
                }`}
              >
                Вход
              </Link>
              <Link
                to="/register"
                className="px-6 py-3 btn-gradient text-white rounded-lg transition-smooth btn-hover-lift font-medium"
              >
                Начать
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section with Interactive Canvas Background */}
      <section className={`w-full px-4 sm:px-6 lg:px-8 py-20 md:py-32 text-center relative overflow-hidden min-h-[90vh] flex items-center justify-center`}>
        {/* Interactive Canvas Workspace Background - Full Visual Preview */}
        <div className="absolute inset-0 -z-10">
          {/* Canvas Grid Pattern */}
          <div className={`absolute inset-0 canvas-dots ${
            theme === 'dark' ? 'opacity-60' : 'opacity-50'
          }`}></div>
          
          {/* Simulated Widgets/Cards on Canvas - showing what the product looks like */}
          <div className="absolute inset-0 p-8 md:p-16 overflow-hidden">
            <HeroCanvasPreview theme={theme} />

            {/* Animated gradient blobs for depth */}
            <div className="absolute top-10 left-10 w-32 h-32 bg-blue-500 rounded-full blur-3xl opacity-30 animate-pulse"></div>
            <div className="absolute bottom-10 right-10 w-32 h-32 bg-purple-500 rounded-full blur-3xl opacity-30 animate-pulse animation-delay-2000"></div>
            <div className="absolute top-1/3 right-1/4 w-24 h-24 bg-pink-500 rounded-full blur-2xl opacity-30 animate-pulse animation-delay-1000"></div>
          </div>

          {/* Gradient overlay for better text readability */}
          <div className={`absolute inset-0 ${
            theme === 'dark' 
              ? 'bg-gradient-to-b from-black/20 via-black/40 to-black/60' 
              : 'bg-gradient-to-b from-white/20 via-white/40 to-white/60'
          }`}></div>
        </div>
        
        {/* Content with backdrop blur */}
        <div className="relative z-10 max-w-5xl mx-auto">
          <h1 className="text-5xl sm:text-6xl md:text-7xl font-bold mb-6 leading-tight">
            Приборная панель
            <br />
            <span className="bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 bg-clip-text text-transparent">
              для взлёта вашего бизнеса
            </span>
          </h1>
          <p className={`text-lg md:text-xl mb-8 max-w-2xl mx-auto leading-relaxed ${
            theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
          }`}>
            Как у пилота есть приборная панель в кокпите, так и у вас — визуальный командный центр бизнеса. 
            Настройте виджеты под себя, подключите все инструменты, получайте ИИ-аналитику мгновенно. 
            <strong className="font-semibold"> Вам не нужен второй пилот — у вас есть копилот на базе ИИ.</strong>
          </p>
          
          {/* Interactive Canvas Preview Badge */}
          <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full mb-8 shadow-lg ${
            theme === 'dark' 
              ? 'bg-gray-900/80 border border-gray-700/50 backdrop-blur-md' 
              : 'bg-white/80 border border-gray-300/50 backdrop-blur-md'
          }`}>
            <BarChart3 className="w-4 h-4 text-blue-500" />
            <span className={`text-sm font-medium ${
              theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
            }`}>
              🎛️ Визуальная приборная панель
            </span>
          </div>
          
          <div className="flex gap-4 md:gap-6 justify-center flex-wrap">
            <Link
              to="/register"
              className="inline-flex items-center gap-2 px-6 md:px-8 py-3 btn-gradient text-white rounded-lg font-semibold transition-smooth btn-hover-lift shadow-xl"
            >
              Начать бесплатно
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              to="/canvas"
              className={`inline-flex items-center gap-2 px-6 md:px-8 py-3 border-2 rounded-lg font-semibold transition-smooth btn-hover-lift shadow-lg ${
                theme === 'dark'
                  ? 'border-white/30 hover:bg-white/10 backdrop-blur-md bg-white/5'
                  : 'border-gray-400 hover:bg-gray-100 backdrop-blur-md bg-white/80'
              }`}
            >
              Попробовать демо
              <Sparkles className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="w-full px-4 sm:px-6 lg:px-8 py-32">
        <h2 className="text-4xl font-bold text-center mb-4">
          🛫 Приборы для управления полётом
        </h2>
        <p className={`text-center mb-24 text-lg ${
          theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
        }`}>
          Каждый виджет — это прибор на вашей панели. Настройте их так, как удобно вам. Максимальная кастомизация, интуитивный интерфейс.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {features.map((feature, index) => (
            <div
              key={index}
              className={`group p-6 rounded-2xl border transition-smooth hover:scale-105 cursor-default shadow-soft hover:shadow-md-modern ${
                theme === 'dark'
                  ? 'bg-gray-800/50 border-gray-700/50 hover:bg-gray-800'
                  : 'bg-gray-50/50 border-gray-200 hover:bg-white'
              }`}
            >
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 transition-smooth group-hover:scale-110 ${
                theme === 'dark'
                  ? 'bg-gradient-to-br from-blue-500/20 to-purple-500/20'
                  : 'bg-gradient-to-br from-blue-100 to-purple-100'
              }`}>
                <div className="text-blue-500">{feature.icon}</div>
              </div>
              <h3 className="text-lg font-semibold mb-2 text-left">{feature.title}</h3>
              <p className={`text-left text-sm leading-relaxed mb-3 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                {feature.description}
              </p>
              {feature.highlight && (
                <div className={`px-3 py-2 rounded-lg text-xs font-semibold ${
                  theme === 'dark' 
                    ? 'bg-blue-500/10 text-blue-300 border border-blue-500/20' 
                    : 'bg-blue-50 text-blue-700 border border-blue-200'
                }`}>
                  ✈️ {feature.highlight}
                </div>
              )}
            </div>
          ))}
        </div>
      </section>


      {/* Benefits Section */}
      <section className={`w-full px-4 sm:px-6 lg:px-8 py-32 rounded-3xl ${
        theme === 'dark'
          ? 'bg-gradient-to-r from-gray-800/50 to-gray-900/50'
          : 'bg-gradient-to-r from-blue-50 to-purple-50'
      }`}>
        <h2 className="text-4xl font-bold text-center mb-4">🚁 Готовы к взлёту?</h2>
        <p className={`text-center mb-16 text-lg ${
          theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
        }`}>
          Присоединяйтесь к компаниям, которые уже управляют бизнесом на автопилоте
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {[
            { title: "Визуальная панель как кокпит", description: "Все инструменты перед глазами. Перетаскивайте виджеты, соединяйте их стрелками — настройте под свой workflow за минуты." },
            { title: "ИИ-копилот 24/7", description: "ChatGPT встроен в систему. Загружайте отчёты, задавайте вопросы — получайте стратегические решения мгновенно." },
            { title: "Единая диспетчерская связь", description: "Gmail, Yandex, Outlook, Битрикс24, AmoCRM, соцсети — всё в одном месте. Никаких переключений между вкладками." },
            { title: "Настройка без технарей", description: "Интуитивный интерфейс. Drag-and-drop виджеты, выбирайте цвета, источники данных — никакого кода." },
            { title: "Работает везде", description: "Компьютер, планшет, телефон — ваша приборная панель всегда с вами, где бы вы ни были." },
            { title: "Данные под замком", description: "Никто, кроме вас, не видит ваши цифры. Шифрование, приватность, безопасность — как у авиакомпаний." }
          ].map((benefit, index) => (
            <div key={index} className="flex gap-3 items-start">
              <Check className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
              <div className="text-left">
                <h3 className="font-semibold mb-1 text-base">{benefit.title}</h3>
                <p className={`text-sm leading-relaxed ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                  {benefit.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="w-full px-4 sm:px-6 lg:px-8 py-24 text-center">
        <h2 className="text-5xl font-bold mb-6">✈️ Запускайте двигатели!</h2>
        <p className={`text-xl mb-16 max-w-2xl mx-auto ${
          theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
        }`}>
          Не летайте вслепую. Получите приборную панель, которая показывает всё: от финансов до настроений клиентов. 
          <strong className="font-semibold"> С ИИ-копилотом на борту ваш бизнес взлетит.</strong>
        </p>
        <div className="flex gap-6 justify-center flex-wrap">
          <Link
            to="/register"
            className="inline-flex items-center gap-2 px-8 py-4 btn-gradient text-white rounded-lg text-lg font-semibold transition-smooth btn-hover-lift"
          >
            Начать бесплатно
            <ArrowRight className="w-5 h-5" />
          </Link>
          <Link
            to="/canvas"
            className={`inline-flex items-center gap-2 px-8 py-4 border-2 rounded-lg text-lg font-semibold transition-smooth btn-hover-lift ${
              theme === 'dark'
                ? 'border-white/30 hover:bg-white/5'
                : 'border-gray-300 hover:bg-gray-50'
            }`}
          >
            Исследовать демо
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className={`border-t transition-smooth ${
        theme === 'dark'
          ? 'border-gray-800/50 bg-gray-900/30'
          : 'border-gray-200 bg-gray-50/50'
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
            <div>
              <h4 className="font-semibold mb-4">Борменталь</h4>
              <p className={theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}>
                Бизнес-аналитика на основе ИИ
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Продукт</h4>
              <ul className={`space-y-2 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                <li><Link to="/" className="hover:text-blue-500 transition-colors">Возможности</Link></li>
                <li><Link to="/" className="hover:text-blue-500 transition-colors">Цены</Link></li>
                <li><Link to="/canvas" className="hover:text-blue-500 transition-colors">Демо</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Компания</h4>
              <ul className={`space-y-2 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                <li><Link to="/" className="hover:text-blue-500 transition-colors">О нас</Link></li>
                <li><Link to="/" className="hover:text-blue-500 transition-colors">Блог</Link></li>
                <li><Link to="/" className="hover:text-blue-500 transition-colors">Контакты</Link></li>
              </ul>
            </div>
          </div>
          <div className={`text-center pt-8 border-t ${
            theme === 'dark' ? 'border-gray-800/50 text-gray-500' : 'border-gray-200 text-gray-600'
          }`}>
            <p>© 2024 Борменталь. Все права защищены.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
