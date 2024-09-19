import SendRemoveTwoAuthCodeForm from '@/components/authForm/sendRemoveTwoAuthCodeForm';
import { Metadata } from 'next';
import { cookies } from 'next/headers';

export const metadata: Metadata = {
 title: 'Remover autenticação de dois fatores',
 description: 'remoção de autenticação de dois fatores',
 keywords: 'remover autenticação de dois fatores,quikworkout',
};

export default function SendRemoveTwoAuthCode() {
 const cookieInfos = cookies().get('userProfile');

 return (
  <SendRemoveTwoAuthCodeForm
   cookieName={cookieInfos?.name}
   cookieVal={cookieInfos?.value}
  />
 );
}
