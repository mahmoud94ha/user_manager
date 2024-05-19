import axios from 'axios';
import { getName } from "country-list";

export async function getCountryInfo(ip: any) {
  try {
    const response = await axios.get(`https://api.country.is/${ip}`);
    if (response.status === 200) {
      const data = response.data;
      const country = data.country
      const countryName = await getName(country)
      return countryName ? countryName : country;
    }
  } catch (error) {
    console.error(error);
  }
  return null;
}
