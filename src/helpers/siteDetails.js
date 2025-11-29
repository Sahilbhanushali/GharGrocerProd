
export const getSiteDetails = () => {
  try {
    return JSON.parse(localStorage.getItem('siteDetails'));
  } catch (error) {
    console.error('Error parsing site details from localStorage:', error);
    return null;
  }
}


export const getSiteSetting = (settingName) => {
  const siteDetails = getSiteDetails();
  return siteDetails?.data?.find(item => item.name === settingName);
}


export const getContactInfo = () => {
  const contactUs = getSiteSetting('contact_us');
  return contactUs?.payload?.contact_us;
}