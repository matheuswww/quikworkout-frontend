import SigninForm from '@/components/authForm/signin';
import { Metadata } from 'next';

export const metadata: Metadata = {
 title: 'Entrar',
 description: 'Entrar em minha conta quikworkout',
 keywords:
  'login, login quikworkout, entrar conta, entrar conta quikworkout, quikworkout, entrar, entrar quikworkout, entrar',
 openGraph: {
  title: 'Cadastro',
  description: 'Efetuar cadastro na quikworkout',
  images: '/img/background-login.jpg',
 },
};

interface props {
  searchParams: {
    from: string
  }
}

export default function Entrar({...props}: props) {
 return <SigninForm from={props.searchParams.from} />;
}
