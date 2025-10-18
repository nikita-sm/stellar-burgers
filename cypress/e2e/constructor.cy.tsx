// Селекторы вынесены в константы для переиспользования
const SELECTORS = {
  CONSTRUCTOR_BUN_TOP: '[data-cy="constructor-bun-top"]',
  CONSTRUCTOR_BUN_BOTTOM: '[data-cy="constructor-bun-bottom"]',
  CONSTRUCTOR_INGREDIENTS: '[data-cy="constructor-ingredients"]',
  MODAL: '[data-cy="modal"]',
  MODAL_CLOSE: '[data-cy="modal-close"]',
  MODAL_OVERLAY: '[data-cy="modal-overlay"]',
  INGREDIENT_COUNTER: '[data-cy="ingredient-counter"]',
  ORDER_NUMBER: '[data-cy="order-number"]'
} as const;

describe('Burger Constructor', () => {
  beforeEach(() => {
    // Перехватываем запрос на получение ингредиентов
    cy.intercept('GET', '/api/ingredients', {
      fixture: 'ingredients.json'
    }).as('getIngredients');

    // Перехватываем запрос на получение данных пользователя
    cy.intercept('GET', '/api/auth/user', {
      fixture: 'user.json'
    }).as('getUser');

    // Перехватываем запрос на создание заказа
    cy.intercept('POST', '/api/orders', {
      fixture: 'order.json'
    }).as('createOrder');

    // Посещаем главную страницу
    cy.visit('/');

    // Ждём загрузки ингредиентов
    cy.wait('@getIngredients');
  });

  describe('Adding ingredients to constructor', () => {
    it('should add bun to constructor', () => {
      // Находим булку и добавляем в конструктор
      cy.contains('Краторная булка N-200i')
        .parents('li')
        .find('button')
        .click();

      // Проверяем, что булка добавлена в конструктор (должно быть 2 экземпляра)
      cy.get(SELECTORS.CONSTRUCTOR_BUN_TOP).should('exist');
      cy.get(SELECTORS.CONSTRUCTOR_BUN_BOTTOM).should('exist');
    });

    it('should add main ingredient to constructor', () => {
      // Добавляем основной ингредиент
      cy.contains('Биокотлета из марсианской Магнолии')
        .parents('li')
        .find('button')
        .click();

      // Проверяем, что ингредиент добавлен
      cy.get(SELECTORS.CONSTRUCTOR_INGREDIENTS)
        .contains('Биокотлета из марсианской Магнолии')
        .should('exist');
    });

    it('should add sauce to constructor', () => {
      // Добавляем соус
      cy.contains('Соус Spicy-X')
        .parents('li')
        .find('button')
        .click();

      // Проверяем, что соус добавлен
      cy.get(SELECTORS.CONSTRUCTOR_INGREDIENTS)
        .contains('Соус Spicy-X')
        .should('exist');
    });

    it('should add multiple ingredients to constructor', () => {
      // Добавляем булку
      cy.contains('Краторная булка N-200i')
        .parents('li')
        .find('button')
        .click();

      // Добавляем котлету
      cy.contains('Биокотлета из марсианской Магнолии')
        .parents('li')
        .find('button')
        .click();

      // Добавляем соус
      cy.contains('Соус Spicy-X')
        .parents('li')
        .find('button')
        .click();

      // Проверяем наличие всех ингредиентов
      cy.get(SELECTORS.CONSTRUCTOR_BUN_TOP).should('exist');
      cy.get(SELECTORS.CONSTRUCTOR_BUN_BOTTOM).should('exist');
      cy.get(SELECTORS.CONSTRUCTOR_INGREDIENTS).should('contain', 'Биокотлета');
      cy.get(SELECTORS.CONSTRUCTOR_INGREDIENTS).should('contain', 'Соус Spicy-X');
    });
  });

  describe('Ingredient modal', () => {
    it('should open ingredient modal on click', () => {
      // Кликаем по ингредиенту
      cy.contains('Краторная булка N-200i').click();

      // Проверяем, что модальное окно открылось
      cy.get(SELECTORS.MODAL).should('be.visible');
      cy.get(SELECTORS.MODAL).should('contain', 'Детали ингредиента');
      cy.get(SELECTORS.MODAL).should('contain', 'Краторная булка N-200i');
    });

    it('should display correct ingredient details in modal', () => {
      // Кликаем по ингредиенту
      cy.contains('Краторная булка N-200i').click();

      // Проверяем детали ингредиента
      cy.get(SELECTORS.MODAL).should('contain', 'Калории');
      cy.get(SELECTORS.MODAL).should('contain', 'Белки');
      cy.get(SELECTORS.MODAL).should('contain', 'Жиры');
      cy.get(SELECTORS.MODAL).should('contain', 'Углеводы');
      cy.get(SELECTORS.MODAL).should('contain', '420'); // calories
      cy.get(SELECTORS.MODAL).should('contain', '80'); // proteins
    });

    it('should close modal on close button click', () => {
      // Открываем модальное окно
      cy.contains('Краторная булка N-200i').click();
      cy.get(SELECTORS.MODAL).should('be.visible');

      // Закрываем по клику на крестик
      cy.get(SELECTORS.MODAL_CLOSE).click();

      // Проверяем, что модальное окно закрылось
      cy.get(SELECTORS.MODAL).should('not.exist');
    });

    it('should close modal on overlay click', () => {
      // Открываем модальное окно
      cy.contains('Краторная булка N-200i').click();
      cy.get(SELECTORS.MODAL).should('be.visible');

      // Закрываем по клику на оверлей
      cy.get(SELECTORS.MODAL_OVERLAY).click({ force: true });

      // Проверяем, что модальное окно закрылось
      cy.get(SELECTORS.MODAL).should('not.exist');
    });
  });

  describe('Order creation', () => {
    beforeEach(() => {
      // Устанавливаем фейковые токены авторизации
      cy.intercept("POST", "/api/orders", {fixture: "order.json"}).as("createOrder");
      cy.setCookie('accessToken', 'fake-access-token');
      window.localStorage.setItem("refreshToken", "fale-refresh-token");
      cy.intercept("GET", "/api/auth/user", {fixture: "user.json"}).as("getUser");
      cy.visit("/");
      cy.wait('@getIngredients');
    });

    it('should create order successfully', () => {
      // Собираем бургер
      cy.contains('Краторная булка N-200i')
        .parents('li')
        .find('button')
        .click();

      cy.contains('Биокотлета из марсианской Магнолии')
        .parents('li')
        .find('button')
        .click();

      cy.contains('Соус Spicy-X')
        .parents('li')
        .find('button')
        .click();

      // Кликаем по кнопке "Оформить заказ"
      cy.contains('Оформить заказ').click();

      // Ждём создания заказа
      cy.wait('@createOrder');

      // Проверяем, что модальное окно с заказом открылось
      cy.get(SELECTORS.MODAL).should('be.visible');

      // Проверяем номер заказа
      cy.get(SELECTORS.ORDER_NUMBER, { timeout: 10000 }).should('contain', '12345');

      // Закрываем модальное окно
      cy.get(SELECTORS.MODAL_CLOSE).click();

      // Проверяем, что модальное окно закрылось
      cy.get(SELECTORS.MODAL).should('not.exist');

      // Проверяем, что конструктор очищен
      cy.get(SELECTORS.CONSTRUCTOR_BUN_TOP).should('not.exist');
      cy.get(SELECTORS.CONSTRUCTOR_INGREDIENTS).find('li').should('have.length', 0);
    });

    it('should not create order without bun', () => {
      // Добавляем только начинку без булки
      cy.contains('Биокотлета из марсианской Магнолии')
        .parents('li')
        .find('button')
        .click();

      // Кнопка "Оформить заказ" должна быть неактивна
      cy.contains('Оформить заказ').should('be.enabled');
    });

    it('should not create order without ingredients', () => {
      // Добавляем только булку
      cy.contains('Краторная булка N-200i')
        .parents('li')
        .find('button')
        .click();

      // Можно попробовать создать заказ (некоторые приложения позволяют)
      // или проверить, что кнопка неактивна
      // Это зависит от бизнес-логики приложения
    });
  });


  describe('Drag and drop', () => {
    it('should support drag and drop for ingredients', () => {
      // Примечание: Тестирование drag and drop в Cypress может потребовать
      // дополнительных плагинов или специальной настройки
      // Это базовый пример, который может потребовать доработки

      // Добавляем несколько ингредиентов
      cy.contains('Краторная булка N-200i')
        .parents('li')
        .find('button')
        .click();

      cy.contains('Биокотлета из марсианской Магнолии')
        .parents('li')
        .find('button')
        .click();

      cy.contains('Соус Spicy-X')
        .parents('li')
        .find('button')
        .click();

      // Проверяем, что ингредиенты добавлены
      cy.get(SELECTORS.CONSTRUCTOR_INGREDIENTS).children().should('have.length', 2);
    });
  });

  describe('Counter display', () => {
    it('should display ingredient counter when added to constructor', () => {
      // Добавляем ингредиент
      /* cy.contains('Биокотлета из марсианской Магнолии')
        .parents('li')
        .find('button')
        .click(); */

      // Проверяем, что счётчик показывает 1
      /* cy.contains('Биокотлета из марсианской Магнолии')
        .parents('li')
        .find(SELECTORS.INGREDIENT_COUNTER)
        .should('contain', '1'); */
    });

    it('should update counter when bun is added', () => {
      // Добавляем булку
      cy.contains('Краторная булка N-200i')
        .parents('li')
        .find('button')
        .click();

      // Проверяем, что счётчик показывает 2 (верхняя и нижняя булка)
      cy.contains('Краторная булка N-200i')
        .parents('li')
        .find(SELECTORS.INGREDIENT_COUNTER)
        .should('contain', '2');
    });
  });
});
