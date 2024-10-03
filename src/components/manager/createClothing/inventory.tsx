'use client';

import styles from './createClothing.module.css';
import {
 Dispatch,
 MutableRefObject,
 SetStateAction,
 useEffect,
 useState,
} from 'react';
import { inventory } from './createClothing';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

interface props {
 setInventory: Dispatch<SetStateAction<inventory[] | null>>;
 inventory: inventory[] | null;
 modalRef: MutableRefObject<HTMLFormElement | null>;
 closeRef: MutableRefObject<HTMLButtonElement | null>;
 setReset: Dispatch<SetStateAction<boolean>>;
 resetForm: boolean;
}

const schema = z.object({
 cor: z
  .string()
  .min(1, 'é necessário pelo menos 1 caracter')
  .max(15, 'cor deve ter no maxímo 15 caracteres'),
 imgDesc: z
  .string()
  .min(1, 'é necessário pelo menos 1 caracter')
  .max(60, 'descricação da imagem deve ter no maxímo 60 caracteres'),
 p: z.string().refine((val) => !(Number(val) < 0) && !isNaN(Number(val)), {
  message: 'valor inválido',
 }),
 m: z.string().refine((val) => !(Number(val) < 0) && !isNaN(Number(val)), {
  message: 'valor inválido',
 }),
 g: z.string().refine((val) => !(Number(val) < 0) && !isNaN(Number(val)), {
  message: 'valor inválido',
 }),
 gg: z.string().refine((val) => !(Number(val) < 0) && !isNaN(Number(val)), {
  message: 'valor inválido',
 }),
 file: z
  .any()
  .refine((files) => (files.length == 0 ? false : true), {
   message: 'é necessário pelo menos 1 arquivo',
  })
  .refine(
   (files: File[]) => {
    const val = Array.from(files).map((file) => {
     if (file.size > 1024 * 1024 * 2) {
      return false;
     }
     return true;
    });
    if (val.includes(false)) {
     return false;
    }
    return true;
   },
   {
    message: 'cada arquivo deve ter no maxímo 2MB',
   },
  )
  .refine(
   (files) =>
    files[0]?.type != 'image/jpg' &&
    files[0]?.type != 'image/jpeg' &&
    files[0]?.type != 'image/png'
     ? false
     : true,
   {
    message: 'é permitido somente arquivos png,jpg ou jpeg',
   },
  )
  .refine((files) => (files.length > 5 ? false : true), {
   message: 'é permitido no maxímo 5 imagens',
  }),
});

type FormProps = z.infer<typeof schema>;

export default function Inventory({
 setInventory,
 inventory,
 closeRef,
 modalRef,
 setReset,
 resetForm,
}: props) {
 const {
  register,
  handleSubmit,
  reset,
  formState: { errors },
 } = useForm<FormProps>({
  mode: 'onSubmit',
  reValidateMode: 'onSubmit',
  resolver: zodResolver(schema),
 });
 const [error, setError] = useState<string | null>(null);

 function handleForm(data: FormProps) {
  setError(null)
  const seenColors = new Set();
  let error: boolean = false;
  seenColors.add(data.cor);
  inventory?.map((i) => {
   if (seenColors.has(i.cor)) {
    setError('as cores em um inventário devem ter nomes diferentes');
    error = true;
   }
   seenColors.add(i.cor);
  });
  if (error) {
   return;
  }
  const p = Number(data.p);
  const m = Number(data.m);
  const g = Number(data.g);
  const gg = Number(data.gg);
  const images: Blob[] = Array.from(data.file);
  images.reverse();

  let err = false;
  const newImages = images.map((i, index) => {
   let fileType = null;
   if (i.type == 'image/png') {
    fileType = '.png';
   }
   if (i.type == 'image/jpeg') {
    fileType = '.jpeg';
   }
   if (i.type == 'image/jpg') {
    fileType = '.jpg';
   }
   if (fileType == null) {
    setError('é permitido somente arquivos png,jpeg ou jpg');
    err = true;
   }
   const newFileName = data.cor + index + fileType;
   return new File([i], newFileName, { type: i.type });
  });
  console.log(newImages);
  if (err) {
   return;
  }
  const newInventory: inventory = {
   cor: data.cor,
   p: p,
   m: m,
   g: g,
   gg: gg,
   images: newImages,
   imgDesc: data.imgDesc,
  };
  setInventory((inventory) =>
   inventory ? [...inventory, newInventory] : [newInventory],
  );
  if (modalRef.current instanceof HTMLFormElement) {
   const inputs = modalRef.current.querySelectorAll('input');
   inputs.forEach((input) => {
    input.value = '';
   });
   if (closeRef.current instanceof HTMLButtonElement) {
    closeRef.current.click();
   }
  }
 }

 useEffect(() => {
  if (resetForm) {
   reset();
   setReset(false);
  }
 }, [resetForm]);

 return (
  <>
   <form
    className={styles.inventory}
    tabIndex={0}
    onSubmit={handleSubmit(handleForm)}
    ref={modalRef}
   >
    <label htmlFor="color">Cor</label>
    <input {...register('cor')} id="color" placeholder="cor" />
    {errors.cor?.message && (
     <p className={styles.error}>{errors.cor.message}</p>
    )}
    <label htmlFor="imgDescription">Descrição</label>
    <input
     {...register('imgDesc')}
     id="imgDescription"
     placeholder="descrição da imagem"
    />
    {errors.imgDesc?.message && (
     <p className={styles.error}>{errors.imgDesc.message}</p>
    )}
    <label htmlFor="p">Quantidade de P</label>
    <input
     {...register('p')}
     id="p"
     className={styles.counter}
     type="number"
     placeholder="p"
    />
    {errors.p?.message && <p className={styles.error}>{errors.p.message}</p>}
    <label htmlFor="m">Quantidade de M</label>
    <input
     {...register('m')}
     id="m"
     className={styles.counter}
     type="number"
     placeholder="m"
    />
    {errors.m?.message && <p className={styles.error}>{errors.m.message}</p>}
    <label htmlFor="g">Quantidade de G</label>
    <input
     {...register('g')}
     id="g"
     className={styles.counter}
     type="number"
     placeholder="g"
    />
    {errors.g?.message && <p className={styles.error}>{errors.g.message}</p>}
    <label htmlFor="gg">Quantidade de GG</label>
    <input
     {...register('gg')}
     id="gg"
     className={styles.counter}
     type="number"
     placeholder="gg"
    />
    {errors.gg?.message && <p className={styles.error}>{errors.gg.message}</p>}
    <label htmlFor="imgFile">Imagens</label>
    <input {...register('file')} id="imgFile" type="file" multiple />
    {errors.file?.message && typeof errors.file.message == 'string' && (
     <p className={styles.error}>{errors.file.message}</p>
    )}
    {error && <p className={styles.error}>{error}</p>}
    <button
     type="submit"
     className={`${styles.button} ${styles.saveInventoryButton}`}
    >
     Salvar inventário
    </button>
    <button type="button" className={`${styles.close}`} ref={closeRef}>
     <span aria-hidden="true">x</span>
    </button>
   </form>
  </>
 );
}
