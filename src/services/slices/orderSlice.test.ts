import orderReducer, { createOrder, clearOrderData } from './orderSlice';
import { TOrder } from '../../utils/types';

describe('orderSlice reducer', () => {
  const initialState = {
    orderRequest: false,
    orderData: null,
    error: null
  };

  const mockOrder: TOrder = {
    _id: '123',
    status: 'done',
    name: 'Флюоресцентный бургер',
    createdAt: '2024-01-01T00:00:00.000Z',
    updatedAt: '2024-01-01T00:00:00.000Z',
    number: 12345,
    ingredients: ['ingredient1', 'ingredient2']
  };

  describe('initial state', () => {
    it('should return initial state when called with undefined', () => {
      const state = orderReducer(undefined, { type: 'unknown' });

      expect(state).toEqual({
        orderRequest: false,
        orderData: null,
        error: null
      });
    });
  });

  describe('clearOrderData', () => {
    it('should clear order data and error', () => {
      const stateWithData = {
        orderRequest: false,
        orderData: mockOrder,
        error: 'Some error'
      };

      const state = orderReducer(stateWithData, clearOrderData());

      expect(state.orderData).toBeNull();
      expect(state.error).toBeNull();
      expect(state.orderRequest).toBe(false);
    });

    it('should work on empty state', () => {
      const state = orderReducer(initialState, clearOrderData());

      expect(state.orderData).toBeNull();
      expect(state.error).toBeNull();
    });
  });

  describe('createOrder async thunk', () => {
    it('should set orderRequest to true when createOrder is pending', () => {
      const action = { type: createOrder.pending.type };
      const state = orderReducer(initialState, action);

      expect(state.orderRequest).toBe(true);
      expect(state.error).toBeNull();
    });

    it('should set orderData and orderRequest to false when createOrder is fulfilled', () => {
      const action = {
        type: createOrder.fulfilled.type,
        payload: mockOrder
      };
      const state = orderReducer(
        { ...initialState, orderRequest: true },
        action
      );

      expect(state.orderRequest).toBe(false);
      expect(state.orderData).toEqual(mockOrder);
      expect(state.error).toBeNull();
    });

    it('should set error and orderRequest to false when createOrder is rejected', () => {
      const errorMessage = 'Ошибка при создании заказа';
      const action = {
        type: createOrder.rejected.type,
        error: { message: errorMessage }
      };
      const state = orderReducer(
        { ...initialState, orderRequest: true },
        action
      );

      expect(state.orderRequest).toBe(false);
      expect(state.error).toBe(errorMessage);
      expect(state.orderData).toBeNull();
    });

    it('should use default error message when error message is not provided', () => {
      const action = {
        type: createOrder.rejected.type,
        error: {}
      };
      const state = orderReducer(
        { ...initialState, orderRequest: true },
        action
      );

      expect(state.orderRequest).toBe(false);
      expect(state.error).toBe('Ошибка при создании заказа');
    });
  });

  describe('Request-Success-Failed flow for createOrder', () => {
    it('should handle full request lifecycle: pending -> fulfilled', () => {
      // Начинаем с начального состояния
      let state = orderReducer(initialState, { type: 'unknown' });

      // Request: orderRequest становится true
      const pendingAction = { type: createOrder.pending.type };
      state = orderReducer(state, pendingAction);

      expect(state.orderRequest).toBe(true);
      expect(state.error).toBeNull();
      expect(state.orderData).toBeNull();

      // Success: данные записываются в store, orderRequest становится false
      const fulfilledAction = {
        type: createOrder.fulfilled.type,
        payload: mockOrder
      };
      state = orderReducer(state, fulfilledAction);

      expect(state.orderRequest).toBe(false);
      expect(state.orderData).toEqual(mockOrder);
      expect(state.error).toBeNull();
    });

    it('should handle full request lifecycle: pending -> rejected', () => {
      // Начинаем с начального состояния
      let state = orderReducer(initialState, { type: 'unknown' });

      // Request: orderRequest становится true
      const pendingAction = { type: createOrder.pending.type };
      state = orderReducer(state, pendingAction);

      expect(state.orderRequest).toBe(true);
      expect(state.error).toBeNull();

      // Failed: ошибка записывается в store, orderRequest становится false
      const errorMessage = 'Network error';
      const rejectedAction = {
        type: createOrder.rejected.type,
        error: { message: errorMessage }
      };
      state = orderReducer(state, rejectedAction);

      expect(state.orderRequest).toBe(false);
      expect(state.error).toBe(errorMessage);
      expect(state.orderData).toBeNull();
    });

    it('should clear previous error when new request starts', () => {
      // Начинаем с состояния с ошибкой
      const stateWithError = {
        orderRequest: false,
        orderData: null,
        error: 'Previous error'
      };

      // Новый запрос очищает ошибку
      const pendingAction = { type: createOrder.pending.type };
      const state = orderReducer(stateWithError, pendingAction);

      expect(state.orderRequest).toBe(true);
      expect(state.error).toBeNull();
    });

    it('should replace old order data when new successful request completes', () => {
      // Начинаем с состояния с данными
      const stateWithData = {
        orderRequest: false,
        orderData: mockOrder,
        error: null
      };

      const newOrder: TOrder = {
        ...mockOrder,
        _id: '456',
        number: 67890,
        name: 'Новый бургер'
      };

      const fulfilledAction = {
        type: createOrder.fulfilled.type,
        payload: newOrder
      };
      const state = orderReducer(stateWithData, fulfilledAction);

      expect(state.orderData).toEqual(newOrder);
      expect(state.orderData?.number).toBe(67890);
      expect(state.orderRequest).toBe(false);
      expect(state.error).toBeNull();
    });
  });
});
