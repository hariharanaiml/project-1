import PageLayout from '../../components/layout/PageLayout';
import Container from '../../components/common/Container';

export default function Map() {
  return (
    <PageLayout showSidebar>
      <Container className="section-padding">
        <h1 className="text-3xl font-bold text-secondary-900">Map View</h1>
        <p className="mt-2 text-secondary-600">
          Interactive geographic visualization of road damage reports and infrastructure assets.
        </p>
      </Container>
    </PageLayout>
  );
}

