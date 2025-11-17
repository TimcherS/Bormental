import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

// the translations
// (tip: move them in a JSON file and import them,
// or even better, manage them separated from your code: https://react.i18next.com/guides/multiple-translation-files)
const resources = {
  ru: {
    translation: {
      // Common UI elements
      "Cancel": "Отмена",
      "Save": "Сохранить",
      "Delete": "Удалить",
      "Edit": "Редактировать",
      "Add": "Добавить",
      "Remove": "Удалить",
      "Close": "Закрыть",
      "Open": "Открыть",
      "Settings": "Настройки",
      "Configure": "Настроить",
      "Loading": "Загрузка",
      "Error": "Ошибка",
      "Success": "Успех",
      "Info": "Информация",

      // Widget types
      "Social Media": "Соцсети",
      "Email": "Анализ почты",
      "Calendar": "Календарь",
      "Revenue": "Отслеживание доходов",
      "Chart": "График",
      "Marketing": "Маркетинговая аналитика",
      "ChatGPT": "ИИ-помощник",
      "Note": "Заметка",
      "News": "Анализ новостей",

      // Dashboard elements
      "Main Dashboard": "Главная панель",
      "Welcome to Business Copilot": "Добро пожаловать в Business Copilot",
      "This is a demo dashboard with sample widgets": "Это демо-панель с примерными виджетами",

      // Navigation
      "Home": "Главная",
      "Canvas": "Холст",
      "Account": "Аккаунт",
      "Login": "Вход",
      "Register": "Регистрация",
      "Logout": "Выход",

      // Form labels
      "Email": "Email адрес",
      "Password": "Пароль",
      "Name": "Имя",
      "Title": "Название",

      // Messages
      "Please wait": "Пожалуйста, подождите",
      "Something went wrong": "Что-то пошло не так",
      "Operation completed successfully": "Операция выполнена успешно"
    }
  }
};

i18n
  // pass the i18n instance to react-i18next.
  .use(initReactI18next)
  // init i18next
  // for all options read: https://www.i18next.com/overview/configuration-options
  .init({
    resources,
    lng: 'ru', // language to use, more info here: https://www.i18next.com/overview/configuration-options#languages-namespaces-resources
    // you can use the i18n.changeLanguage function to change the language manually: https://www.i18next.com/overview/api#changelanguage
    // if you're using a language detector, do not define the lng option

    interpolation: {
      escapeValue: false // react already does escaping
    }
  });

export default i18n;
