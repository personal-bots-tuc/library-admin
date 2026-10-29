import { money } from '../../../../lib/format';
import { useDebtorsPage } from '../../hooks';
import { PagedListModal } from '../paged-list-modal';
import type { DebtorsModalProps } from './types';

export const DebtorsModal = ({ onClose }: DebtorsModalProps) => {
  const list = useDebtorsPage();

  return (
    <PagedListModal
      title="Deudores"
      emptyMessage="No hay clientes con deuda"
      list={list}
      onClose={onClose}
      columns={[
        { header: 'Cliente', cell: row => row.fullName },
        { header: 'DNI', cell: row => row.dni },
        {
          header: 'Saldo',
          cell: row => <span className="font-medium text-danger-600">{money(row.balance)}</span>,
        },
      ]}
    />
  );
};
