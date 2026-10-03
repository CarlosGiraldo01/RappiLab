import { OrderStatus } from '@/lib/types';

const STATUS_CONFIG: Record<OrderStatus, { label: string; className: string }> = {
  waiting_for_deliver: { label: 'Pending', className: 'bg-pending-soft text-ink-soft' },
  in_progress: { label: 'On the way', className: 'bg-primary-soft text-primary-dark' },
  delivered: { label: 'Delivered', className: 'bg-success-soft text-success' },
};

export function StatusBadge({ status }: { status: OrderStatus }) {
  const config = STATUS_CONFIG[status];
  return (
    <span className={`badge ${config.className}`}>
      <span className="h-2 w-2 rounded-[3px] bg-current" />
      {config.label}
    </span>
  );
}