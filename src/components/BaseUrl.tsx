export const getBaseUrl = () => {
  const currentUrl = window.location.href;
  if (currentUrl.includes('localhost')) {
    return 'http://newcrmbackend.ddev.site:33000/api';
    // return 'http://10.255.254.61:8000/api';
    return 'http://newcrmbackend.ddev.site/api';
    return 'http://localhost:8001/api';
  } else if (currentUrl.includes('testcrm.leadshub.ae')) {
    return 'https://testcrmbackend.leadshub.ae/api';
  } else if (currentUrl.includes('leadshub.ae')) {
    return 'https://backend.leadshub.ae/api';
  } else if (currentUrl.includes('evernest.online')) {
      return 'https://backend.leadshub.ae/api';
  } else {
    return 'http://10.99.1.93:8000/api';
  }
};
