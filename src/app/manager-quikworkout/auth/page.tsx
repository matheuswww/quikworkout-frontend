import SendSigninCode from '@/components/manager/auth/sendSigninCode';
import { Metadata } from 'next';
import { cookies } from 'next/headers';

export const metadata: Metadata = {
 title: 'Entrar admin',
};

export default function ManagerAuth() {
 const cookieInfos = cookies().get('userProfile');

 return (
  <SendSigninCode
   cookieName={cookieInfos?.name}
   cookieVal={cookieInfos?.value}
  />
 );
}
