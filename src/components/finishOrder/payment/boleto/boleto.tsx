import { Dispatch, SetStateAction, useState } from 'react';
import Back from '../back/back';
import styles from './boleto.module.css';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { boleto } from '@/api/clothing/payOrderInterfaces';
import { regions } from '../../regionCode';
import { ValidateCnpj, ValidateCpf } from '../validateCpfCnpj';

interface props {
 showBoleto: boolean;
 setPaymentType: Dispatch<
  SetStateAction<
   'card' | 'credit_card' | 'debit_card' | 'pix' | 'boleto' | null
  >
 >;
 paymentType: 'card' | 'credit_card' | 'debit_card' | 'pix' | 'boleto' | null;
 setBoleto: Dispatch<boleto | null>;
 boleto: boleto | null;
 responseError: string | null;
}

const schema = z
 .object({
  email: z
   .string()
   .min(1, 'email inválido')
   .max(255, 'é permitido no máximo 255 caracteres')
   .regex(
    /^([a-zA-Z0-9.!#$%&'*+\/=?^_ {|}~-]{1,64}@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?){0,5})?$/,
    'email inválido',
   ),
  holder: z
   .string()
   .min(1, 'é necessário pelo menos 1 carácter')
   .max(30, 'é permitido no máximo 30 caracteres'),
  cpfCnpj: z
   .string()
   .min(11, 'cpf ou cnpj inválido')
   .max(14, 'cpf ou cnpj inválido'),
  dueDate: z.string(),
  instructionLine1: z
   .string()
   .min(2, 'é necessário pelo menos 2 caracteres')
   .max(75, 'é permitido no máximo 75 caracteres'),
  instructionLine2: z
   .string()
   .min(2, 'é necessário pelo menos 2 caracteres')
   .max(75, 'é permitido no máximo 75 caracteres'),
  street: z
   .string()
   .min(1, 'rua precisa ter pelo menos 1 carácter')
   .max(160, 'é permitido no máximo 160 caracteres'),
  residenceNumber: z
   .string()
   .min(1, 'número de residência precisa ter pelo menos 1 carácter')
   .max(8, 'é permitido no máximo 8 caracteres'),
  complement: z
   .string()
   .min(1, 'complemento precisa ter pelo menos 1 carácter')
   .max(40, 'é permitido no máximo 40 caracteres'),
  neighbordhood: z
   .string()
   .min(1, 'bairro precisa ter pelo menos 1 carácter')
   .max(60, 'é permitido no máximo 60 caracteres'),
  city: z
   .string()
   .min(1, 'cidade precisa ter pelo menos 1 carácter')
   .max(90, 'é permitido no máximo 90 caracteres'),
  regionCode: z.string(),
  cep: z.string().min(8, 'cep inválido').max(9, 'cep inválido'),
 })
 .refine(
  (fields) => {
   if (fields.dueDate == '') {
    return false;
   }
   const today = new Date();
   const date = new Date(fields.dueDate);
   const differenceInDays = Math.ceil(
    (date.getTime() - today.getTime()) / (1000 * 60 * 60 * 24),
   );
   if (differenceInDays >= 1 && differenceInDays <= 7) {
    return true;
   }
   return false;
  },
  {
   path: ['dueDate'],
   message: 'data de vencimento deve ser entre 1 dia e 1 semana',
  },
 )
 .refine(
  (fields) => {
   let cepNumber = fields.cep;
   if (fields.cep.includes('-')) {
    cepNumber = fields.cep.replace('-', '');
   }

   if (isNaN(Number(cepNumber))) {
    return false;
   }
   return true;
  },
  {
   path: ['cep'],
   message: 'cep inválido',
  },
 )
 .refine(
  (fields) => {
   if (fields.cpfCnpj.includes('.')) {
    fields.cpfCnpj = fields.cpfCnpj.replaceAll('.', '');
   }
   if (fields.cpfCnpj.includes('-')) {
    fields.cpfCnpj = fields.cpfCnpj.replaceAll('-', '');
   }
   if (fields.cpfCnpj.length == 11) {
    return ValidateCpf(fields.cpfCnpj);
   }
   if (fields.cpfCnpj.length == 14) {
    return ValidateCnpj(fields.cpfCnpj);
   }
  },
  {
   path: ['cpfCnpj'],
   message: 'cpf ou cnpj inválido',
  },
 );

type FormProps = z.infer<typeof schema>;

export default function Boleto({
 showBoleto,
 setPaymentType,
 paymentType,
 setBoleto,
 boleto,
 responseError,
}: props) {
 const [saved, setSaved] = useState<boolean>(false);

 const {
  register,
  handleSubmit,
  formState: { errors },
 } = useForm<FormProps>({
  mode: 'onBlur',
  reValidateMode: 'onBlur',
  resolver: zodResolver(schema),
 });

 function handleForm(data: FormProps) {
  const region = data.regionCode.substring(5);
  const regionCode = data.regionCode.slice(0, 2);
  if (data.cep.includes('-')) {
   data.cep = data.cep.replace('-', '');
  }
  if (/^\d{4}-\d{2}-\d{2}$/.test(data.dueDate)) {
   const [ano, mes, dia] = data.dueDate.split('-');
   data.dueDate = `${ano}-${mes}-${dia}`;
  }
  data.cpfCnpj = data.cpfCnpj.replaceAll('.', '').replaceAll('-', '');

  setBoleto({
   dataVencimento: data.dueDate,
   titularBoleto: {
    nome: data.holder,
    tax_id: data.cpfCnpj,
    email: data.email,
    endereco: {
     bairro: data.neighbordhood,
     cep: data.cep,
     cidade: data.city,
     codigoRegiao: regionCode,
     complemento: data.complement,
     numeroResidencia: data.residenceNumber,
     regiao: region,
     rua: data.street,
    },
   },
   linhasInstrucao: {
    linha_1: data.instructionLine1,
    linha_2: data.instructionLine2,
   },
  });
  setSaved(true);
 }

 return !saved ? (
  <form
   className={`${styles.form} ${!showBoleto && styles.displayNone}`}
   onSubmit={handleSubmit(handleForm)}
  >
   <Back
    handleBack={() => setPaymentType(null)}
    ariaLabel="Voltar para formas de pagamento"
   />
   <label className={styles.label} htmlFor="email">
    Email
   </label>
   <input {...register('email')} type="text" id="email" placeholder="email" />
   {errors.email && <p className={styles.error}>{errors.email.message}</p>}
   <label className={styles.label} htmlFor="name">
    Titular do boleto
   </label>
   <input
    {...register('holder')}
    type="text"
    id="name"
    placeholder="titular do boleto"
   />
   {errors.holder && <p className={styles.error}>{errors.holder.message}</p>}
   <label className={styles.label} htmlFor="cpfCnpj">
    Cpf ou cnpj
   </label>
   <input
    {...register('cpfCnpj')}
    type="text"
    id="cpfCnpj"
    placeholder="cpf ou cnpj"
   />
   {errors.cpfCnpj && <p className={styles.error}>{errors.cpfCnpj.message}</p>}
   <label className={styles.label} htmlFor="dueData">
    Data de vencimento
   </label>
   <input
    {...register('dueDate')}
    type="date"
    id="dueData"
    placeholder="data de vencimento do boleto"
   />
   {errors.dueDate && <p className={styles.error}>{errors.dueDate.message}</p>}
   <label className={styles.label} htmlFor="street2">
    Rua
   </label>
   <input
    {...register('street')}
    className={styles.input}
    placeholder="rua"
    type="text"
    id="street2"
   />
   {errors.street && <p className={styles.error}>{errors.street.message}</p>}
   <label className={styles.label} htmlFor="neighborhood2">
    Bairro
   </label>
   <input
    {...register('neighbordhood')}
    className={styles.input}
    placeholder="bairro"
    type="text"
    id="neighborhood2"
   />
   {errors.neighbordhood && (
    <p className={styles.error}>{errors.neighbordhood.message}</p>
   )}
   <label className={styles.label} htmlFor="city2">
    Cidade
   </label>
   <input
    {...register('city')}
    className={styles.input}
    placeholder="cidade"
    type="text"
    id="city2"
   />
   {errors.city && <p className={styles.error}>{errors.city.message}</p>}
   <label className={styles.label} htmlFor="complement2">
    Complemento
   </label>
   <input
    {...register('complement')}
    className={styles.input}
    placeholder="complemento"
    type="text"
    id="complement2"
   />
   {errors.complement && (
    <p className={styles.error}>{errors.complement.message}</p>
   )}
   <label className={styles.label} htmlFor="residenceNumber2">
    Número da residência
   </label>
   <input
    {...register('residenceNumber')}
    className={styles.input}
    placeholder="número de residência"
    type="number"
    id="residenceNumber2"
   />
   {errors.residenceNumber && (
    <p className={styles.error}>{errors.residenceNumber.message}</p>
   )}
   <label className={styles.label} htmlFor="cep3">
    Cep
   </label>
   <input
    {...register('cep')}
    className={styles.input}
    placeholder="cep"
    type="number"
    id="cep3"
   />
   {errors.cep && <p className={styles.error}>{errors.cep.message}</p>}
   <label className={styles.label} htmlFor="instructionLine1">
    Linha de instrução 1
   </label>
   <textarea
    {...register('instructionLine1')}
    placeholder="primeira linha de instrução do boleto"
    className={styles.textarea}
    id="instructionLine1"
    maxLength={75}
   ></textarea>
   {errors.instructionLine1 && (
    <p className={styles.error}>{errors.instructionLine1.message}</p>
   )}
   <label className={styles.label} htmlFor="instructionLine2">
    Linha de instrução 2
   </label>
   <textarea
    {...register('instructionLine2')}
    placeholder="segunda linha de instrução do boleto"
    className={styles.textarea}
    id="instructionLine2"
    maxLength={75}
   ></textarea>
   {errors.instructionLine2 && (
    <p className={styles.error}>{errors.instructionLine2.message}</p>
   )}
   <label className={styles.label} htmlFor="regionCode2">
    Código de região
   </label>
   <select id="regionCode2" {...register('regionCode')}>
    {Object.entries(regions).map(([estado, capital]) => (
     <option key={estado} value={`${estado} - ${capital}`}>
      {estado} - {capital}
     </option>
    ))}
   </select>
   <button
    style={{ marginRight: '15px' }}
    className={styles.button}
    type="submit"
    id="submit"
   >
    Salvar dados do boleto
   </button>
  </form>
 ) : (
  boleto && (
   <div
    style={{ display: 'grid' }}
    className={`${!showBoleto && styles.displayNone}`}
   >
    <div className={styles.values}>
     <p className={styles.field}>Email: </p>
     <p className={styles.value}>{boleto.titularBoleto.email}</p>
    </div>
    <div className={styles.values}>
     <p className={styles.field}>Titular do boleto: </p>
     <p className={styles.value}>{boleto.titularBoleto.nome}</p>
    </div>
    <div className={styles.values}>
     <p className={styles.field}>
      {boleto.titularBoleto.tax_id.length === 11 ? 'CPF: ' : 'CNPJ: '}
     </p>
     <p className={styles.value}>{boleto.titularBoleto.tax_id}</p>
    </div>
    <div className={styles.values}>
     <p className={styles.field}>Data de vencimento: </p>
     <p className={styles.value}>{boleto.dataVencimento}</p>
    </div>
    <div className={styles.values}>
     <p className={styles.field}>Linha de instrução 1: </p>
     <p className={styles.value}>{boleto.linhasInstrucao.linha_1}</p>
    </div>
    {boleto.linhasInstrucao.linha_2 && (
     <div className={styles.values}>
      <p className={styles.field}>Linha de instrução 2: </p>
      <p className={styles.value}>{boleto.linhasInstrucao.linha_2}</p>
     </div>
    )}
    <div className={styles.values}>
     <p className={styles.field}>Rua: </p>
     <p className={styles.value}>{boleto.titularBoleto.endereco.rua}</p>
    </div>
    <div className={styles.values}>
     <p className={styles.field}>Bairro: </p>
     <p className={styles.value}>{boleto.titularBoleto.endereco.bairro}</p>
    </div>
    <div className={styles.values}>
     <p className={styles.field}>Cidade: </p>
     <p className={styles.value}>{boleto.titularBoleto.endereco.cidade}</p>
    </div>
    <div className={styles.values}>
     <p className={styles.field}>Complemento: </p>
     <p className={styles.value}>{boleto.titularBoleto.endereco.complemento}</p>
    </div>
    <div className={styles.values}>
     <p className={styles.field}>Número de residência: </p>
     <p className={styles.value}>
      {boleto.titularBoleto.endereco.numeroResidencia}
     </p>
    </div>
    <div className={styles.values}>
     <p className={styles.field}>Cep: </p>
     <p className={styles.value}>{boleto.titularBoleto.endereco.cep}</p>
    </div>
    {paymentType == 'boleto' && responseError && (
     <p
      className={styles.error}
      style={{ marginLeft: '12px', wordBreak: 'break-all' }}
     >
      {responseError}
     </p>
    )}
    <button
     className={styles.button}
     onClick={() => {
      setSaved(false);
      setBoleto(null);
     }}
    >
     Editar dados do boleto
    </button>
   </div>
  )
 );
}
