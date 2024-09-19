'use client';
import styles from './resetPassswordForm.module.css';
import PopupError from '../popupError/popupError';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import SpinLoading from '../spinLoading/spinLoading';
import { useRouter } from 'next/navigation';
import ResetPassword from '@/api/auth/resetPassword';
import Password from './password';
import { useEffect, useState } from 'react';
import { deleteCookie } from '@/action/deleteCookie';

interface props {
 cookieName: string | undefined;
 cookieVal: string | undefined;
}

const schema = z.object({
 password: z
  .string()
  .min(8, 'senha precisa ter pelo menos 8 caracteres')
  .max(72, 'A senha deve ter no maxímo de 72 caracteres'),
});

type FormProps = z.infer<typeof schema>;

export default function ResetPasswordForm({ ...props }: props) {
 const router = useRouter();
 const cookie = props.cookieName + '=' + props.cookieVal;
 const [load, setLoad] = useState<boolean>(true);
 const [popUpError, setPopUpError] = useState<number | null>(null);
 const {
  register,
  handleSubmit,
  formState: { errors },
 } = useForm<FormProps>({
  mode: 'onSubmit',
  reValidateMode: 'onSubmit',
  resolver: zodResolver(schema),
 });

 async function handleForm(data: FormProps) {
  setLoad(true);
  const res = await ResetPassword(cookie, {
   senha: data.password,
  });
  if (
   res == 'você não possui um código registrado' ||
   res == 'máximo de tentativas atingido' ||
   res == 'código expirado'
  ) {
   router.push('/auth/entrar');
   return;
  }
  if (res == 401) {
   await deleteCookie('userResetPass');
   localStorage.removeItem('timeResetPassword');
   router.push('/auth/entrar');
   return;
  } else if (res == 500) {
   setPopUpError(res);
   setLoad(false);
  } else {
   localStorage.removeItem('timeResetPassword');
   router.push('/auth/entrar');
   return;
  }
 }

 useEffect(() => {
  if (props.cookieName == undefined || props.cookieVal == undefined) {
   router.push('/auth/entrar');
  } else {
   const prevTime = Number(localStorage.getItem('timeResetPassword'));
   const currentTIme = new Date().getTime();
   let elapsedTime: number = 0;
   if (prevTime) {
    elapsedTime = Math.round(Math.abs(currentTIme - prevTime) / 1000);
    if (elapsedTime > 60 * 6) {
     localStorage.removeItem('timeResetPassword');
     router.push('/auth/entrar');
    } else {
     setLoad(false);
    }
   }
  }
 }, []);

 return (
  <>
   {popUpError == 500 && <PopupError handleOut={() => setPopUpError(null)} />}
   {load && <SpinLoading />}
   <main className={`${styles.main} ${load && styles.lowOpacity}`}>
    <form className={styles.form} onSubmit={handleSubmit(handleForm)}>
     <h1>Resetar Senha</h1>
     <label htmlFor="passsword">Nova senha</label>
     <Password
      {...register('password')}
      id="password"
      placeholder="insira sua nova senha"
     />
     {errors.password?.message && (
      <p className={styles.error}>{errors.password.message}</p>
     )}
     <button
      disabled={load ? true : false}
      type="submit"
      className={`${load && styles.loading} ${styles.buttonForm}`}
      style={{ marginTop: '15px' }}
     >
      {load ? 'Carregando...' : 'Alterar senha'}
     </button>
    </form>
   </main>
  </>
 );
}
