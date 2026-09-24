import CryptoJS from 'crypto-js';

export const calculateMD5 = (content: string): string => {
  return CryptoJS.MD5(content).toString();
};

export const calculateSHA1 = (content: string): string => {
  return CryptoJS.SHA1(content).toString();
};

export const calculateSHA256 = (content: string): string => {
  return CryptoJS.SHA256(content).toString();
};

export const calculateHashes = (content: string) => {
  return {
    md5: calculateMD5(content),
    sha1: calculateSHA1(content),
    sha256: calculateSHA256(content),
  };
};

export const generateId = (): string => {
  return CryptoJS.SHA256(Date.now().toString() + Math.random().toString()).toString().substring(0, 16);
};
