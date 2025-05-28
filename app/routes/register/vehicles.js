// app/routes/register/vehicles.js
import Route from '@ember/routing/route';

export default class RegisterVehiclesRoute extends Route {
  async model() {
    try {
      const response = await fetch('http://localhost:8080/fasttag/vehicles');
      const data = await response.json();

      if (response.ok) {
        return data; 
      } else {
        console.error('Failed to fetch vehicles:', data.error);
        return [];
      }
    } catch (error) {
      console.error('Error fetching vehicles:', error);
      // Return an empty array or handle error state
      return [];
    }
  }
}