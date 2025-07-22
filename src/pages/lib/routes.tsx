import { TFunction } from 'i18next';
import { HomePage } from '../home-page/home-page';

export const routes = (t: TFunction) => ({
  home: {
    label: t('NAV.HOME'),
    pathname: '/',
    element: <HomePage />,
  },
});
