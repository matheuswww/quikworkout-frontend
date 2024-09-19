import { SyntheticEvent } from 'react';

let prevVal: string = '';

export function handlePhoneNumber(event: SyntheticEvent): string {
 if (event.target instanceof HTMLInputElement) {
  const val = event.target.value
   .replaceAll(' ', '')
   .replaceAll('-', '')
   .replaceAll('(', '')
   .replaceAll(')', '');
  if (isNaN(Number(val)) || val == ' ') {
   event.target.value = prevVal;
   return prevVal;
  }
  if (event.target.value.length - prevVal.length > 1) {
   event.target.disabled = true;
   let start: number = 0;
   if (prevVal != '') {
    start = prevVal.length - 1;
   }
   let newVal = '';
   for (let i = start; i <= event.target.value.length; i++) {
    newVal += event.target.value.charAt(i);
    newVal = validateNumber(newVal);
   }
   event.target.disabled = false;
   return newVal;
  } else {
   const value = validateNumber(event.target.value);
   return value;
  }
 }
 return '';
}

function validateNumber(value: string): string {
 if (value.length >= 16) {
  value = prevVal;
  return value;
 }
 if (value.length >= 5 && value.charAt(4) != ' ') {
  value = prevVal;
  return value;
 }
 if (prevVal.includes('-') && value.split('-')[1] == '') {
  if (value.length > prevVal.length) {
   value = prevVal;
   return value;
  }
  value = value.slice(0, -1);
  prevVal = value;
  return value;
 }
 if (
  prevVal.includes('-') &&
  prevVal.split('-')[0].length != value.split('-')[0].length
 ) {
  value = prevVal;
  return value;
 }
 if(prevVal.includes(")") && !value.includes(")") && prevVal.length > 4) {
  value = prevVal;
   return value;
 }
 if (prevVal.length > value.length) {
 if(value.length == 5) {
    value = value.slice(0,-2)
    prevVal = value
    return value
  }
  if (value.length == 4) {
   value = value.slice(0, -1);
   prevVal = value;
   return value;
  }
  if (prevVal.includes('-') && !value.includes('-') && prevVal.length > 11) {
   value = prevVal;
   return value;
  }
  if (prevVal.includes(' ') && !value.includes(' ') && prevVal.length > 5) {
   value = prevVal;
   return value;
  }
  if (prevVal.includes(')') && !value.includes(')') && prevVal.length > 4) {
   value = prevVal;
   return value;
  }
  if (prevVal.includes('(') && !value.includes('(') && prevVal.length > 1) {
   value = prevVal;
   return value;
  }
  prevVal = value;
  return value;
 }
 const val = value.charAt(value.length - 1);
 if (isNaN(Number(val)) || val == ' ') {
  value = prevVal;
  return value;
 }
 if (value.charAt(0) != '(' && value.length != 1) {
  value = prevVal;
  return value;
 }
 if (prevVal.length == value.length) {
  prevVal = value;
  return value;
 }
 if (value.length == 1) {
  value = '(' + val;
 }
 if (value.length == 3) {
  value += ') ';
 }
 if (value.length == 4) {
  value = value.slice(0, -1);
  value += ') ' + val;
 }
 if (value.length == 5) {
  value = value.slice(0, -1);
  value += ' ';
 }
 if (value.length == 9) {
  value += '-';
 }
 if (value.length == 10 || (value.length == 11 && !value.includes('-'))) {
  value = value.slice(0, -1);
  value += '-';
 }
 if (value.length == 15) {
  const parts = value.split('-');
  if (parts[0].length == 10) {
   prevVal = value;
   return value;
  }
  parts[0] = parts[0] + parts[1].charAt(0);
  parts[1] = parts[1].slice(1);
  const newVal = parts[0] + '-' + parts[1];
  value = newVal;
 }
 prevVal = value;
 return value;
}
