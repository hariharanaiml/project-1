import { Link } from 'react-router-dom';
import PageLayout from '../../components/layout/PageLayout';
import Container from '../../components/common/Container';

export default function NotFound() {
  return (
    <PageLayout>
      <Container className="section-padding">
        <h1 className="text-4xl font-bold text-secondary-900">404</h1>
        <p className="mt-2 text-lg text-secondary-600">
          The page you are looking for does not exist.
        </p>
        <Link
          to="/"
          className="mt-6 inline-block rounded-lg bg-primary-600 px-6 py-3 text-sm font-medium text-white hover:bg-primary-700 transition-colors duration-200"
        >
          Go back home
        </Link>
      </Container>
    </PageLayout>
  );
}

