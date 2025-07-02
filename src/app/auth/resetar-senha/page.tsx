import ResetPasswordForm from '@/components/authForm/resetPasswordForm';
import { Metadata } from 'next';
import { cookies } from 'next/headers';

export const metadata: Metadata = {
 title: 'Resetar senha',
 description: 'Resetar senha',
};

interface props {
  searchParams: {
    from: string
  }
}

export default function SendCreateTwoAuthCode({...props}:props) {
 const cookieInfos = cookies().get('userAuthResetPass');

 return (
  <ResetPasswordForm
   cookieName={cookieInfos?.name}
   cookieVal={cookieInfos?.value}
   from={props.searchParams.from}
  />
 );
}
