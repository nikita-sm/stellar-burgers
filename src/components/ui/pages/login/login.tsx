import { FC, useState, useEffect } from 'react';
import {
  Input,
  Button,
  PasswordInput
} from '@zlden/react-developer-burger-ui-components';
import styles from '../common.module.css';
import { Link } from 'react-router-dom';
import { LoginUIProps } from './type';

export const LoginUI: FC<LoginUIProps> = ({
  email,
  setEmail,
  errorText,
  handleSubmit,
  password,
  setPassword
}) => {
  const [isReadOnly, setIsReadOnly] = useState(true);
  const [formKey, setFormKey] = useState(Date.now());
  const [fieldNames] = useState({
    email: `usr-${Math.random().toString(36).substr(2, 9)}`,
    password: `pwd-${Math.random().toString(36).substr(2, 9)}`
  });

  useEffect(() => {
    // Агрессивная очистка и блокировка автозаполнения
    const timer = setTimeout(() => setIsReadOnly(false), 50);

    // Принудительное обновление формы
    setFormKey(Date.now());

    // Более мягкая очистка только в начале
    const cleanupIntervals = [50, 100, 200];
    const timers = cleanupIntervals.map((delay) =>
      setTimeout(() => {
        // Полная очистка всех полей в форме только если они не в фокусе
        const form = document.querySelector('form[name="login"]');
        if (form) {
          const allInputs = form.querySelectorAll('input, textarea, select');
          allInputs.forEach((input: any) => {
            if (
              input &&
              input.style.display !== 'none' &&
              input.type !== 'hidden' &&
              document.activeElement !== input
            ) {
              // Очистка только если поле не активно
              input.value = '';
              input.removeAttribute('data-autofilled');
              input.removeAttribute('data-com.bitwarden.browser.user-edited');
              input.removeAttribute('data-lastpass-icon-added');
              input.removeAttribute('data-1p-ignore');
              input.removeAttribute('data-dashlane-observed');
            }
          });
        }
      }, delay)
    );

    return () => {
      clearTimeout(timer);
      timers.forEach((t) => clearTimeout(t));
    };
  }, []);

  return (
    <main className={styles.container}>
      <div className={`pt-6 ${styles.wrapCenter}`}>
        <h3 className='pb-6 text text_type_main-medium'>Вход</h3>
        <form
          className={`pb-15 ${styles.form}`}
          name='login'
          onSubmit={handleSubmit}
          autoComplete='off'
        >
          {/* Множественные скрытые фальшивые поля */}
          <input
            type='text'
            style={{ display: 'none' }}
            tabIndex={-1}
            autoComplete='off'
          />
          <input
            type='email'
            style={{ display: 'none' }}
            tabIndex={-1}
            autoComplete='off'
          />
          <input
            type='password'
            style={{ display: 'none' }}
            tabIndex={-1}
            autoComplete='off'
          />
          <input
            type='text'
            style={{ display: 'none' }}
            tabIndex={-1}
            autoComplete='username'
          />
          <input
            type='password'
            style={{ display: 'none' }}
            tabIndex={-1}
            autoComplete='current-password'
          />

          <div key={formKey}>
            <div className='pb-6'>
              <Input
                key={`email-${formKey}`}
                type='email'
                placeholder='E-mail'
                onChange={(e) => setEmail(e.target.value)}
                value={email}
                name={fieldNames.email}
                error={false}
                errorText=''
                size='default'
                autoComplete='new-password'
                readOnly={isReadOnly}
                onFocus={() => {
                  setIsReadOnly(false);
                }}
                onClick={() => {
                  setIsReadOnly(false);
                }}
              />
            </div>
            <div className='pb-6'>
              <PasswordInput
                key={`password-${formKey}`}
                onChange={(e) => setPassword(e.target.value)}
                value={password}
                name={fieldNames.password}
              />
            </div>
          </div>

          <div className={`pb-6 ${styles.button}`}>
            <Button type='primary' size='medium' htmlType='submit'>
              Войти
            </Button>
          </div>
          {errorText && (
            <p className={`${styles.error} text text_type_main-default pb-6`}>
              {errorText}
            </p>
          )}
        </form>
        <div className={`pb-4 ${styles.question} text text_type_main-default`}>
          Вы - новый пользователь?
          <Link to='/register' className={`pl-2 ${styles.link}`}>
            Зарегистрироваться
          </Link>
        </div>
        <div className={`${styles.question} text text_type_main-default pb-6`}>
          Забыли пароль?
          <Link to={'/forgot-password'} className={`pl-2 ${styles.link}`}>
            Восстановить пароль
          </Link>
        </div>
      </div>
    </main>
  );
};
