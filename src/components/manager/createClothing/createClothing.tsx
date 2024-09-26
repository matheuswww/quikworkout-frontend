'use client';

import { useEffect, useRef, useState } from 'react';
import styles from './createClothing.module.css';
import Inventory from './inventory';
import handleModalClick from '@/funcs/handleModalClick';
import Image from 'next/image';
import handleArrowClick from '@/funcs/handleArrowClick';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import SpinLoading from '@/components/spinLoading/spinLoading';
import CreateClothing from '@/api/manager/clothing/createClothing';
import { useRouter } from 'next/navigation';
import PopupError from '@/components/popupError/popupError';
import Success from '@/components/successs/success';
import Menu from '../menu/menu';
import { refresh } from '@/action/refresh';

interface props {
 cookieName?: string;
 cookieVal?: string;
}

export interface inventory {
 images: Blob[];
 cor: string;
 imgDesc: string;
 p: number | null;
 m: number | null;
 g: number | null;
 gg: number | null;
}

const schema = z.object({
 nome: z
  .string()
  .min(1, 'é necessário pelo menos 1 caracter')
  .max(15, 'nome deve ter no maxímo 15 caracteres'),
 descricao: z
  .string()
  .min(1, 'é necessário pelo menos 1 caracter')
  .max(200, 'descricação deve ter no maxímo 200 caracteres'),
 preco: z.string().refine(
  (val) => {
   if (val.includes(',')) {
    val = val.replace(',', '.');
   }
   if (isNaN(Number(val))) {
    return false;
   }
   if (Number(val) <= 0) {
    return false;
   }
   return true;
  },
  {
   message: 'preço inválido',
  },
 ),
 categoria: z
  .string()
  .min(1, 'é necessário pelo menos 1 caracter')
  .max(15, 'categoria deve ter no maxímo 15 caracteres'),
 material: z
  .string()
  .min(1, 'é necessário pelo menos 1 caracter')
  .max(15, 'material deve ter no maxímo 15 caracteres'),
});

type FormProps = z.infer<typeof schema>;

