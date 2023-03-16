import { SERVER_PORT } from '../../../common/constants';

interface IAuth {
  (): Promise<boolean | any>;
}

export const isAuth = () => {
  const fetchAuth: IAuth = async () => {
    try {
      const response = await fetch(`http://54.210.205.37/${SERVER_PORT}/auth/check`, {
        //const response = await fetch(`http://localhost:${SERVER_PORT}/auth/check`, {
        credentials: 'include',
      });
      const data = await response.json();

      if (data.message === 'Authorized') {
        return { status: true, data: { message: 'Authorized' } };
      } else {
        return { status: false, data: { message: 'Unauthorized' } };
      }
    } catch (error) {
      console.log(error);
      return { status: false, data: { message: 'Server error' } };
    }
  };

  return fetchAuth();
};
