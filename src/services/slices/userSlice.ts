import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import {
  registerUserApi,
  loginUserApi,
  logoutApi,
  getUserApi,
  updateUserApi,
  TRegisterData,
  TLoginData
} from '../../utils/burger-api';
import { TUser } from '../../utils/types';
import { setCookie, deleteCookie } from '../../utils/cookie';

type TUserState = {
  user: TUser | null;
  isAuth: boolean;
  isLoading: boolean;
  error: string | null;
};
const initialState: TUserState = {
  user: null,
  isAuth: false,
  isLoading: false,
  error: null
};

export const registerUser = createAsyncThunk(
  'user/register',
  async (userData: TRegisterData, { rejectWithValue }) => {
    try {
      /*В ответе либо ошибка, что пользователь уже есть, либо токены*/
      const data = await registerUserApi(userData);
      localStorage.setItem('refreshToken', data.refreshToken);
      setCookie('accessToken', data.accessToken);
      return data.user;
    } catch (error: any) {
      let errorMessage = 'Ошибка регистрации'; /*Ошибка запроса регистрации*/
      if (error?.message) {
        const message = error.message.toLowerCase();
        if (message.includes('already exists') || message.includes('exist')) {
          errorMessage = 'Пользователь с таким email уже существует';
        } else if (message.includes('validation')) {
          errorMessage = 'Проверьте правильность введенных данных';
        } else if (message.includes('password')) {
          errorMessage = 'Пароль должен содержать минимум 6 символов';
        }
      }
      return rejectWithValue(errorMessage);
    }
  }
);

export const loginUser = createAsyncThunk(
  'user/login',
  async (userData: TLoginData, { rejectWithValue }) => {
    try {
      /*Запрос на вход. Если удачно, то ответ как при регистрации, иначе в ответе будет инфо про неправильный eamil или пароль*/
      const data = await loginUserApi(userData);
      localStorage.setItem('refreshToken', data.refreshToken);
      setCookie('accessToken', data.accessToken);
      return data.user;
    } catch (error: any) {
      let errorMessage = 'Ошибка авторизации';
      if (error?.message) {
        const message = error.message.toLowerCase();
        if (
          message.includes('email or password are incorrect') ||
          message.includes('incorrect')
        ) {
          errorMessage = 'Неверный email или пароль';
        } else if (
          message.includes('user not found') ||
          message.includes('not found')
        ) {
          errorMessage = 'Пользователь не найден';
        } else if (message.includes('validation')) {
          errorMessage = 'Проверьте правильность введенных данных';
        }
      }
      return rejectWithValue(errorMessage);
    }
  }
);
/*Разлогиниться. Если ошибка, то сообщение об обязательном Token required. Если успешно, то Successful logout */
export const logoutUser = createAsyncThunk('user/logout', async () => {
  await logoutApi();
  localStorage.removeItem('refreshToken');
  deleteCookie('accessToken');
});
/*Если успех, то получить поле success и объект с email и name. Если ошибка, то false*/
export const getUser = createAsyncThunk(
  'user/getUser',
  async (_, { rejectWithValue }) => {
    try {
      // Проверяем наличие токена перед запросом
      const accessToken = document.cookie.replace(
        /(?:(?:^|.*;\s*)accessToken\s*\=\s*([^;]*).*$)|^.*$/,
        '$1'
      );
      if (!accessToken) {
        return rejectWithValue('No access token');
      }
      /*Если токена нет, то ошибка => You should be authorised*/
      /*Если успешно [Если есть токен], то приходит ответ в виде объекта {user, email}*/
      const data = await getUserApi();
      return data.user;
    } catch (error) {
      return rejectWithValue('Failed to get user');
    }
  }
);
/*Обновить данные пользователя. Передаем объект с полями password, user, name. ?????????*/
export const updateUser = createAsyncThunk(
  'user/updateUser',
  async (userData: Partial<TRegisterData>, { rejectWithValue }) => {
    try {
      const data = await updateUserApi(userData);
      return data.user;
    } catch (error: any) {
      let errorMessage = 'Ошибка обновления данных';
      if (error?.message) {
        const message = error.message.toLowerCase();
        if (
          message.includes('user already exists') ||
          message.includes('exist')
        ) {
          errorMessage = 'Пользователь с таким email уже существует';
        } else if (message.includes('validation')) {
          errorMessage = 'Проверьте правильность введенных данных';
        } else if (message.includes('password')) {
          errorMessage = 'Пароль должен содержать минимум 6 символов';
        }
      }
      return rejectWithValue(errorMessage);
    }
  }
);

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearLoginForm: (state) => {}
  },
  extraReducers: (builder) => {
    builder
      .addCase(registerUser.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(registerUser.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload;
        state.isAuth = true;
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.isLoading = false;
        state.error =
          (action.payload as string) ||
          action.error.message ||
          'Ошибка регистрации';
      })
      .addCase(loginUser.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload;
        state.isAuth = true;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.isLoading = false;
        state.error =
          (action.payload as string) ||
          action.error.message ||
          'Ошибка авторизации';
      })
      .addCase(logoutUser.fulfilled, (state) => {
        state.user = null;
        state.isAuth = false;
      })
      .addCase(getUser.fulfilled, (state, action) => {
        state.user = action.payload;
        state.isAuth = true;
      })
      .addCase(getUser.rejected, (state) => {
        state.user = null;
        state.isAuth = false;
      })
      .addCase(updateUser.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updateUser.fulfilled, (state, action) => {
        state.user = action.payload;
        state.isLoading = false;
        state.error = null;
      })
      .addCase(updateUser.rejected, (state, action) => {
        state.isLoading = false;
        state.error =
          (action.payload as string) ||
          action.error.message ||
          'Ошибка обновления данных';
      });
  }
});

export const { clearError, clearLoginForm } = userSlice.actions;
export default userSlice.reducer;
