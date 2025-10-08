import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useSelector } from '../../services/store';

// Интерфейс пропсов защищенного маршрута
interface ProtectedRouteProps {
  children: React.ReactElement;
  onlyUnAuth?: boolean;
}

// Компонент защищенного маршрута
export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  onlyUnAuth = false
}) => {
  const location = useLocation();
  const isAuth = useSelector((state) => state.user.isAuth);

  // Если маршрут только для неавторизованных, но пользователь авторизован
  if (onlyUnAuth && isAuth) {
    const from = location.state?.from || '/';
    return <Navigate to={from} replace />;
  }

  // Если маршрут требует авторизации, но пользователь не авторизован
  if (!onlyUnAuth && !isAuth) {
    return <Navigate to='/login' state={{ from: location }} replace />;
  }

  // Разрешаем доступ к маршруту
  return children;
};
