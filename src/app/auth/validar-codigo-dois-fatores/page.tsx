import CheckTwoAuthCodeForm from '@/components/authForm/checkTwoAuthCode';
import { Metadata } from 'next';
import { cookies } from 'next/headers';

export const metadata: Metadata = {
 title: 'Validar código de dois fatores',
 description: 'validação do código de dois fatores',
};

export default async function CheckTwoAuthCode() {
 const cookieInfos = cookies().get('userTwoAuth');

 return (
  <CheckTwoAuthCodeForm
   cookieName={cookieInfos?.name}
   cookieVal={cookieInfos?.value}
  />
 );
}
