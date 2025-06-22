import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}


export function convertToAscii(input:string){
  const asciiString=input.replace(/[^\x20-\x7E]/g, "");
  return asciiString;
}