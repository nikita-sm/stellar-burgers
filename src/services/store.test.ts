import { configureStore, combineReducers } from '@reduxjs/toolkit';
import ingredientsReducer from './slices/ingredientsSlice';
import constructorReducer from './slices/constructorSlice';
import orderReducer from './slices/orderSlice';
import userReducer from './slices/userSlice';
import feedReducer from './slices/feedSlice';

// Создаём rootReducer так же, как в основном файле store.ts
const rootReducer = combineReducers({
  ingredients: ingredientsReducer,
  burgerConstructor: constructorReducer,
  order: orderReducer,
  user: userReducer,
  feed: feedReducer
});

describe('rootReducer', () => {
  it('should return initial state when called with undefined state and unknown action', () => {
    // Создаём неизвестный экшен
    const unknownAction = { type: 'UNKNOWN_ACTION' };

    // Вызываем rootReducer с undefined состоянием
    const initialState = rootReducer(undefined, unknownAction);

    // Проверяем, что вернулось корректное начальное состояние
    expect(initialState).toEqual({
      ingredients: {
        ingredients: [],
        isLoading: false,
        error: null
      },
      burgerConstructor: {
        bun: null,
        ingredients: []
      },
      order: expect.any(Object),
      user: expect.any(Object),
      feed: expect.any(Object)
    });
  });

  it('should have all required reducers', () => {
    const unknownAction = { type: 'UNKNOWN_ACTION' };
    const state = rootReducer(undefined, unknownAction);

    // Проверяем наличие всех ключей в состоянии
    expect(state).toHaveProperty('ingredients');
    expect(state).toHaveProperty('burgerConstructor');
    expect(state).toHaveProperty('order');
    expect(state).toHaveProperty('user');
    expect(state).toHaveProperty('feed');
  });

  it('should correctly initialize store with rootReducer', () => {
    // Создаём стор с rootReducer
    const store = configureStore({
      reducer: rootReducer
    });

    const state = store.getState();

    // Проверяем структуру состояния
    expect(state.ingredients).toBeDefined();
    expect(state.burgerConstructor).toBeDefined();
    expect(state.order).toBeDefined();
    expect(state.user).toBeDefined();
    expect(state.feed).toBeDefined();
  });

  it('should handle actions from different slices independently', () => {
    // Создаём начальное состояние
    const initialState = rootReducer(undefined, { type: 'UNKNOWN_ACTION' });

    // Импортируем экшены из слайсов
    const { addIngredient } = require('./slices/constructorSlice');

    // Создаём тестовый ингредиент
    const testIngredient = {
      _id: '1',
      name: 'Test',
      type: 'main',
      proteins: 10,
      fat: 20,
      carbohydrates: 30,
      calories: 100,
      price: 200,
      image: 'test.png',
      image_large: 'test-large.png',
      image_mobile: 'test-mobile.png'
    };

    // Применяем экшен
    const newState = rootReducer(initialState, addIngredient(testIngredient));

    // Проверяем, что изменился только нужный слайс
    expect(newState.burgerConstructor.ingredients.length).toBe(1);
    expect(newState.ingredients).toEqual(initialState.ingredients);
    expect(newState.order).toEqual(initialState.order);
    expect(newState.user).toEqual(initialState.user);
    expect(newState.feed).toEqual(initialState.feed);
  });
});
