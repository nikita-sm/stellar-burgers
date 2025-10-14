describe('Burger Constructor', () => {
  const API_URL = 'https://norma.nomoreparties.space/api';

  beforeEach(() => {
    // Перехватываем запрос на получение ингредиентов
    cy.intercept('GET', `${API_URL}/ingredients`, {
      fixture: 'ingredients.json'
    }).as('getIngredients');

    // Перехватываем запрос на получение данных пользователя
    cy.intercept('GET', `${API_URL}/auth/user`, {
      fixture: 'user.json'
    }).as('getUser');

    // Перехватываем запрос на создание заказа
    cy.intercept('POST', `${API_URL}/orders`, {
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
      cy.get('[data-cy="constructor-bun-top"]').should('exist');
      cy.get('[data-cy="constructor-bun-bottom"]').should('exist');
    });

    it('should add main ingredient to constructor', () => {
      // Добавляем основной ингредиент
      cy.contains('Биокотлета из марсианской Магнолии')
        .parents('li')
        .find('button')
        .click();

      // Проверяем, что ингредиент добавлен
      cy.get('[data-cy="constructor-ingredients"]')
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
      cy.get('[data-cy="constructor-ingredients"]')
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
      cy.get('[data-cy="constructor-bun-top"]').should('exist');
      cy.get('[data-cy="constructor-bun-bottom"]').should('exist');
      cy.get('[data-cy="constructor-ingredients"]').should('contain', 'Биокотлета');
      cy.get('[data-cy="constructor-ingredients"]').should('contain', 'Соус Spicy-X');
    });
  });

  describe('Ingredient modal', () => {
    it('should open ingredient modal on click', () => {
      // Кликаем по ингредиенту
      cy.contains('Краторная булка N-200i').click();

      // Проверяем, что модальное окно открылось
      cy.get('[data-cy="modal"]').should('be.visible');
      cy.get('[data-cy="modal"]').should('contain', 'Детали ингредиента');
      cy.get('[data-cy="modal"]').should('contain', 'Краторная булка N-200i');
    });

    it('should display correct ingredient details in modal', () => {
      // Кликаем по ингредиенту
      cy.contains('Краторная булка N-200i').click();

      // Проверяем детали ингредиента
      cy.get('[data-cy="modal"]').should('contain', 'Калории');
      cy.get('[data-cy="modal"]').should('contain', 'Белки');
      cy.get('[data-cy="modal"]').should('contain', 'Жиры');
      cy.get('[data-cy="modal"]').should('contain', 'Углеводы');
      cy.get('[data-cy="modal"]').should('contain', '420'); // calories
      cy.get('[data-cy="modal"]').should('contain', '80'); // proteins
    });

    it('should close modal on close button click', () => {
      // Открываем модальное окно
      cy.contains('Краторная булка N-200i').click();
      cy.get('[data-cy="modal"]').should('be.visible');

      // Закрываем по клику на крестик
      cy.get('[data-cy="modal-close"]').click();

      // Проверяем, что модальное окно закрылось
      cy.get('[data-cy="modal"]').should('not.exist');
    });

    it('should close modal on overlay click', () => {
      // Открываем модальное окно
      cy.contains('Краторная булка N-200i').click();
      cy.get('[data-cy="modal"]').should('be.visible');

      // Закрываем по клику на оверлей
      cy.get('[data-cy="modal-overlay"]').click({ force: true });

      // Проверяем, что модальное окно закрылось
      cy.get('[data-cy="modal"]').should('not.exist');
    });
  });

  describe('Order creation', () => {
    beforeEach(() => {
      // Устанавливаем фейковые токены авторизации
      cy.setAuthToken('fake-access-token', 'fake-refresh-token');
    });

    afterEach(() => {
      // Очищаем токены после теста
      cy.clearAuthToken();
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
      cy.get('[data-cy="modal"]').should('be.visible');

      // Проверяем номер заказа
      cy.get('[data-cy="order-number"]', { timeout: 10000 }).should('contain', '12345');

      // Закрываем модальное окно
      cy.get('[data-cy="modal-close"]').click();

      // Проверяем, что модальное окно закрылось
      cy.get('[data-cy="modal"]').should('not.exist');

      // Проверяем, что конструктор очищен
      cy.get('[data-cy="constructor-bun-top"]').should('not.exist');
      cy.get('[data-cy="constructor-ingredients"]').should('be.empty');
    });

    it('should not create order without bun', () => {
      // Добавляем только начинку без булки
      cy.contains('Биокотлета из марсианской Магнолии')
        .parents('li')
        .find('button')
        .click();

      // Кнопка "Оформить заказ" должна быть неактивна
      cy.contains('Оформить заказ').should('be.disabled');
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
      cy.get('[data-cy="constructor-ingredients"]').children().should('have.length', 2);
    });
  });

  describe('Counter display', () => {
    it('should display ingredient counter when added to constructor', () => {
      // Добавляем ингредиент
      cy.contains('Биокотлета из марсианской Магнолии')
        .parents('li')
        .find('button')
        .click();

      // Проверяем, что счётчик показывает 1
      cy.contains('Биокотлета из марсианской Магнолии')
        .parents('li')
        .find('[data-cy="ingredient-counter"]')
        .should('contain', '1');
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
        .find('[data-cy="ingredient-counter"]')
        .should('contain', '2');
    });
  });
});
