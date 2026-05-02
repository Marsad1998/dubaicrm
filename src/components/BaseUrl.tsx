export const getBaseUrl = () => {
  const currentUrl = window.location.href;
  if (currentUrl.includes('localhost')) {
    return 'http://localhost:8000/api';
  } else if (currentUrl.includes('business.sandbox.pk')) {
    return 'https://business.sandbox.pk/api';
  } else {
    return 'http://10.99.1.93:8000/api';
  }
};
