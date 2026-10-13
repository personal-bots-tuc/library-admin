import type { SaleRow } from '../../../api/sales';
import { money } from '../../../lib/format';

// Clases/cadenas dependientes del tipo como lookups (evita ternarios anidados y baja la complejidad)
const TYPE_SUFFIX: Record<SaleRow['type'], string> = { sale: '', return: 'R', credit_note: 'NC' };
const TYPE_TEXT: Record<SaleRow['type'], string> = {
  sale: 'text-neutral-800',
  return: 'text-red-500',
  credit_note: 'text-blue-600',
};
const TYPE_TOTAL_TEXT: Record<SaleRow['type'], string> = {
  sale: 'text-neutral-900',
  return: 'text-red-500',
  credit_note: 'text-blue-600',
};

function StatusBadge({ type, voided }: { type: string; voided: boolean }) {
  if (voided) {
    return (
      <span className="px-2 py-1 text-[10px] font-bold uppercase rounded bg-neutral-100 text-neutral-500 tracking-wider">
        ANULADA
      </span>
    );
  }
  if (type === 'return') {
    return (
      <span className="px-2 py-1 text-[10px] font-bold uppercase rounded bg-red-100 text-red-600 tracking-wider">
        DEVOLUCIÓN
      </span>
    );
  }
  if (type === 'credit_note') {
    return (
      <span className="px-2 py-1 text-[10px] font-bold uppercase rounded bg-blue-100 text-blue-600 tracking-wider">
        NOTA CRÉDITO
      </span>
    );
  }
  return (
    <span className="px-2 py-1 text-[10px] font-bold uppercase rounded bg-green-100 text-green-700 tracking-wider">
      VENTA
    </span>
  );
}

function MethodCell({ method, type }: { method: string; type: string }) {
  if (type === 'return') {
    return (
      <span className="flex items-center gap-1.5 text-neutral-700 font-medium">
        <span className="material-icons text-[16px] text-neutral-400">payments</span>
        Reintegro
      </span>
    );
  }
  if (type === 'credit_note') {
    return (
      <span className="flex items-center gap-1.5 text-blue-700 font-medium">
        <span className="material-icons text-[16px]">receipt_long</span>
        Nota Crédito
      </span>
    );
  }
  if (method === 'cash') {
    return (
      <span className="flex items-center gap-1.5 text-green-700 font-medium">
        <span className="material-icons text-[16px]">payments</span>
        Efectivo
      </span>
    );
  }
  if (method === 'credit') {
    return (
      <span className="flex items-center gap-1.5 text-amber-700 font-medium">
        <span className="material-icons text-[16px]">credit_card</span>
        Crédito
      </span>
    );
  }
  return (
    <span className="flex items-center gap-1.5 text-neutral-700 font-medium">
      <span className="material-icons text-[16px]">account_balance</span>
      Transferencia
    </span>
  );
}

function ClientCell({ client, voided }: { client: SaleRow['client']; voided: boolean }) {
  return (
    <td className="px-5 py-4">
      <div className="flex items-center gap-2">
        <span
          className={`font-medium ${voided ? 'text-neutral-400 line-through' : 'text-neutral-800'}`}
        >
          {client?.fullName || 'Consumidor Final'}
        </span>
        {client && client.balance > 0 && !voided && (
          <span className="px-1.5 py-0.5 bg-orange-100 text-orange-700 text-[9px] font-bold uppercase rounded flex flex-col items-center leading-none">
            <span>Con Saldo</span>
            <span>${client.balance}</span>
          </span>
        )}
      </div>
    </td>
  );
}

function SellerCell({ seller, source }: { seller: SaleRow['seller']; source: SaleRow['source'] }) {
  return (
    <td className="px-5 py-4 text-neutral-600 font-medium">
      <div className="flex items-center gap-1.5">
        {seller?.name || 'Desconocido'}
        {source === 'bot' && (
          <span
            className="px-1.5 py-0.5 bg-violet-100 text-violet-700 text-[9px] font-bold uppercase rounded tracking-wider"
            title="Venta generada por el bot"
          >
            BOT
          </span>
        )}
      </div>
    </td>
  );
}

