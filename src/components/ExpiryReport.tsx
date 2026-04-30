import { Download, AlertCircle } from 'lucide-react';
import { Medicine, MedicineBatch } from '../types';
import { 
  getDaysUntilExpiry, 
  isExpired, 
  isExpiryWarning, 
  formatExpiryDate,
  getTotalQuantity 
} from '../lib/utils';
import { cn } from '../lib/utils';

interface ExpiryReportProps {
  medicines: Medicine[];
}

export default function ExpiryReport({ medicines }: ExpiryReportProps) {
  /**
   * Flatten batches to individual rows for reporting
   */
  const getBatchRows = () => {
    const rows: Array<{
      medicineName: string;
      sku: string;
      batchId: string;
      quantity: number;
      expiryDate: string;
      daysUntilExpiry: number;
      status: 'EXPIRED' | 'EXPIRING' | 'OK';
      location: string;
    }> = [];

    medicines.forEach(med => {
      med.batches.forEach(batch => {
        const daysUntil = getDaysUntilExpiry(batch.expiryDate);
        const status = isExpired(batch.expiryDate) 
          ? 'EXPIRED' 
          : isExpiryWarning(batch.expiryDate, 14)
          ? 'EXPIRING'
          : 'OK';

        rows.push({
          medicineName: med.name,
          sku: med.sku,
          batchId: batch.batchId,
          quantity: batch.quantity,
          expiryDate: batch.expiryDate,
          daysUntilExpiry: daysUntil,
          status,
          location: med.shelfId,
        });
      });
    });

    return rows;
  };

  /**
   * Filter rows based on status
   */
  const getFilteredRows = (filterStatus: 'all' | 'expiring' | 'expired') => {
    const rows = getBatchRows();
    if (filterStatus === 'expired') {
      return rows.filter(r => r.status === 'EXPIRED');
    }
    if (filterStatus === 'expiring') {
      return rows.filter(r => r.status === 'EXPIRING' || r.status === 'EXPIRED');
    }
    return rows;
  };

  /**
   * Generate CSV content
   */
  const generateCSV = (filterStatus: 'all' | 'expiring' | 'expired') => {
    const rows = getFilteredRows(filterStatus);
    const headers = [
      'Medicine Name',
      'SKU',
      'Batch ID',
      'Quantity',
      'Expiry Date',
      'Days Until Expiry',
      'Status',
      'Location',
    ];

    const csvContent = [
      headers.join(','),
      ...rows.map(row =>
        [
          `"${row.medicineName}"`,
          `"${row.sku}"`,
          `"${row.batchId}"`,
          row.quantity,
          row.expiryDate,
          row.daysUntilExpiry,
          row.status,
          `"${row.location}"`,
        ].join(',')
      ),
    ].join('\n');

    return csvContent;
  };

  /**
   * Download CSV file
   */
  const downloadReport = (filterStatus: 'all' | 'expiring' | 'expired') => {
    const csv = generateCSV(filterStatus);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);

    const filename = `expiry-report-${filterStatus}-${new Date().toISOString().split('T')[0]}.csv`;
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const allRows = getBatchRows();
  const expiringRows = getFilteredRows('expiring');
  const expiredRows = getFilteredRows('expired');

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-6 bg-blue-50 rounded-xl border border-blue-200">
          <p className="text-xs font-bold text-blue-600 uppercase tracking-widest mb-2">Total Batches</p>
          <p className="text-3xl font-bold text-slate-900">{allRows.length}</p>
        </div>
        <div className="p-6 bg-amber-50 rounded-xl border border-amber-200">
          <div className="flex items-center gap-2">
            <AlertCircle size={16} className="text-amber-600" />
            <p className="text-xs font-bold text-amber-600 uppercase tracking-widest">Expiring Soon (14d)</p>
          </div>
          <p className="text-3xl font-bold text-slate-900 mt-2">{expiringRows.length}</p>
        </div>
        <div className="p-6 bg-red-50 rounded-xl border border-red-200">
          <div className="flex items-center gap-2">
            <AlertCircle size={16} className="text-red-600" />
            <p className="text-xs font-bold text-red-600 uppercase tracking-widest">Already Expired</p>
          </div>
          <p className="text-3xl font-bold text-slate-900 mt-2">{expiredRows.length}</p>
        </div>
      </div>

      {/* Download Buttons */}
      <div className="flex flex-wrap gap-3">
        <button
          onClick={() => downloadReport('all')}
          className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg font-bold text-sm hover:bg-primary/90 transition-colors"
        >
          <Download size={16} />
          Export All Batches
        </button>
        <button
          onClick={() => downloadReport('expiring')}
          className="flex items-center gap-2 px-4 py-2 bg-amber-500 text-white rounded-lg font-bold text-sm hover:bg-amber-600 transition-colors"
        >
          <Download size={16} />
          Export Expiring
        </button>
        <button
          onClick={() => downloadReport('expired')}
          className="flex items-center gap-2 px-4 py-2 bg-red-500 text-white rounded-lg font-bold text-sm hover:bg-red-600 transition-colors"
        >
          <Download size={16} />
          Export Expired
        </button>
      </div>

      {/* Data Table */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                <th className="text-left p-4 font-bold text-slate-600 uppercase tracking-widest text-xs">Medicine Name</th>
                <th className="text-left p-4 font-bold text-slate-600 uppercase tracking-widest text-xs">SKU</th>
                <th className="text-left p-4 font-bold text-slate-600 uppercase tracking-widest text-xs">Batch ID</th>
                <th className="text-center p-4 font-bold text-slate-600 uppercase tracking-widest text-xs">Qty</th>
                <th className="text-left p-4 font-bold text-slate-600 uppercase tracking-widest text-xs">Expiry Date</th>
                <th className="text-center p-4 font-bold text-slate-600 uppercase tracking-widest text-xs">Days</th>
                <th className="text-left p-4 font-bold text-slate-600 uppercase tracking-widest text-xs">Status</th>
                <th className="text-left p-4 font-bold text-slate-600 uppercase tracking-widest text-xs">Location</th>
              </tr>
            </thead>
            <tbody>
              {allRows.length === 0 ? (
                <tr>
                  <td colSpan={8} className="p-8 text-center text-slate-500 font-medium">
                    No batch data available
                  </td>
                </tr>
              ) : (
                allRows.map((row, idx) => (
                  <tr
                    key={`${row.batchId}-${idx}`}
                    className={cn(
                      "border-b border-slate-100 hover:bg-slate-50 transition-colors",
                      row.status === 'EXPIRED' ? 'bg-red-50' :
                      row.status === 'EXPIRING' ? 'bg-amber-50' :
                      ''
                    )}
                  >
                    <td className="p-4 font-bold text-slate-900">{row.medicineName}</td>
                    <td className="p-4 font-mono text-xs text-slate-600">{row.sku}</td>
                    <td className="p-4 font-mono text-xs font-bold text-slate-600">{row.batchId}</td>
                    <td className="p-4 text-center font-bold text-slate-900">{row.quantity}</td>
                    <td className="p-4 text-slate-700">{formatExpiryDate(row.expiryDate)}</td>
                    <td className={cn(
                      "p-4 text-center font-bold",
                      row.status === 'EXPIRED' ? 'text-red-600' :
                      row.status === 'EXPIRING' ? 'text-amber-600' :
                      'text-secondary'
                    )}>
                      {row.daysUntilExpiry < 0 ? `${Math.abs(row.daysUntilExpiry)}d ago` : `${row.daysUntilExpiry}d`}
                    </td>
                    <td className="p-4">
                      <span className={cn(
                        "inline-flex px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider w-fit",
                        row.status === 'EXPIRED' ? 'bg-red-100 text-red-700' :
                        row.status === 'EXPIRING' ? 'bg-amber-100 text-amber-700' :
                        'bg-secondary/10 text-secondary'
                      )}>
                        {row.status}
                      </span>
                    </td>
                    <td className="p-4 font-mono text-xs text-slate-600">{row.location}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