export default function CreateClothingForm({ ...props }: props) {
 const router = useRouter();
 const {
  register,
  handleSubmit,
  formState: { errors },
  reset,
 } = useForm<FormProps>({
  mode: 'onSubmit',
  reValidateMode: 'onSubmit',
  resolver: zodResolver(schema),
 });
 const [load, setLoad] = useState<boolean>(false);
 const [popupError, setPopupError] = useState<boolean>(false);
 const [error, setError] = useState<string | null>(null);
 const [sex, setSex] = useState<'M' | 'F' | 'UNISEX'>('F');
 const [inventory, setInventory] = useState<inventory[] | null>(null);
 const [mainInventory, setMainInventory] = useState<number>(0);
 const [success, setSuccess] = useState<boolean>(false);
 const [resetForm, setResetForm] = useState<boolean>(false)
 const buttonRef = useRef<HTMLButtonElement | null>(null);
 const modalRef = useRef<HTMLFormElement | null>(null);
 const buttonCloseRef = useRef<HTMLButtonElement | null>(null);

 async function handleForm(data: FormProps) {
  setError(null);
  if (inventory?.length == 0 || inventory?.length == undefined) {
   setError('é necessário pelo menos 1 inventário');
   return;
  }
  if (props.cookieName == undefined || props.cookieVal == undefined) {
   router.push('/manager-quikworkout/auth');
   return;
  }
  const cookie = props.cookieName + '=' + props.cookieVal;
  if (data.preco.includes(',')) {
   data.preco = data.preco.replace(',', '.');
  }
  const imgs: Blob[] = [];
  inventory.forEach((i) => {
   i.images.map((img) => {
    imgs.push(img);
   });
  });
  const i = inventory.map((i, index) => {
   return JSON.stringify({
    cor: i.cor,
    p: i.p,
    m: i.m,
    g: i.g,
    gg: i.gg,
    imgDesc: i.imgDesc,
    corPrincipal: index == mainInventory,
   });
  });
  setLoad(true);
  const res = await CreateClothing(cookie, {
   ativo: true,
   categoria: data.categoria,
   descricao: data.descricao,
   material: data.material,
   nome: data.nome,
   preco: Number(data.preco),
   sexo: sex,
   imagem: imgs,
   inventario: i,
  });
  if (res == 401) {
   router.push('/manager-quikworkout/auth');
   return;
  }
  if (res == 500) {
   setPopupError(true);
  }
  if (res == 201) {
   setInventory(null)
   setResetForm(true)
   reset()
   setSuccess(true);
   await refresh('/');
   await refresh('/manager-quikworkout/roupas');
  }
  setLoad(false);
 }

 useEffect(() => {
  if (
   inventory &&
   inventory?.length > 0 &&
   error == 'é necessário pelo menos 1 inventário'
  ) {
   setError(null);
  }
 }, [inventory]);

 return (
  <>
   <Menu cookieName={props.cookieName} cookieVal={props.cookieVal} />
   {popupError && <PopupError handleOut={() => setPopupError(false)} />}
   {load && <SpinLoading />}
   <Success
    setSuccess={setSuccess}
    success={success}
    msg="Criado com sucesso"
   />
   <main className={`${styles.main} ${load && styles.opacity}`}>
    <Inventory
     setInventory={setInventory}
     closeRef={buttonCloseRef}
     modalRef={modalRef}
     inventory={inventory}
     resetForm={resetForm}
     setReset={setResetForm}
    />
    <section className={styles.section}>
     <form className={styles.form} onSubmit={handleSubmit(handleForm)}>
      <h1>Criar roupa</h1>
      <label htmlFor="name">Nome</label>
      <input {...register('nome')} id="name" placeholder="nome" />
      {errors.nome?.message && (
       <p className={styles.error}>{errors.nome.message}</p>
      )}
      <label htmlFor="description">Descrição</label>
      <input
       {...register('descricao')}
       id="description"
       placeholder="descricação"
      />
      {errors.descricao?.message && (
       <p className={styles.error}>{errors.descricao?.message}</p>
      )}
      <label htmlFor="price">Preço</label>
      <input
       {...register('preco')}
       type="text"
       id="price"
       placeholder="preço"
      />
      {errors.preco?.message && (
       <p className={styles.error}>{errors.preco?.message}</p>
      )}
      <label htmlFor="category">Categoria</label>
      <input {...register('categoria')} id="category" placeholder="categoria" />
      {errors.categoria?.message && (
       <p className={styles.error}>{errors.categoria?.message}</p>
      )}
      <label htmlFor="material">Material</label>
      <input id="material" {...register('material')} placeholder="material" />
      {errors.material?.message && (
       <p className={styles.error}>{errors.material?.message}</p>
      )}
      <div className={styles.sex}>
       <label htmlFor="m">M</label>
       <input
        id="m"
        type="checkbox"
        checked={sex == 'M'}
        onChange={() => setSex('M')}
       />
       <label htmlFor="f">F</label>
       <input
        id="f"
        type="checkbox"
        checked={sex == 'F'}
        onChange={() => setSex('F')}
       />
       <label htmlFor="unisex">UNISEX</label>
       <input
        id="unisex"
        type="checkbox"
        checked={sex == 'UNISEX'}
        onChange={() => setSex('UNISEX')}
       />
      </div>
      <button
       className={`${styles.addInventory} ${styles.button}`}
       disabled={load}
       type="button"
       onClick={() =>
        handleModalClick(
         modalRef,
         buttonRef,
         buttonCloseRef,
         styles.active,
         'grid',
        )
       }
       ref={buttonRef}
      >
       Adiconar novo inventário
      </button>
      {inventory?.map((i, index) => {
       return (
        <div key={i.cor + index}>
         <div className={styles.show}>
          <button
           className={styles.buttonExpand}
           type="button"
           onClick={() =>
            handleArrowClick(index, 'inventory', styles.displayNone)
           }
          >
           Ver inventário {index + 1}
          </button>
          <Image
           src="/img/arrowUp.png"
           alt={`expandir ver inventário ${index}`}
           width={30}
           height={30}
           className={`${styles.expand}`}
           onClick={() =>
            handleArrowClick(index, 'inventory', styles.displayNone)
           }
           id={`arrowUp_inventory_${index}`}
          />
          <Image
           src="/img/arrowDown.png"
           alt={`diminuir ver inventário ${index}`}
           width={30}
           height={30}
           className={`${styles.expand} ${styles.displayNone}`}
           onClick={() =>
            handleArrowClick(index, 'inventory', styles.displayNone)
           }
           id={`arrowDown_inventory_${index}`}
          />
         </div>
         <div
          className={`${styles.displayNone} ${styles.inventoryItem}`}
          id={`item_inventory_${index}`}
         >
          <label>inventário principal</label>
          <input
           type="checkbox"
           className={styles.checkbox}
           checked={mainInventory == index}
           onChange={() => setMainInventory(index)}
          />
          <p className={styles.p}>
           Cor: <span className={styles.val}>{i.cor}</span>
          </p>
          <p className={styles.p}>
           Descrição da imagem: <span className={styles.val}>{i.imgDesc}</span>
          </p>
          <p className={styles.p}>
           P: <span className={styles.val}>{i.p}</span>
          </p>
          <p className={styles.p}>
           M: <span className={styles.val}>{i.m}</span>
          </p>
          <p className={styles.p}>
           G: <span className={styles.val}>{i.g}</span>
          </p>
          <p className={styles.p}>
           GG: <span className={styles.val}>{i.gg}</span>
          </p>
          <div className={styles.show}>
           <button
            className={styles.buttonExpand}
            type="button"
            onClick={() =>
             handleArrowClick(index, 'images', styles.displayNone)
            }
           >
            Ver imagens
           </button>
           <Image
            src="/img/arrowUp.png"
            alt="expandir ver todas as imagens"
            width={30}
            height={30}
            className={`${styles.expand}`}
            onClick={() =>
             handleArrowClick(index, 'images', styles.displayNone)
            }
            id={`arrowUp_images_${index}`}
           />
           <Image
            src="/img/arrowDown.png"
            alt="diminuir ver todas as imagens"
            width={30}
            height={30}
            className={`${styles.expand} ${styles.displayNone}`}
            onClick={() =>
             handleArrowClick(index, 'images', styles.displayNone)
            }
            id={`arrowDown_images_${index}`}
           />
          </div>
          <div
           className={`${styles.images} ${styles.displayNone}`}
           id={`item_images_${index}`}
          >
           {i.images.map((image) => {
            const imageUrl = URL.createObjectURL(image);
            return (
             <Image
              src={imageUrl}
              alt={i.imgDesc}
              width={80}
              height={85}
              key={imageUrl}
              className={styles.image}
             />
            );
           })}
          </div>
         </div>
        </div>
       );
      })}
      {error && <p className={styles.error}>{error}</p>}
      <button type="submit" className={styles.button} disabled={load}>
       Criar roupa
      </button>
     </form>
    </section>
   </main>
  </>
 );
}
