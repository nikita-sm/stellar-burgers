import ingredientsReducer, { fetchIngredients } from './ingredientsSlice';
import { TIngredient } from '../../utils/types';

describe('ingredientsSlice reducer', () => {
  const initialState = {
    ingredients: [],
    isLoading: false,
    error: null
  };

  const mockIngredients: TIngredient[] = [
    {
      _id: '1',
      name: 'Краторная булка N-200i',
      type: 'bun',
      proteins: 80,
      fat: 24,
      carbohydrates: 53,
      calories: 420,
      price: 1255,
      image: 'https://code.s3.yandex.net/react/code/bun-02.png',
      image_large: 'https://code.s3.yandex.net/react/code/bun-02-large.png',
      image_mobile: 'https://code.s3.yandex.net/react/code/bun-02-mobile.png'
    },
    {
      _id: '2',
      name: 'Биокотлета из марсианской Магнолии',
      type: 'main',
      proteins: 420,
      fat: 142,
      carbohydrates: 242,
      calories: 4242,
      price: 424,
      image: 'https://code.s3.yandex.net/react/code/meat-01.png',
      image_large: 'https://code.s3.yandex.net/react/code/meat-01-large.png',
      image_mobile: 'https://code.s3.yandex.net/react/code/meat-01-mobile.png'
    }
  ];

  describe('initial state', () => {
    it('should return initial state when called with undefined', () => {
      const state = ingredientsReducer(undefined, { type: 'unknown' });

      expect(state).toEqual({
        ingredients: [],
        isLoading: false,
        error: null
      });
    });
  });

  describe('fetchIngredients async thunk', () => {
    it('should set isLoading to true when fetchIngredients is pending', () => {
      const action = { type: fetchIngredients.pending.type };
      const state = ingredientsReducer(initialState, action);

      expect(state.isLoading).toBe(true);
      expect(state.error).toBeNull();
    });

    it('should set ingredients and isLoading to false when fetchIngredients is fulfilled', () => {
      const action = {
        type: fetchIngredients.fulfilled.type,
        payload: mockIngredients
      };
      const state = ingredientsReducer(
        { ...initialState, isLoading: true },
        action
      );

      expect(state.isLoading).toBe(false);
      expect(state.ingredients).toEqual(mockIngredients);
      expect(state.ingredients).toHaveLength(2);
      expect(state.error).toBeNull();
    });

    it('should set error and isLoading to false when fetchIngredients is rejected', () => {
      const errorMessage = 'Ошибка при загрузке ингредиентов';
      const action = {
        type: fetchIngredients.rejected.type,
        error: { message: errorMessage }
      };
      const state = ingredientsReducer(
        { ...initialState, isLoading: true },
        action
      );

      expect(state.isLoading).toBe(false);
      expect(state.error).toBe(errorMessage);
      expect(state.ingredients).toEqual([]);
    });

    it('should use default error message when error message is not provided', () => {
      const action = {
        type: fetchIngredients.rejected.type,
        error: {}
      };
      const state = ingredientsReducer(
        { ...initialState, isLoading: true },
        action
      );

      expect(state.isLoading).toBe(false);
      expect(state.error).toBe('Ошибка при загрузке ингредиентов');
    });
  });

  describe('Request-Success-Failed flow', () => {
    it('should handle full request lifecycle: pending -> fulfilled', () => {
      // Начинаем с начального состояния
      let state = ingredientsReducer(initialState, { type: 'unknown' });

      // Request: isLoading становится true
      const pendingAction = { type: fetchIngredients.pending.type };
      state = ingredientsReducer(state, pendingAction);

      expect(state.isLoading).toBe(true);
      expect(state.error).toBeNull();
      expect(state.ingredients).toEqual([]);

      // Success: данные записываются в store, isLoading становится false
      const fulfilledAction = {
        type: fetchIngredients.fulfilled.type,
        payload: mockIngredients
      };
      state = ingredientsReducer(state, fulfilledAction);

      expect(state.isLoading).toBe(false);
      expect(state.ingredients).toEqual(mockIngredients);
      expect(state.error).toBeNull();
    });

    it('should handle full request lifecycle: pending -> rejected', () => {
      // Начинаем с начального состояния
      let state = ingredientsReducer(initialState, { type: 'unknown' });

      // Request: isLoading становится true
      const pendingAction = { type: fetchIngredients.pending.type };
      state = ingredientsReducer(state, pendingAction);

      expect(state.isLoading).toBe(true);
      expect(state.error).toBeNull();

      // Failed: ошибка записывается в store, isLoading становится false
      const errorMessage = 'Network error';
      const rejectedAction = {
        type: fetchIngredients.rejected.type,
        error: { message: errorMessage }
      };
      state = ingredientsReducer(state, rejectedAction);

      expect(state.isLoading).toBe(false);
      expect(state.error).toBe(errorMessage);
      expect(state.ingredients).toEqual([]);
    });

    it('should clear previous error when new request starts', () => {
      // Начинаем с состояния с ошибкой
      const stateWithError = {
        ingredients: [],
        isLoading: false,
        error: 'Previous error'
      };

      // Новый запрос очищает ошибку
      const pendingAction = { type: fetchIngredients.pending.type };
      const state = ingredientsReducer(stateWithError, pendingAction);

      expect(state.isLoading).toBe(true);
      expect(state.error).toBeNull();
    });

    it('should replace old data when new successful request completes', () => {
      // Начинаем с состояния с данными
      const stateWithData = {
        ingredients: mockIngredients,
        isLoading: false,
        error: null
      };

      const newIngredients: TIngredient[] = [
        {
          _id: '3',
          name: 'New ingredient',
          type: 'sauce',
          proteins: 10,
          fat: 20,
          carbohydrates: 30,
          calories: 100,
          price: 200,
          image: 'test.png',
          image_large: 'test-large.png',
          image_mobile: 'test-mobile.png'
        }
      ];

      const fulfilledAction = {
        type: fetchIngredients.fulfilled.type,
        payload: newIngredients
      };
      const state = ingredientsReducer(stateWithData, fulfilledAction);

      expect(state.ingredients).toEqual(newIngredients);
      expect(state.ingredients).toHaveLength(1);
      expect(state.isLoading).toBe(false);
      expect(state.error).toBeNull();
    });
  });
});
