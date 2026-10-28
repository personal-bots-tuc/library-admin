import { useEffect, useState } from 'react';
import { listUsers } from '../../../api/users';
import type { SellerOption } from '../types';

/** Usuarios activos para el filtro por vendedor. Si falla, el filtro queda en "Todos". */
export const useSellerOptions = () => {
  const [sellers, setSellers] = useState<SellerOption[]>([]);

  useEffect(() => {
    let stale = false;

    listUsers({ active: true, limit: 100 })
      .then(result => {
        if (stale) return;
        setSellers((result.items ?? []).map(u => ({ id: u.id, name: u.name })));
      })
      .catch(() => {
        if (!stale) setSellers([]);
      });

    return () => {
      stale = true;
    };
  }, []);

  return sellers;
};
