import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { orderBurgerApi } from '../../utils/burger-api';
import { TOrder } from '../../utils/types';

// Типы для состояния заказа
type TOrderState = {
  orderRequest: boolean;
  orderData: TOrder | null;
  error: string | null;
};

// Начальное состояние
const initialState: TOrderState = {
  orderRequest: false,
  orderData: null,
  error: null
};

// Асинхронное действие создания заказа
export const createOrder = createAsyncThunk(
  'order/createOrder',
  async (ingredients: string[]) => {
    const data = await orderBurgerApi(ingredients);
    return data.order;
  }
);

// Слайс заказов
const orderSlice = createSlice({
  name: 'order',
  initialState,
  reducers: {
    // Очистка данных заказа
    clearOrderData: (state) => {
      state.orderData = null;
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(createOrder.pending, (state) => {
        state.orderRequest = true;
        state.error = null;
      })
      .addCase(createOrder.fulfilled, (state, action) => {
        state.orderRequest = false;
        state.orderData = action.payload;
      })
      .addCase(createOrder.rejected, (state, action) => {
        state.orderRequest = false;
        state.error = action.error.message || 'Ошибка при создании заказа';
      });
  }
});

export const { clearOrderData } = orderSlice.actions;
export default orderSlice.reducer;
