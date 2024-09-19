import SignupForm from '@/components/authForm/signup';
import { Metadata } from 'next';

export const metadata: Metadata = {
 title: 'Cadastro',
 description: 'Efetuar cadastro na quikworkout',
 keywords:
  'login, login quikworkout, criar conta, criar conta quikworkout, quikworkout, cadastro, cadastro quikworkout, cadastrar, cadastrar quikworkout',
 openGraph: {
  title: 'Cadastro',
  description: 'Efetuar cadastro na quikworkout',
  images: '/img/background-login.jpg',
 },
};

export default function Signup() {
 return <SignupForm />;
}
