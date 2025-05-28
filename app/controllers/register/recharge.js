// app/controllers/register/recharge.js
import Controller from '@ember/controller';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';
import { later } from '@ember/runloop';

export default class RegisterRechargeController extends Controller {
  @tracked vehicleNumber = '';
  @tracked amount = 0;
  @tracked responseMessage = '';
  @tracked isLoadingVehicleDetails = false;

  @tracked vehicleType = null;
  @tracked ownerName = null;
  @tracked currentBalance = null;

  _fetchVehicleDetailsTimer = null;

  @action
  updateVehicleNumber(event) {
    this.vehicleNumber = event.target.value.trim().toUpperCase();
    // Reset details when vehicle number changes
    this.vehicleType = null;
    this.ownerName = null;
    this.currentBalance = null;
    this.responseMessage = ''; // Clear messages

    if (this._fetchVehicleDetailsTimer) {
      clearTimeout(this._fetchVehicleDetailsTimer);
    }

    if (this.vehicleNumber.length >= 4) { // Trigger fetch after enough characters
      this.isLoadingVehicleDetails = true; // Show loading early
      this._fetchVehicleDetailsTimer = later(this, this.fetchVehicleDetails, 500); // Debounce
    } else {
      this.isLoadingVehicleDetails = false;
    }
  }

  @action
  updateAmount(event) {
    this.amount = parseFloat(event.target.value);
  }

  @action
  async fetchVehicleDetails() {
    if (!this.vehicleNumber) {
      this.isLoadingVehicleDetails = false;
      return;
    }

    try {
      const response = await fetch(`http://localhost:8080/fasttag/vehicles/${this.vehicleNumber}`);
      const data = await response.json();

      if (response.ok) {
        this.vehicleType = data.vehicleType;
        this.ownerName = data.ownerName;
        this.currentBalance = data.balance; // 'balance' from servlet response
      } else {
        this.responseMessage = data.error || 'Vehicle not found or an error occurred.';
        this.vehicleType = null;
        this.ownerName = null;
        this.currentBalance = null;
      }
    } catch (error) {
      console.error('Error fetching vehicle details:', error);
      this.responseMessage = 'An error occurred while fetching vehicle details.';
      this.vehicleType = null;
      this.ownerName = null;
      this.currentBalance = null;
    } finally {
      this.isLoadingVehicleDetails = false;
    }
  }

  @action
  async submitRecharge(event) {
    event.preventDefault();

    this.responseMessage = '';

    if (!this.vehicleNumber || this.amount <= 0) {
      this.responseMessage = 'Please enter a valid vehicle number and a positive recharge amount.';
      return;
    }

    // Basic client-side validation for vehicle number
    if (!/^(?=.*[A-Z])(?=.*[0-9])[A-Z0-9]+$/.test(this.vehicleNumber)) {
      this.responseMessage = 'Invalid vehicle number format.';
      return;
    }

    const params = new URLSearchParams();
    params.append('vehicleNumber', this.vehicleNumber);
    params.append('amount', this.amount);

    try {
      const response = await fetch('http://localhost:8080/fasttag/recharge', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: params.toString(),
      });

      const data = await response.json();

      if (response.ok) {
        this.responseMessage = data.message || `Recharge successful! New Balance: ₹${data.newBalance}`;
        this.currentBalance = data.newBalance; // Update local balance
        // Optionally clear the amount field
        this.amount = 0;
      } else {
        this.responseMessage = data.error || 'Recharge failed.';
      }
    } catch (error) {
      console.error('Error during recharge:', error);
      this.responseMessage = 'An unexpected error occurred during recharge. Please try again.';
    }
  }
}