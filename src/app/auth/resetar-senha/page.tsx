import ResetPasswordForm from '@/components/authForm/resetPasswordForm';
import { Metadata } from 'next';
import { cookies } from 'next/headers';

export const metadata: Metadata = {
 title: 'Resetar senha',
 description: 'Resetar senha',
};

export default function SendCreateTwoAuthCode() {
 const cookieInfos = cookies().get('userAuthResetPass');

 return (
  <ResetPasswordForm
   cookieName={cookieInfos?.name}
   cookieVal={cookieInfos?.value}
  />
 );
}
