'use server';

import { cookies } from 'next/headers';

export async function deleteCookie(key: string) {
  cookies().delete({
    name: key,
    path: '/',
    domain: process.env.NEXT_PUBLIC_DOMAIN,
    maxAge: 0,
  })
}
