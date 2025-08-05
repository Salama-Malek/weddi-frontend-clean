import { useEffect, useState } from 'react';
import type { Router } from '@remix-run/router';
import Loader from './loader';

interface Props {
  router: Router;
}

const LoadingOverlay: React.FC<Props> = ({ router }) => {
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    return router.subscribe((state) => {
      setLoading(state.navigation.state === 'loading');
    });
  }, [router]);

  if (!loading) return null;
  return <Loader />;
};

export default LoadingOverlay;
