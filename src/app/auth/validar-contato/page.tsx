import SendContactValidationCodeForm from '@/components/authForm/sendContactValidationCodeForm';
import { Metadata } from 'next';
import { cookies } from 'next/headers';

export const metadata: Metadata = {
 title: 'Validação de contato',
 description: 'validação de contato',
 keywords:
  'validar contato, quikworkout, validar contato quikworkout, email, senha, validar email, validar senha',
};

interface sendContactValidationCode {
 searchParams: {
  welcome: string | undefined;
 };
}

export default async function SendContactValidationCode({
 ...props
}: sendContactValidationCode) {
 const cookieInfos = cookies().get('userProfile');

 return (
  <SendContactValidationCodeForm
   welcome={props.searchParams.welcome == 'true' ? true : false}
   cookieName={cookieInfos?.name}
   cookieVal={cookieInfos?.value}
  />
 );
}
