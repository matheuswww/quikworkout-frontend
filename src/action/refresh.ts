'use server';
import { revalidatePath } from 'next/cache';

export async function refresh(url: string) {
 'use server';
 revalidatePath(url);
}