function TotalCell({
  total,
  type,
  voided,
}: {
  total: number;
  type: SaleRow['type'];
  voided: boolean;
}) {
  return (
    <td className={`px-5 py-4 font-bold ${TYPE_TOTAL_TEXT[type]}`}>
      <span className={voided ? 'line-through text-neutral-400' : ''}>
        {type === 'return' ? '-' : ''}
        {money(total)}
      </span>
    </td>
  );
}

interface RowActionsProps {
  sale: SaleRow;
  detailLoading: boolean;
  onOpenDetail: (sale: SaleRow) => void;
  onOpenCreditNote: (sale: SaleRow) => void;
}

function RowActions({ sale, detailLoading, onOpenDetail, onOpenCreditNote }: RowActionsProps) {
  const canEmitCreditNote = sale.type === 'sale' && !sale.voided;
  return (
    <td className="px-5 py-4 text-right">
      <div className="flex items-center justify-end gap-1">
        {sale.voided && (
          <button
            className="text-neutral-400 hover:text-neutral-600 transition-colors p-1.5 rounded"
            title={sale.voidReason || 'Venta Anulada'}
          >
            <span className="material-icons text-[18px]">info</span>
          </button>
        )}
        {canEmitCreditNote && (
          <button
            onClick={() => onOpenCreditNote(sale)}
            className="text-red-600 hover:text-red-800 hover:bg-red-50 transition-colors p-1.5 rounded"
            title="Emitir Nota de Crédito"
          >
            <span className="material-icons text-[20px]">receipt_long</span>
          </button>
        )}
        <button
          onClick={() => onOpenDetail(sale)}
          disabled={detailLoading}
          className="text-blue-600 hover:text-blue-800 hover:bg-blue-50 transition-colors p-1.5 rounded"
          title="Ver ticket"
        >
          <span className="material-icons text-[20px]">print</span>
        </button>
      </div>
    </td>
  );
}

export interface SaleTableRowProps {
  sale: SaleRow;
  detailLoading: boolean;
  onOpenDetail: (sale: SaleRow) => void;
  onOpenCreditNote: (sale: SaleRow) => void;
}

export default function SaleTableRow({
  sale,
  detailLoading,
  onOpenDetail,
  onOpenCreditNote,
}: SaleTableRowProps) {
  const numStr = `#${sale.number.toString().padStart(4, '0')}${TYPE_SUFFIX[sale.type]}`;
  const date = new Date(sale.createdAt);
  const dateStr = date.toLocaleDateString('es-AR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
  const timeStr = date.toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' });

  return (
    <tr className={`hover:bg-neutral-50/60 transition-colors ${sale.voided ? 'opacity-60' : ''}`}>
      <td className={`px-5 py-4 font-bold ${TYPE_TEXT[sale.type]}`}>
        <span className={sale.voided ? 'line-through text-neutral-400' : ''}>{numStr}</span>
      </td>
      <td className="px-5 py-4">
        <StatusBadge type={sale.type} voided={sale.voided} />
      </td>
      <td className="px-5 py-4 whitespace-nowrap">
        <div className="text-neutral-600">{dateStr}</div>
        <div className="text-xs text-neutral-400">{timeStr}</div>
      </td>
      <ClientCell client={sale.client} voided={sale.voided} />
      <SellerCell seller={sale.seller} source={sale.source} />
      <td className="px-5 py-4">
        <MethodCell method={sale.paymentMethod} type={sale.type} />
      </td>
      <TotalCell total={sale.total} type={sale.type} voided={sale.voided} />
      <RowActions
        sale={sale}
        detailLoading={detailLoading}
        onOpenDetail={onOpenDetail}
        onOpenCreditNote={onOpenCreditNote}
      />
    </tr>
  );
}
