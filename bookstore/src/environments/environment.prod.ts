export const environment = {
  production: true,
  apiUrl:
    (typeof process !== 'undefined' && process.env?.['API_URL']) ||
    (typeof window !== 'undefined' && (window as any)['API_URL']) ||
    'http://localhost:8080/api/v1'
};
