import { Dispatch, MutableRefObject } from 'react';
import styles from './getOrder.module.css';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

interface props {
 modalRef: MutableRefObject<HTMLFormElement | null>;
 closeRef: MutableRefObject<HTMLButtonElement | null>;
 setLoad: Dispatch<boolean>;
 load: boolean;
}

const schema = z
 .object({
  filter: z.string(),
 })
 .refine(
  (fields) => {
   return (
    fields.filter != '' &&
    !isNaN(Number(fields.filter)) &&
    Number(fields.filter) >= 0 &&
    Number(fields.filter) <= 100000
   );
  },
  {
   path: ['filter'],
   message: 'valor inválido',
  },
 );

type FormProps = z.infer<typeof schema>;

export default function Filter({ closeRef, modalRef, setLoad, load }: props) {
 const {
  register,
  handleSubmit,
  formState: { errors },
 } = useForm<FormProps>({
  mode: 'onSubmit',
  reValidateMode: 'onSubmit',
  resolver: zodResolver(schema),
 });

 function handleForm(data: FormProps) {
  setLoad(true);
  const url = new URL(window.location.href);
  url.searchParams.set('updated', data.filter);
  window.location.href = url.toString();
  if (closeRef.current instanceof HTMLButtonElement) {
   closeRef.current.click();
  }
 }

 return (
  <form
   tabIndex={0}
   className={`${styles.modal}`}
   ref={modalRef}
   onSubmit={handleSubmit(handleForm)}
  >
   <label htmlFor="filter">Filtrar por pedidos atualizados</label>
   <input
    {...register('filter')}
    type="number"
    placeholder="filtrar"
    id="filter"
   />
   {errors.filter?.message && (
    <p className={styles.error}>{errors.filter.message}</p>
   )}
   <button
    aria-label="fechar"
    type="button"
    className={`${styles.close} ${styles.button}`}
    ref={closeRef}
   >
    <span aria-hidden="true">x</span>
   </button>
   <button
    type="submit"
    disabled={load}
    className={`${styles.modalButton} ${styles.button}`}
   >
    Filtrar
   </button>
  </form>
 );
}
