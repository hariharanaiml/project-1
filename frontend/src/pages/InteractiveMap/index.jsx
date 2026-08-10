import DashboardLayout from '../Dashboard/components/Layout/DashboardLayout';
import MapContainer from './components/MapContainer';

/**
 * InteractiveMap page - GIS-style road damage monitoring map.
 * Frontend only. Backend integration will come later.
 */
export default function InteractiveMap() {
  return (
    <DashboardLayout pageTitle="Interactive Map">
      <div className="space-y-6 sm:space-y-8">
        <MapContainer />
      </div>
    </DashboardLayout>
  );
}
