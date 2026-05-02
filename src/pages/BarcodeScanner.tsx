import { useState, useRef, useEffect } from 'react';
import { useApp } from '../store/AppContext';
import { Barcode, AlertCircle, CheckCircle2, Clock, Navigation2, X, Camera } from 'lucide-react';
import { Html5QrcodeScanner, Html5Qrcode } from 'html5-qrcode';
import { cn } from '../lib/utils';
import { 
  formatExpiryDate, 
  getDaysUntilExpiry, 
  isExpired, 
  isExpiryWarning 
} from '../lib/utils';

export default function BarcodeScanner() {
  const { medicines } = useApp();
  const [scannedMedicine, setScannedMedicine] = useState<any>(null);
  const [error, setError] = useState('');
  const [isScanning, setIsScanning] = useState(true);
  const [lastScannedBarcode, setLastScannedBarcode] = useState('');
  const scannerRef = useRef<Html5QrcodeScanner | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    // Initialize scanner
    const scanner = new Html5QrcodeScanner(
      'qr-reader',
      {
        fps: 10,
        qrbox: { width: 280, height: 280 },
        aspectRatio: 1.33,
        showTorchButtonIfSupported: true,
        disableFlip: false,
      },
      false
    );

    scannerRef.current = scanner;

    const onScanSuccess = (decodedText: string) => {
      // Prevent duplicate scans
      if (decodedText === lastScannedBarcode) {
        return;
      }

      setLastScannedBarcode(decodedText);
      setError('');
      setScannedMedicine(null);

      // Search for medicine by barcode
      const found = medicines.find(med => med.barcode === decodedText.trim());

      if (found) {
        setScannedMedicine(found);
        setIsScanning(false);
        // Stop scanner after successful scan
        scanner.pause();
      } else {
        // Continue scanning if not found
        setError(`No medicine found with barcode: ${decodedText}`);
      }
    };

    const onScanFailure = () => {
      // Continue scanning on failure (no error message needed)
    };

    scanner.render(onScanSuccess, onScanFailure);

    return () => {
      scanner.clear().catch(() => {});
    };
  }, [medicines, lastScannedBarcode]);

  const handleClear = () => {
    setScannedMedicine(null);
    setError('');
    setLastScannedBarcode('');
    setIsScanning(true);
    if (scannerRef.current) {
      scannerRef.current.resume();
    }
  };

  const batch = scannedMedicine;
  const earliestExpiry = batch?.expiryDate;
  const daysUntilExpiry = earliestExpiry ? getDaysUntilExpiry(earliestExpiry) : null;
  const isExp = earliestExpiry ? isExpired(earliestExpiry) : false;
  const isWarning = earliestExpiry ? isExpiryWarning(earliestExpiry, 14) : false;

  return (
    <div className="space-y-6">
      <header className="mb-8">
        <h2 className="font-display text-4xl font-bold text-slate-900 mb-2">Barcode Scanner</h2>
        <p className="text-lg text-slate-500 font-medium">Point camera at barcode to scan medicine batches and verify details before placing on shelf.</p>
      </header>

      {/* Camera Scanner Feed */}
      <div className="bg-white rounded-3xl overflow-hidden border border-slate-200 shadow-sm" ref={containerRef}>
        <div className="relative bg-black">
          <div id="qr-reader" style={{ width: '100%', minHeight: '400px' }}></div>
          {isScanning && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="flex items-center gap-2 bg-white/90 px-6 py-3 rounded-full">
                <Camera size={18} className="text-primary animate-pulse" />
                <span className="text-sm font-bold text-slate-900">Scanning...</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-xl flex items-center gap-3">
          <AlertCircle size={20} className="text-red-600" />
          <div>
            <p className="text-sm text-red-700 font-medium">Barcode not found</p>
            <p className="text-xs text-red-600 mt-1">{error}</p>
          </div>
        </div>
      )}

      {/* Scanned Medicine Details */}
      {scannedMedicine && (
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-3xl p-8 border border-blue-200 shadow-lg">
          <div className="flex items-start justify-between mb-6">
            <div>
              <h3 className="font-display text-2xl font-bold text-slate-900 mb-1">{scannedMedicine.name}</h3>
              <p className="text-sm text-slate-600">
                <span className="font-mono font-bold">SKU:</span> {scannedMedicine.sku}
              </p>
              <p className="text-sm text-slate-600">
                <span className="font-mono font-bold">Barcode:</span> {scannedMedicine.barcode}
              </p>
            </div>
            <button
              onClick={handleClear}
              className="p-2 hover:bg-white/50 rounded-full transition-colors"
            >
              <X size={20} className="text-slate-600" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="bg-white rounded-2xl p-4">
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Batch ID</p>
              <p className="font-mono text-lg font-bold text-slate-900 mt-2">{batch?.batchId}</p>
            </div>
            <div className="bg-white rounded-2xl p-4">
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Quantity</p>
              <p className="text-2xl font-bold text-slate-900 mt-2">{batch?.quantity} units</p>
              <p className="text-xs text-slate-500 mt-1">of {scannedMedicine.capacity} capacity</p>
            </div>
            <div className={cn(
              "rounded-2xl p-4",
              isExp ? "bg-red-100 border border-red-200" :
              isWarning ? "bg-amber-100 border border-amber-200" :
              "bg-green-100 border border-green-200"
            )}>
              <p className="text-xs font-bold uppercase tracking-widest" style={{
                color: isExp ? '#7f1d1d' : isWarning ? '#78350f' : '#166534'
              }}>
                {isExp ? 'EXPIRED' : isWarning ? 'EXPIRING SOON' : 'OK'}
              </p>
              <p className="font-bold mt-2" style={{
                color: isExp ? '#7f1d1d' : isWarning ? '#78350f' : '#166534'
              }}>
                {earliestExpiry ? formatExpiryDate(earliestExpiry) : 'No data'}
              </p>
              <p className="text-xs mt-1" style={{
                color: isExp ? '#dc2626' : isWarning ? '#d97706' : '#16a34a'
              }}>
                {daysUntilExpiry !== null ? (
                  daysUntilExpiry < 0 ? `${Math.abs(daysUntilExpiry)} days ago` : `${daysUntilExpiry} days left`
                ) : 'No expiry data'}
              </p>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-4 border border-slate-100">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">Shelf Location</p>
            <div className="flex items-center gap-2">
              <Navigation2 size={20} className="text-primary" />
              <span className="font-mono text-lg font-bold text-slate-900">{scannedMedicine.shelfId}</span>
            </div>
          </div>

          {/* Status Banner */}
          <div className={cn(
            "mt-6 flex items-center gap-3 p-4 rounded-xl",
            isExp ? "bg-red-100 border border-red-200" :
            isWarning ? "bg-amber-100 border border-amber-200" :
            "bg-green-100 border border-green-200"
          )}>
            {isExp && <AlertCircle size={20} className="text-red-600" />}
            {isWarning && <AlertCircle size={20} className="text-amber-600" />}
            {!isExp && !isWarning && <CheckCircle2 size={20} className="text-green-600" />}
            <div>
              <p className="font-bold text-sm" style={{
                color: isExp ? '#7f1d1d' : isWarning ? '#78350f' : '#166534'
              }}>
                {isExp ? 'EXPIRED - Cannot Dispense' : isWarning ? 'EXPIRING SOON - Use FIFO Protocol' : 'OK - Ready to Place on Shelf'}
              </p>
              <p className="text-xs mt-1" style={{
                color: isExp ? '#991b1b' : isWarning ? '#92400e' : '#15803d'
              }}>
                {isExp 
                  ? 'This batch has expired and cannot be used or dispensed to patients.'
                  : isWarning 
                  ? 'This batch expires within 14 days. Prioritize for dispensing.'
                  : 'This batch is within normal use range. Place on shelf and follow FIFO.'
                }
              </p>
            </div>
          </div>

          <div className="mt-6 p-4 bg-blue-100/50 rounded-xl border border-blue-200">
            <p className="text-xs text-blue-700 font-medium">
              💡 <span className="font-bold">FIFO Protocol:</span> Allocate expired batches with caution and follow FIFO rules when dispensing to minimize waste.
            </p>
          </div>

          <button
            onClick={handleClear}
            className="mt-6 w-full px-6 py-3 bg-primary text-white font-bold rounded-xl hover:bg-primary/90 transition-colors"
          >
            Scan Another Medicine
          </button>
        </div>
      )}

      {/* Empty State */}
      {!scannedMedicine && !error && isScanning && (
        <div className="bg-slate-50 rounded-3xl p-12 border-2 border-dashed border-slate-200 text-center">
          <Camera size={48} className="mx-auto text-slate-300 mb-4" />
          <p className="text-lg font-medium text-slate-600">Ready to scan</p>
          <p className="text-sm text-slate-500 mt-2">Point camera at a barcode to begin scanning medicines</p>
        </div>
      )}
    </div>
  );
}
