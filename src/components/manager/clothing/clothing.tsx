import { clothing, getClothing } from '@/api/manager/clothing/getClothing';
import styles from './clothing.module.css';
import { Dispatch, SetStateAction, useEffect, useRef, useState } from 'react';
import SkeletonImage from '@/components/skeletonImage/skeletonImage';
import { slidesWithControll } from '@/funcs/slidesWithControll';
import Image from 'next/image';
import handleArrowClick from '@/funcs/handleArrowClick';
import { ChangeColor, ModalColor } from '@/components/modalColor/modalColor';
import handleModalClick from '@/funcs/handleModalClick';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import DeleteClothing from '@/api/manager/clothing/deleteClothing';
import { useRouter } from 'next/navigation';
import { deleteCookie } from '@/action/deleteCookie';
import UpdateClothing, {
 updateClothingParams,
} from '@/api/manager/clothing/updateClothing';
import UpdateClothingInventory, {
 updateClothingInventoryParams,
 updateInventory,
} from '@/api/manager/clothing/updateClothingInventory';
import Inventory from './inventory';
import { refresh } from '@/action/refresh';
import Delete from 'next/image';

interface props {
 data: clothing;
 index: number;
 setLoad: Dispatch<boolean>;
 setPopupError: Dispatch<boolean>;
 setSuccess: Dispatch<boolean>;
 load: boolean;
 success: boolean;
 cookieName?: string;
 cookieVal?: string;
 setData: Dispatch<SetStateAction<getClothing | null>>;
 allData: clothing[] | null;
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

export default function Clothing({
 data,
 index,
 cookieName,
 cookieVal,
 setLoad,
 setPopupError,
 success,
 load,
 setSuccess,
 setData,
 allData,
}: props) {
 const router = useRouter();
 const [color, setColor] = useState<string | null>(null);
 const [mainColor, setMainColor] = useState<string | null>(null);
 const [responseError, setResponseError] = useState<string | null>(null);
 const [colorChanged, setColorChanged] = useState<boolean>(false);
 const slide = useRef<HTMLUListElement | null>(null);
 const images = useRef<HTMLDivElement | null>(null);
 const modalColorRef = useRef<HTMLDivElement | null>(null);
 const buttonToOpenModalColorRef = useRef<HTMLButtonElement | null>(null);
 const modalDeleteClothingRef = useRef<HTMLDivElement | null>(null);
 const buttonToOpenModalDeleteClothingRef = useRef<HTMLButtonElement | null>(
  null,
 );
 const closeModalDeleteClothingRef = useRef<HTMLButtonElement | null>(null);
 const formRef = useRef<HTMLFormElement | null>(null);
 const {
  register,
  handleSubmit,
  formState: { errors },
 } = useForm<FormProps>({
  mode: 'onSubmit',
  reValidateMode: 'onSubmit',
  resolver: zodResolver(schema),
 });

 useEffect(() => {
  if (
   slide.current instanceof HTMLUListElement &&
   images.current instanceof HTMLDivElement
  ) {
   if (images.current.lastChild instanceof HTMLDivElement) {
    images.current.removeChild(images.current.lastChild);
   }
   slidesWithControll(
    slide.current,
    images.current,
    undefined,
    styles.index,
    styles.active,
    styles.activeThumb,
   );
  }
 }, [color]);

 useEffect(() => {
  data.inventario.map(({ corPrincipal, cor }) => {
   if (corPrincipal) {
    setColor(cor);
    setMainColor(cor);
   }
  });
  setColorChanged(false);
 }, [colorChanged]);

 function handleCheckBoxGender(val: string, index: number) {
  const m = document.querySelector('#M' + index);
  const f = document.querySelector('#F' + index);
  const unisex = document.querySelector('#UNISEX' + index);

  if (
   m instanceof HTMLInputElement &&
   f instanceof HTMLInputElement &&
   unisex instanceof HTMLInputElement
  ) {
   if ('M' != val && m.checked) {
    m.checked = false;
   }
   if ('F' != val && f.checked) {
    f.checked = false;
   }
   if ('UNISEX' != val && unisex.checked) {
    unisex.checked = false;
   }
   if (val == 'M') {
    m.checked = true;
   }
   if (val == 'F') {
    f.checked = true;
   }
   if (val == 'UNISEX') {
    unisex.checked = true;
   }
  }
 }

 function handleLoad() {
  const checkedSex = document.querySelector('#' + data.sexo + index);
  if (checkedSex instanceof HTMLInputElement) {
   checkedSex.checked = true;
  }
  data.inventario.forEach(({ corPrincipal }, indexInventory) => {
   if (corPrincipal) {
    const checkedInventory = document.querySelector(
     '#mainColor' + index + indexInventory,
    );
    if (checkedInventory instanceof HTMLInputElement) {
     checkedInventory.checked = true;
    }
   }
  });
  const active = document.querySelector('#active' + index);
  if (active instanceof HTMLInputElement) {
   active.checked = data.ativo;
  }
 }

 async function handleDeleteClothing() {
  setResponseError(null);
  setPopupError(false);
  setLoad(true);
  if (cookieName == undefined || cookieVal == undefined) {
   router.push('/manager-quikworkout/auth');
   return;
  }
  const cookie = cookieName + '=' + cookieVal;
  const res = await DeleteClothing(cookie, {
   id: data.id,
  });

  if (res == 401) {
   await deleteCookie(cookieName);
   router.push('/manager-quikworkout/auth');
   return;
  }
  if (res == 500) {
   setPopupError(true);
   setLoad(false);
   return;
  }
  if (closeModalDeleteClothingRef.current instanceof HTMLButtonElement) {
   closeModalDeleteClothingRef.current.click();
  }
  if (res == 200) {
   const newAllData = allData?.filter((_, i) => {
    if (i == index) {
     return false;
    }
    return true;
   });
   if (newAllData && newAllData?.length >= 1) {
    setData({
     clothing: newAllData,
     status: 200,
    });
   } else {
    setData({
     clothing: null,
     status: 404,
    });
   }
   await refresh('/');
   await refresh('/manager-quikworkout/roupas');
   setSuccess(true);
   setLoad(false);
   return;
  }
  window.location.reload();
 }

 async function handleForm(dataForm: FormProps, index: number) {
  if (cookieName == undefined || cookieVal == undefined) {
   router.push('/manager-quikworkout/auth');
   return;
  }
  setResponseError(null);
  setPopupError(false);
  const cookie = cookieName + '=' + cookieVal;
  if (formRef.current instanceof HTMLFormElement) {
   const err = formRef.current.querySelectorAll('#error');
   if (err.length > 0) {
    return;
   }
   const m = formRef.current.querySelector('#M' + index);
   const f = formRef.current.querySelector('#F' + index);
   const unisex = formRef.current.querySelector('#UNISEX' + index);
   let sex: string = '';
   if (m instanceof HTMLInputElement && m.checked) {
    sex = 'M';
   }
   if (f instanceof HTMLInputElement && f.checked) {
    sex = 'F';
   }
   if (unisex instanceof HTMLInputElement && unisex.checked) {
    sex = 'UNISEX';
   }
   const active = formRef.current.querySelector('#active' + index);
   let updateClothing: boolean = false;
   const updateClothingParams: updateClothingParams = {
    id: data.id,
   };
   if (data.nome != dataForm.nome) {
    updateClothingParams.nome = dataForm.nome;
   }
   if (data.descricao != dataForm.descricao) {
    updateClothingParams.descricao = dataForm.descricao;
   }
   if (data.categoria != dataForm.categoria) {
    updateClothingParams.categoria = dataForm.categoria;
   }
   if (data.material != dataForm.material) {
    updateClothingParams.material = dataForm.material;
   }
   let number: number = 0;
   if (dataForm.preco.includes(',')) {
    dataForm.preco = dataForm.preco.replace(',', '.');
   }
   number = Number(dataForm.preco);
   if (data.preco != number) {
    updateClothingParams.preco = Number(dataForm.preco);
   }
   if (data.sexo != sex) {
    updateClothingParams.sexo = sex;
   }
   if (active instanceof HTMLInputElement && active.checked != data.ativo) {
    updateClothingParams.active = active.checked;
   }

   if (Object.keys(updateClothingParams).length > 1) {
    updateClothing = true;
   }

   let mainInventory: number = 0;
   let prevMainInventory: number = 0;
   data.inventario.forEach(({ ...inventory }, indexInventory) => {
    const mainColor = document.querySelector(
     '#mainColor' + index + indexInventory,
    );
    if (mainColor instanceof HTMLInputElement) {
     if (mainColor.checked) {
      mainInventory = indexInventory;
     }
     if (inventory.corPrincipal) {
      prevMainInventory = indexInventory;
     }
    }
   });

   let newColors: Array<string> | undefined;
   let updateClothingInventory: boolean = false;
   const updateClothingInventoryParams: Array<updateInventory> = [];
   const changedInventory: Array<number> = [];
   const seenColors = new Set();
   let error: boolean = false;
   let haveNewColor: boolean = false;
   data.inventario.forEach(({ ...inventory }, indexInventory) => {
    if (error) {
     return;
    }
    const mainColor = document.querySelector(
     '#mainColor' + index + indexInventory,
    );
    const color = document.querySelector('#color' + index + indexInventory);
    const p = document.querySelector('#P' + index + indexInventory);
    const m = document.querySelector('#M' + index + indexInventory);
    const g = document.querySelector('#G' + index + indexInventory);
    const gg = document.querySelector('#GG' + index + indexInventory);

    if (color instanceof HTMLInputElement) {
     if (seenColors.has(color.value)) {
      setResponseError('as cores em um inventário devem ter nomes diferentes');
      error = true;
      return;
     }
     seenColors.add(color.value);
     seenColors.add(inventory.cor);
    }
    if (
     mainColor instanceof HTMLInputElement &&
     color instanceof HTMLInputElement &&
     p instanceof HTMLInputElement &&
     m instanceof HTMLInputElement &&
     g instanceof HTMLInputElement &&
     gg instanceof HTMLInputElement
    ) {
     if (
      Number(p.value) == inventory.p &&
      Number(m.value) == inventory.m &&
      Number(g.value) == inventory.g &&
      Number(gg.value) == inventory.gg &&
      color.value == inventory.cor &&
      prevMainInventory == mainInventory
     ) {
      return;
     }
     updateClothingInventory = true;
     updateClothingInventoryParams.push({
      cor: inventory.cor,
      corPrincipal: mainColor.checked,
      p: Number(p.value) - inventory.p,
      m: Number(m.value) - inventory.m,
      g: Number(g.value) - inventory.g,
      gg: Number(gg.value) - inventory.gg,
      imgDesc: '',
     });
     changedInventory.push(indexInventory);
     if (newColors == undefined) {
      newColors = [];
     }
     if (color.value != inventory.cor) {
      haveNewColor = true;
      newColors.push(color.value);
     } else {
      newColors.push('');
     }
    }
   });
   if (error) {
    return;
   }
   if (!haveNewColor) {
    newColors = undefined;
   }
   if (responseError) {
    return;
   }
   if (updateClothing && !updateClothingInventory) {
    handleUpdateClothing(cookie, updateClothingParams);
   }
   if (updateClothingInventory && !updateClothing) {
    handleUpdateClothingInventory(
     cookie,
     {
      id: data.id,
      atualizarInventario: updateClothingInventoryParams.map((i) => {
       return JSON.stringify(i);
      }),
      novoNomeCor: newColors,
     },
     updateClothingInventoryParams,
     changedInventory,
    );
   }
   if (updateClothing && updateClothingInventory) {
    handleUpdateClothing(cookie, updateClothingParams);
    handleUpdateClothingInventory(
     cookie,
     {
      id: data.id,
      atualizarInventario: updateClothingInventoryParams.map((i) => {
       return JSON.stringify(i);
      }),
      novoNomeCor: newColors,
     },
     updateClothingInventoryParams,
     changedInventory,
    );
   }
  }
 }

 async function handleUpdateClothing(
  cookie: string,
  updateClothing: updateClothingParams,
 ) {
  setLoad(true);
  const res = await UpdateClothing(cookie, updateClothing);
  if (res == 401) {
   router.push('/manager-quikworkout/auth');
   return;
  }
  if (res == 500) {
   setPopupError(true);
  }
  if (res == 404) {
   window.location.reload();
   return;
  }
  if (res == 200) {
   await refresh('/');
   await refresh('/manager-quikworkout/roupas');
   setSuccess(true);
   const newData = data;
   const newAllData = allData;
   if (updateClothing.active != undefined) {
    newData.ativo = updateClothing.active;
   }
   if (updateClothing.categoria) {
    newData.categoria = updateClothing.categoria;
   }
   if (updateClothing.descricao) {
    newData.descricao = updateClothing.descricao;
   }
   if (updateClothing.material) {
    newData.material = updateClothing.material;
   }
   if (updateClothing.nome) {
    newData.nome = updateClothing.nome;
   }
   if (updateClothing.preco) {
    newData.preco = updateClothing.preco;
   }
   if (updateClothing.sexo) {
    newData.sexo = updateClothing.sexo;
   }
   newAllData && (newAllData[index] = newData);
   setData({
    clothing: newAllData,
    status: 200,
   });
  }
  setLoad(false);
 }

 async function handleUpdateClothingInventory(
  cookie: string,
  updateClothingInventoryParam: updateClothingInventoryParams,
  updateClothingInventory: Array<updateInventory>,
  changedInventory: Array<number>,
 ) {
  setLoad(true);

  const res = await UpdateClothingInventory(
   cookie,
   updateClothingInventoryParam,
  );
  if (res == 401) {
   router.push('/manager-quikworkout/auth');
   return;
  }
  if (res == 500) {
   setPopupError(true);
  }
  if (res == 404) {
   window.location.reload();
   return;
  }
  if (res == 200) {
   await refresh('/');
   await refresh('/manager-quikworkout/roupas');
   const newDataInventory = data;
   const newAllData = allData;
   changedInventory.map((indexInventory, indexUpdateInventory) => {
    if (
     updateClothingInventoryParam.novoNomeCor &&
     updateClothingInventoryParam.novoNomeCor[indexUpdateInventory]
    ) {
     setColorChanged(true);
     newDataInventory.inventario[indexInventory].cor =
      updateClothingInventoryParam.novoNomeCor[indexUpdateInventory];
    }
    if (
     updateClothingInventory[indexUpdateInventory].p !=
     data.inventario[indexInventory].p
    ) {
     newDataInventory.inventario[indexInventory].p =
      data.inventario[indexInventory].p +
      updateClothingInventory[indexUpdateInventory].p;
    }
    if (
     updateClothingInventory[indexUpdateInventory].m !=
     data.inventario[indexInventory].m
    ) {
     newDataInventory.inventario[indexInventory].m =
      data.inventario[indexInventory].m +
      updateClothingInventory[indexUpdateInventory].m;
    }
    if (
     updateClothingInventory[indexUpdateInventory].g !=
     data.inventario[indexInventory].g
    ) {
     newDataInventory.inventario[indexInventory].g =
      data.inventario[indexInventory].g +
      updateClothingInventory[indexUpdateInventory].g;
    }
    if (
     updateClothingInventory[indexUpdateInventory].gg !=
     data.inventario[indexInventory].gg
    ) {
     newDataInventory.inventario[indexInventory].gg =
      data.inventario[indexInventory].gg +
      updateClothingInventory[indexUpdateInventory].gg;
    }
    newDataInventory.inventario[indexInventory].corPrincipal =
     updateClothingInventory[indexUpdateInventory].corPrincipal;
   });

   newAllData && (newAllData[index] = newDataInventory);
   setData({
    clothing: newAllData,
    status: 200,
   });
   setSuccess(true);
  }
  setLoad(false);
 }

 return (
  <>
   <ModalColor
    inventario={data.inventario.map(({ ...infos }) => {
     return {
      cor: infos.cor,
      corPrincipal: infos.corPrincipal,
      p: infos.p,
      m: infos.m,
      g: infos.g,
      gg: infos.gg,
      images: infos.imagens,
      imgDesc: infos.imgDesc,
     };
    })}
    mainColor={mainColor}
    modalRef={modalColorRef}
    setColor={setColor}
   />
   <div
    className={styles.deleteClothing}
    ref={modalDeleteClothingRef}
    tabIndex={0}
   >
    <p>Tem certeza que deseja deletar esta roupa?</p>
    <button
     className={`${styles.button} ${styles.deleteButton}`}
     onClick={handleDeleteClothing}
    >
     deletar
    </button>
    <button
     aria-label="fechar"
     type="button"
     className={`${styles.close} ${styles.button}`}
     ref={closeModalDeleteClothingRef}
    >
     <span aria-hidden="true">x</span>
    </button>
   </div>
   <form
    className={styles.form}
    onLoad={handleLoad}
    onSubmit={handleSubmit((data: FormProps) => handleForm(data, index))}
    ref={formRef}
   >
    <div
     className={styles.images}
     ref={images}
     style={{ display: data ? 'initial' : 'none' }}
    >
     <ul
      className={styles.slide}
      ref={slide}
      aria-label="slide que mostra a imagem de cada roupa"
      tabIndex={0}
     >
      {data.inventario.map(({ imagens, alt, cor }) => {
       return (
        color == cor &&
        imagens &&
        imagens[0] && (
         <li className={styles.product} key={imagens[0]}>
          {
           <SkeletonImage
            src={imagens[0]}
            alt={alt}
            loading="lazy"
            width={290}
            height={460}
            className={styles.clothing}
            key={data.id}
            id={index.toString()}
            draggable={false}
            tabIndex={0}
           />
          }
         </li>
        )
       );
      })}
     </ul>
    </div>
    <div className={styles.show}>
     <button
      className={styles.buttonExpand}
      type="button"
      onClick={() => handleArrowClick(index, 'clothing', styles.displayNone)}
     >
      Ver dados da roupa
     </button>
     <Image
      src="/img/arrowUp.png"
      alt={`expandir ver dados da roupa ${index}`}
      width={30}
      height={30}
      className={`${styles.expand}`}
      onClick={() => handleArrowClick(index, 'clothing', styles.displayNone)}
      id={`arrowUp_clothing_${index}`}
     />
     <Image
      src="/img/arrowDown.png"
      alt={`diminuir ver dados da roupa ${index}`}
      width={30}
      height={30}
      className={`${styles.expand} ${styles.displayNone}`}
      onClick={() => handleArrowClick(index, 'clothing', styles.displayNone)}
      id={`arrowDown_clothing_${index}`}
     />
    </div>
    <div
     className={`${styles.clothing} ${styles.displayNone}`}
     id={`item_clothing_` + index}
    >
     <p className={styles.p}>Cores:</p>
     <ChangeColor
      buttonToOpenModalRef={buttonToOpenModalColorRef}
      color={color}
      modalRef={modalColorRef}
     />
     <label htmlFor={'name' + index}>Nome:</label>
     <input
      type="text"
      defaultValue={data.nome}
      id={'name' + index}
      {...register('nome')}
     />
     {errors.nome?.message && (
      <p className={styles.error}>{errors.nome.message}</p>
     )}
     <label htmlFor={'description' + index}>Descrição:</label>
     <input
      type="text"
      defaultValue={data.descricao}
      id={'description' + index}
      {...register('descricao')}
     />
     {errors.descricao?.message && (
      <p className={styles.error}>{errors.descricao.message}</p>
     )}
     <label htmlFor={'category' + index}>Categoria:</label>
     <input
      type="text"
      defaultValue={data.categoria}
      id={'category' + index}
      {...register('categoria')}
     />
     {errors.categoria?.message && (
      <p className={styles.error}>{errors.categoria.message}</p>
     )}
     <label htmlFor={'material' + index}>Material:</label>
     <input
      type="text"
      defaultValue={data.material}
      id={'material' + index}
      {...register('material')}
     />
     {errors.material?.message && (
      <p className={styles.error}>{errors.material.message}</p>
     )}
     <label htmlFor={'price' + index}>Preço:</label>
     <input
      type="text"
      defaultValue={data.preco}
      id={'price' + index}
      {...register('preco')}
     />
     {errors.preco?.message && (
      <p className={styles.error}>{errors.preco.message}</p>
     )}
     <div className={styles.checkbox}>
      <label>Sexo:</label>
      <label htmlFor={'M' + index}>M</label>
      <input
       type="checkbox"
       id={'M' + index}
       value={'M'}
       onChange={() => handleCheckBoxGender('M', index)}
      />
      <label htmlFor={'F' + index}>F</label>
      <input
       type="checkbox"
       id={'F' + index}
       value={'F'}
       onChange={() => handleCheckBoxGender('F', index)}
      />
      <label htmlFor={'UNISEX' + index}>UNISEX</label>
      <input
       type="checkbox"
       id={'UNISEX' + index}
       value={'UNISEX'}
       onChange={() => handleCheckBoxGender('UNISEX', index)}
      />
     </div>
     <div className={styles.checkbox}>
      <label htmlFor={`active${index}`}>Ativo:</label>
      <input type="checkbox" id={`active${index}`} />
     </div>
     <div className={styles.show}>
      <button
       className={styles.buttonExpand}
       type="button"
       onClick={() => handleArrowClick(index, 'inventory', styles.displayNone)}
      >
       Ver inventário(s) da roupa
      </button>
      <Image
       src="/img/arrowUp.png"
       alt={`expandir ver inventários da roupa ${index}`}
       width={30}
       height={30}
       className={`${styles.expand}`}
       onClick={() => handleArrowClick(index, 'inventory', styles.displayNone)}
       id={`arrowUp_inventory_${index}`}
      />
      <Image
       src="/img/arrowDown.png"
       alt={`diminuir ver inventários da roupa ${index}`}
       width={30}
       height={30}
       className={`${styles.expand} ${styles.displayNone}`}
       onClick={() => handleArrowClick(index, 'inventory', styles.displayNone)}
       id={`arrowDown_inventory_${index}`}
      />
     </div>
     <div
      className={`${styles.displayNone} ${styles.item}`}
      id={`item_inventory_` + index}
     >
      {data.inventario.map((inventory, indexInventory) => {
       return (
        <Inventory
         index={index}
         indexInventory={indexInventory}
         inventory={inventory}
         inventoryLength={data.inventario.length}
         key={index + indexInventory}
        />
       );
      })}
     </div>
     {responseError && <p className={styles.error}>{responseError}</p>}
     <button
      type="submit"
      disabled={load || success}
      className={`${styles.button} ${styles.submit} ${success && styles.buttonOpacity}`}
     >
      Salvar
     </button>
    </div>
    <button
     aria-label="fechar"
     type="button"
     disabled={load || success}
     className={`${styles.close} ${styles.button} ${success && styles.buttonOpacity}`}
     ref={buttonToOpenModalDeleteClothingRef}
     onClick={() =>
      handleModalClick(
       modalDeleteClothingRef,
       buttonToOpenModalDeleteClothingRef,
       closeModalDeleteClothingRef,
       styles.active,
       'block',
      )
     }
    >
     <Delete
      src="/img/close.png"
      width={18}
      height={20}
      alt="deletar produto do carrinho"
     />
    </button>
   </form>
  </>
 );
}
