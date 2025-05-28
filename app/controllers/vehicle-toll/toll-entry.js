// app/controllers/vehicle-toll/toll-entry.js
import Controller from '@ember/controller';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';
import { later } from '@ember/runloop';

export default class VehicleTollTollEntryController extends Controller {
  @tracked vehicleNumber = '';
  @tracked isLoading = false;
  @tracked isRegistered = false;
  @tracked errorMessage = '';
  @tracked vehicleDetails = null; 
  @tracked estimatedFare = 0;
  @tracked tollProcessingMessage = '';
  @tracked tollSuccessDetails = null;
  @tracked tollProcessingError = '';

  _fetchVehicleDetailsTimer = null;

  @action
  updateVehicleNumber(event) {
    this.vehicleNumber = event.target.value.trim().toUpperCase();
    // Reset all status and details when vehicle number changes
    this.isRegistered = false;
    this.errorMessage = '';
    this.vehicleDetails = null;
    this.estimatedFare = 0;
    this.tollProcessingMessage = '';
    this.tollSuccessDetails = null;
    this.tollProcessingError = '';
    this.isLoading = false; // Reset loading state

    if (this._fetchVehicleDetailsTimer) {
      clearTimeout(this._fetchVehicleDetailsTimer);
    }

    if (this.vehicleNumber.length >= 4) { // Trigger fetch after enough characters
      this.isLoading = true; // Set loading state
      this._fetchVehicleDetailsTimer = later(this, this.fetchVehicleDetails, 500); // Debounce
    }
  }

  @action
  async fetchVehicleDetails() {
    if (!this.vehicleNumber) {
      this.isLoading = false;
      return;
    }

    try {
      // Use the specific endpoint for fetching vehicle details with balance
      const response = await fetch(`http://localhost:8080/fasttag/vehicles/${this.vehicleNumber}`);
      const data = await response.json();

      if (response.ok) {
        this.isRegistered = true;
        this.vehicleDetails = data;
        // The servlet's GET /fasttag endpoint calculates fare including discount.
        // For *displaying* estimated fare before processing, we'll use a client-side map.
        this.estimatedFare = this.calculateClientSideFare(data.vehicleType);
      } else {
        this.isRegistered = false;
        this.errorMessage = data.error || 'Vehicle not found.';
      }
    } catch (error) {
      console.error('Error fetching vehicle details:', error);
      this.errorMessage = 'An error occurred while checking vehicle status.';
    } finally {
      this.isLoading = false;
    }
  }

  // Client-side fare calculation for display *before* actual toll processing.
  // This does NOT include the 30-minute discount logic, as that's server-side.
  calculateClientSideFare(vehicleType) {
    const fareMap = {
      "CAR": 85.00, "JEEP": 85.00, "VAN": 85.00, "LCV": 135.00,
      "TRUCK": 285.00, "BUS": 285.00, "UPTO 3 AXLE VEHICLE": 315.00,
      "4 TO 6 AXLE": 450.00, "HCM/EME": 450.00, "7 OR MORE AXLE": 550.00
    };
    return fareMap[vehicleType.toUpperCase()] || 0.0;
  }

  @action
  async processToll() {
    this.tollProcessingMessage = 'Processing toll...';
    this.tollSuccessDetails = null;
    this.tollProcessingError = '';

    if (!this.vehicleNumber) {
      this.tollProcessingError = 'Vehicle number is required to process toll.';
      this.tollProcessingMessage = '';
      return;
    }

    try {
      // Call the main /fasttag endpoint for toll deduction (GET request)
      const response = await fetch(`http://localhost:8080/fasttag?vehicleNumber=${this.vehicleNumber}`);
      const data = await response.json();

      if (response.ok) {
        this.tollSuccessDetails = {
          chargedFare: data.chargedFare,
          isDiscountApplied: data.isDiscountApplied,
        };
        // Update the balance in vehicleDetails to reflect the new balance from the server
        this.vehicleDetails = {
          ...this.vehicleDetails,
          balance: data.newBalance,
        };
        this.tollProcessingMessage = ''; // Clear processing message
      } else {
        this.tollProcessingError = data.error || 'Failed to process toll.';
        this.tollProcessingMessage = '';
      }
    } catch (error) {
      console.error('Error processing toll:', error);
      this.tollProcessingError = 'An unexpected error occurred during toll processing.';
      this.tollProcessingMessage = '';
    }
  }
}