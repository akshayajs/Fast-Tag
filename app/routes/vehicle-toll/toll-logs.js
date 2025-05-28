// app/routes/vehicle-toll/toll-logs.js
import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';

export default class VehicleTollTollLogsRoute extends Route {
  @service fetch;

  async model() {
    try {
      const response = await this.fetch.get('/toll-logs');

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('Failed to fetch toll logs:', errorData.error || `Server responded with status ${response.status}`);
        return { tollLogs: [], errorMessage: errorData.error || 'Failed to load toll records.' };
      }

      const data = await response.json();
      const tollLogs = data.tollLogs || [];

      return {
        tollLogs: tollLogs,
        errorMessage: null // Clear any previous errors
      };

    } catch (error) {
      console.error('Error fetching toll logs:', error);
      return { tollLogs: [], errorMessage: 'An unexpected error occurred while fetching toll records.' };
    }
  }
}