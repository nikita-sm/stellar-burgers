import React, { FC, SyntheticEvent, useState, useEffect } from 'react';
import { useSelector, useDispatch } from '../../services/store';
import { RegisterUI } from '@ui-pages';
import { registerUser, clearError } from '../../services/slices/userSlice';

export const Register: FC = () => {
  const [userName, setUserName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // Принудительно очищаем поля от автозаполнения браузера
  useEffect(() => {
    const timer = setTimeout(() => {
      setUserName('');
      setEmail('');
      setPassword('');

      // Дополнительно очищаем DOM элементы
      const inputs = document.querySelectorAll('form[name="register"] input');
      inputs.forEach((input: any) => {
        if (input) {
          input.value = '';
          input.removeAttribute('data-autofilled');
        }
      });
    }, 100);

    return () => clearTimeout(timer);
  }, []);

  const dispatch = useDispatch();
  const { error, isLoading } = useSelector((state) => state.user);

  const handleSubmit = (e: SyntheticEvent) => {
    e.preventDefault();

    // Очищаем предыдущие ошибки
    dispatch(clearError());

    // Отправляем данные регистрации
    dispatch(
      registerUser({
        name: userName,
        email,
        password
      })
    );
  };

  return (
    <RegisterUI
      errorText={error || ''}
      email={email}
      userName={userName}
      password={password}
      setEmail={setEmail}
      setPassword={setPassword}
      setUserName={setUserName}
      handleSubmit={handleSubmit}
    />
  );
};
