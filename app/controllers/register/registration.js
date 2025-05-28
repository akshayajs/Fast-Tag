// app/controllers/register/registration.js
import Controller from '@ember/controller';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';

export default class RegisterRegistrationController extends Controller {
  @tracked vehicleNumber = '';
  @tracked vehicleType = '';
  @tracked ownerName = '';
  @tracked responseMessage = '';

  @action
  updateVehicleNumber(event) {
    this.vehicleNumber = event.target.value;
  }

  @action
  updateVehicleType(event) {
    this.vehicleType = event.target.value;
  }

  @action
  updateOwnerName(event) {
    this.ownerName = event.target.value;
  }

  @action
  async submitForm(event) {
    event.preventDefault(); // Stop the browser's default form submission

    this.responseMessage = ''; // Clear previous messages

    // Basic client-side validation (matching Scala servlet's patterns)
    if (!this.vehicleNumber || !/^(?=.*[A-Z])(?=.*[0-9])[A-Z0-9]+$/.test(this.vehicleNumber.trim().toUpperCase())) {
      this.responseMessage = 'Vehicle number must contain both alphabets (A-Z) and numbers (0-9).';
      return;
    }
    if (!this.vehicleType) {
      this.responseMessage = 'Please select a vehicle type.';
      return;
    }
    if (!this.ownerName || !/^[A-Za-z ]+$/.test(this.ownerName.trim())) {
      this.responseMessage = 'Owner name must contain only alphabets and spaces.';
      return;
    }

    const params = new URLSearchParams();
    params.append('vehicleNumber', this.vehicleNumber);
    params.append('vehicleType', this.vehicleType);
    params.append('ownerName', this.ownerName);

    try {
      // Use the base /fasttag path for registration as per your servlet's doPost logic
      const response = await fetch('http://localhost:8080/fasttag', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          // No need for 'Access-Control-Allow-Origin' here, it's a server-side header.
        },
        body: params.toString(),
      });

      const data = await response.json();

      if (response.ok) {
        this.responseMessage = data.message || 'Vehicle registered successfully!';
        // Optionally clear the form upon success
        this.vehicleNumber = '';
        this.vehicleType = '';
        this.ownerName = '';
      } else {
        // Handle specific error messages from the servlet
        if (data.errorType === "alreadyRegisteredSameData") {
          this.responseMessage = `Vehicle already registered! Total bill was ₹${data.total}.`;
        } else if (data.errorType === "alreadyRegisteredMismatchData") {
          this.responseMessage = data.error || 'Vehicle already registered with different data.';
        } else {
          this.responseMessage = data.error || 'Registration failed due to an unknown error.';
        }
      }
    } catch (error) {
      console.error('Error during registration:', error);
      this.responseMessage = 'An unexpected error occurred. Please try again.';
    }
  }
}