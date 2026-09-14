import { readClientProfile } from '@trigonum/shared'
import type { EddTemplate } from './types'

const INDIVIDUAL_EDD_TEMPLATE: EddTemplate = {
  id: 'edd-individual',
  version: '1.1',
  questions: [
    {
      id: 'q1', order: 1, type: 'SINGLE_SELECT', isRequired: true,
      text: 'Основной источник средств для инвестирования',
      options: ['Работа по найму / зарплата', 'Доход от бизнеса / самозанятость', 'Инвестиции / торговая прибыль', 'Наследство / дар', 'Накопления', 'Продажа имущества или активов', 'Пенсия / пенсионные накопления', 'Другое'],
      metadata: { requiresTextOnOther: true },
    },
    { id: 'q2', order: 2, type: 'TEXT', isRequired: true, text: 'Опишите происхождение вашего капитала — как накоплено состояние' },
    {
      id: 'q3', order: 3, type: 'SINGLE_SELECT', isRequired: true, text: 'Ожидаемая сумма первой инвестиции, USD',
      options: ['До $10,000', '$10,000 – 50,000', '$50,000 – 100,000', '$100,000 – 500,000', '$500,000 – 1,000,000', 'Более $1,000,000'],
    },
    {
      id: 'q4', order: 4, type: 'SINGLE_SELECT', isRequired: true, text: 'Опыт работы с криптовалютой и цифровыми активами',
      options: ['Нет опыта', 'Начинающий — менее года', 'Средний — 1–3 года', 'Продвинутый — 3–5 лет', 'Эксперт — более 5 лет'],
    },
    {
      id: 'q5', order: 5, type: 'SINGLE_SELECT', isRequired: true, text: 'Толерантность к риску',
      options: ['Консервативная — сохранение капитала важнее доходности', 'Умеренная — готов к небольшим просадкам', 'Агрессивная — готов к заметным просадкам ради роста', 'Очень агрессивная — допускаю потерю значительной части вложений'],
    },
    { id: 'q6', order: 6, type: 'SINGLE_SELECT', isRequired: true, text: 'Горизонт инвестирования', options: ['Менее 6 месяцев', '6 месяцев – 1 год', '1–3 года', '3–5 лет', 'Более 5 лет'] },
    {
      id: 'q7', order: 7, type: 'SINGLE_SELECT', isRequired: false, text: 'Приблизительный годовой доход, USD',
      options: ['До $50,000', '$50,000 – 100,000', '$100,000 – 250,000', '$250,000 – 500,000', '$500,000 – 1,000,000', 'Более $1,000,000'],
    },
    {
      id: 'q8', order: 8, type: 'SINGLE_SELECT', isRequired: false, text: 'Net worth без учёта основного жилья',
      options: ['До $100,000', '$100,000 – 500,000', '$500,000 – 1,000,000', '$1,000,000 – 5,000,000', 'Более $5,000,000'],
    },
    { id: 'q9', order: 9, type: 'YES_NO', isRequired: true, text: 'Вы или ваши близкие родственники — публичное должностное лицо (PEP)?' },
    { id: 'q10', order: 10, type: 'SINGLE_SELECT', isRequired: true, text: 'Страна налогового резидентства', options: [] },
    {
      id: 'q11', order: 11, type: 'SINGLE_SELECT', isRequired: true, text: 'Основная цель инвестирования',
      options: ['Сохранение капитала', 'Рост капитала', 'Диверсификация', 'Активная торговля', 'Получение дохода', 'Другое'],
      metadata: { requiresTextOnOther: true },
    },
    { id: 'q12', order: 12, type: 'FILE_UPLOAD', isRequired: false, text: 'Дополнительный документ, подтверждающий источник средств' },
  ],
}

/**
 * Приложение №1.1 не задаёт форму EDD-анкеты. Эта ветка лишь устраняет
 * персональные вопросы, неприменимые к юридическому лицу; обязательное
 * корпоративное досье по-прежнему определяется отдельным перечнем документов.
 */
const COMPANY_EDD_TEMPLATE: EddTemplate = {
  id: 'edd-company',
  version: '1.0',
  questions: [
    {
      id: 'c1', order: 1, type: 'SINGLE_SELECT', isRequired: true,
      text: 'Основной источник денежных средств компании, планируемых к размещению',
      options: ['Выручка от основной деятельности', 'Взносы / финансирование участников', 'Инвестиционный доход', 'Продажа активов', 'Заёмное финансирование', 'Другое'],
      metadata: { requiresTextOnOther: true },
    },
    { id: 'c2', order: 2, type: 'TEXT', isRequired: true, text: 'Опишите основную деятельность компании и происхождение средств, планируемых к размещению' },
    {
      id: 'c3', order: 3, type: 'SINGLE_SELECT', isRequired: true, text: 'Ожидаемая сумма первого размещения, USD',
      options: ['До $10,000', '$10,000 – 50,000', '$50,000 – 100,000', '$100,000 – 500,000', '$500,000 – 1,000,000', 'Более $1,000,000'],
    },
    {
      id: 'c4', order: 4, type: 'SINGLE_SELECT', isRequired: true, text: 'Опыт компании или лиц, принимающих инвестиционные решения, с цифровыми активами',
      options: ['Нет опыта', 'Менее года', '1–3 года', '3–5 лет', 'Более 5 лет'],
    },
    {
      id: 'c5', order: 5, type: 'SINGLE_SELECT', isRequired: true, text: 'Допустимый для компании уровень инвестиционного риска',
      options: ['Низкий', 'Умеренный', 'Высокий', 'Очень высокий'],
    },
    { id: 'c6', order: 6, type: 'SINGLE_SELECT', isRequired: true, text: 'Планируемый горизонт размещения', options: ['Менее 6 месяцев', '6 месяцев – 1 год', '1–3 года', '3–5 лет', 'Более 5 лет'] },
    {
      id: 'c7', order: 7, type: 'SINGLE_SELECT', isRequired: false, text: 'Ориентировочная годовая выручка компании, USD',
      options: ['До $100,000', '$100,000 – 500,000', '$500,000 – 1,000,000', '$1,000,000 – 5,000,000', 'Более $5,000,000'],
    },
    { id: 'c8', order: 8, type: 'YES_NO', isRequired: true, text: 'Есть ли среди руководителей, уполномоченных подписантов или бенефициарных владельцев публичные должностные лица (PEP)?' },
    { id: 'c9', order: 9, type: 'YES_NO', isRequired: true, text: 'Связаны ли компания, руководители или бенефициарные владельцы с санкционными лицами или ограничениями?' },
    { id: 'c10', order: 10, type: 'SINGLE_SELECT', isRequired: true, text: 'Страна налогового учёта / регистрации компании', options: [] },
    {
      id: 'c11', order: 11, type: 'SINGLE_SELECT', isRequired: true, text: 'Основная цель размещения капитала компании',
      options: ['Управление ликвидностью', 'Сохранение капитала', 'Рост капитала', 'Диверсификация', 'Инвестиционная деятельность', 'Другое'],
      metadata: { requiresTextOnOther: true },
    },
    { id: 'c12', order: 12, type: 'FILE_UPLOAD', isRequired: false, text: 'Дополнительный документ по источнику средств или деятельности компании' },
  ],
}

export const EDD_TEMPLATE: EddTemplate =
  readClientProfile().clientType === 'company' ? COMPANY_EDD_TEMPLATE : INDIVIDUAL_EDD_TEMPLATE
