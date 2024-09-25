import { z } from 'zod';
import styles from './clothing.module.css';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { inventario } from '@/api/manager/clothing/getClothing';
import { SyntheticEvent } from 'react';

const schema = z.object({
 cor: z
  .string()
  .min(1, 'é necessário pelo menos 1 caracter')
  .max(25, 'cor deve ter no maxímo 25 caracteres'),
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
});

type FormProps = z.infer<typeof schema>;

interface props {
 index: number;
 inventory: inventario;
 indexInventory: number;
 inventoryLength: number;
}

export default function Inventory({
 inventory,
 index,
 indexInventory,
 inventoryLength,
}: props) {
 const {
  register,
  formState: { errors },
 } = useForm<FormProps>({
  mode: 'onBlur',
  reValidateMode: 'onBlur',
  resolver: zodResolver(schema),
 });

 function handleCheckBoxInventory(
  itemIndex: number,
  index: number,
  lenght: number,
 ) {
  for (let i = 0; i < lenght; i++) {
   const mainColor = document.querySelector('#mainColor' + index + i);
   if (mainColor instanceof HTMLInputElement) {
    if (mainColor.checked) {
     mainColor.checked = false;
    }
   }
  }
  const mainColor = document.querySelector('#mainColor' + index + itemIndex);
  if (mainColor instanceof HTMLInputElement) {
   mainColor.checked = true;
  }
 }

 function handleChangeValue( 
  event: SyntheticEvent,
  itemIndex: number,
  index: number,
  val: string,) {
  const el = document.querySelector('#'+val + index + itemIndex)
  if (el instanceof HTMLInputElement && event.target instanceof HTMLInputElement) {
    el.value = event.target.value
  }
 }

 return (
  <div key={'inventory' + index + indexInventory} className={styles.inventory}>
   <div className={styles.checkbox}>
    <label htmlFor={'mainColor' + index + indexInventory}>Cor principal:</label>
    <input
     type="checkbox"
     id={'mainColor' + index + indexInventory}
     value={inventory.cor}
     onChange={() =>
      handleCheckBoxInventory(indexInventory, index, inventoryLength)
     }
    />
   </div>
   <label htmlFor={'color' + index + indexInventory}>Cor</label>
   <input
    type="text"
    id={'color' + index + indexInventory}
    defaultValue={inventory.cor}
    {...register('cor')}
     onChange={(e) => handleChangeValue(e, indexInventory, index, "color")}
   />
   {errors.cor?.message && <p className={styles.error}>{errors.cor.message}</p>}
   <label htmlFor={'P' + index + indexInventory}>P</label>
   <input
    type="number"
    defaultValue={inventory.p ? inventory.p : undefined}
    id={'P' + index + indexInventory}
    {...register('p')}
     onChange={(e) => handleChangeValue(e, indexInventory, index, "P")}
   />
   {errors.p?.message && <p className={styles.error}>{errors.p.message}</p>}
   <label htmlFor={'M' + index + indexInventory}>M</label>
   <input
    type="number"
    defaultValue={inventory.m ? inventory.m : undefined}
    id={'M' + index + indexInventory}
    {...register('m')}
     onChange={(e) => handleChangeValue(e, indexInventory, index, "M")}
   />
   {errors.m?.message && <p className={styles.error}>{errors.m.message}</p>}
   <label htmlFor={'G' + index + indexInventory}>G</label>
   <input
    type="number"
    defaultValue={inventory.g ? inventory.g : undefined}
    id={'G' + index + indexInventory}
    {...register('g')}
     onChange={(e) => handleChangeValue(e, indexInventory, index, "G")}
   />
   {errors.g?.message && <p className={styles.error}>{errors.g.message}</p>}
   <label htmlFor={'GG' + index + indexInventory}>GG</label>
   <input
    type="number"
    defaultValue={inventory.gg ? inventory.gg : undefined}
    {...register('gg')}
    id={'GG' + index + indexInventory}
     onChange={(e) => handleChangeValue(e, indexInventory, index, "GG")}
   />
   {errors.gg?.message && <p className={styles.error}>{errors.gg.message}</p>}
  </div>
 );
}
