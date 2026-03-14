"use client";

import { useState } from "react";
import { Printer, Usb, Wifi, Settings, AlertCircle, CheckCircle } from "lucide-react";
import { ThermalPrinterClient, COMMON_PRINTERS, PrinterConfig, DetectedDevice } from "@/lib/thermal-printer";
import { DeviceDiscovery } from "./DeviceDiscovery";

interface PrinterSetupProps {
    orderId: string;
    onPrintSuccess?: () => void;
}

export function PrinterSetup({ orderId, onPrintSuccess }: PrinterSetupProps) {
    const [isPrinting, setIsPrinting] = useState(false);
    const [printerType, setPrinterType] = useState<'browser' | 'thermal'>('browser');
    const [showConfig, setShowConfig] = useState(false);
    const [showDeviceDiscovery, setShowDeviceDiscovery] = useState(false);
    const [printerConfig, setPrinterConfig] = useState<PrinterConfig>(COMMON_PRINTERS.EPOS_TEP_220MC);
    const [webUSBSupported, setWebUSBSupported] = useState<boolean | null>(null);
    const [lastError, setLastError] = useState<string | null>(null);

    const handleDeviceSelected = (device: DetectedDevice) => {
        setPrinterConfig({
            ...printerConfig,
            vendorId: device.vendorId,
            productId: device.productId,
            deviceName: device.productName
        });
        setShowDeviceDiscovery(false);
        setLastError(null);
    };

    const checkWebUSBSupport = () => {
        const support = ThermalPrinterClient.checkWebUSBSupport();
        setWebUSBSupported(support.supported);
        return support.supported;
    };

    const handleBrowserPrint = () => {
        window.print();
        onPrintSuccess?.();
    };

    const handleThermalPrint = async () => {
        // Check Web USB support first
        if (!checkWebUSBSupport()) {
            setLastError('Web USB is not supported in this browser. Please use Chrome, Edge, or Opera, and ensure you\'re on HTTPS or localhost.');
            return;
        }

        setIsPrinting(true);
        setLastError(null);

        try {
            const printer = new ThermalPrinterClient(printerConfig);
            const result = await printer.printReceipt(orderId);

            if (result.success) {
                alert('✓ Receipt printed successfully!');
                onPrintSuccess?.();
            } else {
                const errMsg = result.error || 'Print failed';
                setLastError(errMsg);

                // give specific feedback for common backend errors
                if (errMsg.toLowerCase().includes('order not found')) {
                    alert(`✗ Print failed: ${errMsg}\n\nPlease verify that the order ID exists in the system.`);
                } else {
                    alert(`✗ Print failed: ${errMsg}\n\nTroubleshooting tips:\n• Make sure your printer is connected and powered on\n• Grant USB permissions when prompted\n• Try the Device Discovery tool to identify your printer`);
                }
            }
        } catch (error) {
            console.error('Print error:', error);
            const errorMessage = error instanceof Error ? error.message : 'Print failed';
            setLastError(errorMessage);
            alert(`Print failed: ${errorMessage}`);
        } finally {
            setIsPrinting(false);
        }
    };

    return (
        <div className="space-y-4">
            {/* Printer Type Selection */}
            <div className="flex gap-2">
                <button
                    onClick={() => setPrinterType('browser')}
                    className={`flex-1 py-3 px-4 rounded-lg font-semibold transition-all flex items-center justify-center gap-2 ${printerType === 'browser'
                        ? 'bg-emerald-500 text-white shadow-lg'
                        : 'bg-white text-gray-700 border-2 border-gray-200 hover:border-emerald-300'
                        }`}
                >
                    <Printer className="w-5 h-5" />
                    Browser Print
                </button>
                <button
                    onClick={() => setPrinterType('thermal')}
                    className={`flex-1 py-3 px-4 rounded-lg font-semibold transition-all flex items-center justify-center gap-2 ${printerType === 'thermal'
                        ? 'bg-emerald-500 text-white shadow-lg'
                        : 'bg-white text-gray-700 border-2 border-gray-200 hover:border-emerald-300'
                        }`}
                >
                    <Usb className="w-5 h-5" />
                    Thermal Printer
                </button>
            </div>

            {/* Thermal Printer Config */}
            {printerType === 'thermal' && (
                <div className="bg-white rounded-lg p-4 border-2 border-emerald-200 space-y-3">
                    <div className="flex items-center justify-between">
                        <span className="font-semibold text-gray-700">Printer Configuration</span>
                        <button
                            onClick={() => setShowConfig(!showConfig)}
                            className="text-emerald-600 hover:text-emerald-700"
                        >
                            <Settings className="w-5 h-5" />
                        </button>
                    </div>

                    {/* Web USB Status */}
                    <div className="flex items-center justify-between p-2 bg-gray-50 rounded">
                        <span className="text-sm text-gray-600">Web USB:</span>
                        <div className="flex items-center gap-1">
                            {webUSBSupported === null ? (
                                <button
                                    onClick={checkWebUSBSupport}
                                    className="text-xs px-2 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
                                >
                                    Check
                                </button>
                            ) : webUSBSupported ? (
                                <>
                                    <CheckCircle className="w-4 h-4 text-green-600" />
                                    <span className="text-xs text-green-700">OK</span>
                                </>
                            ) : (
                                <>
                                    <AlertCircle className="w-4 h-4 text-red-600" />
                                    <span className="text-xs text-red-700">Issue</span>
                                </>
                            )}
                        </div>
                    </div>

                    {/* Error Display */}
                    {lastError && (
                        <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                            <div className="flex items-start gap-2">
                                <AlertCircle className="w-4 h-4 text-red-600 mt-0.5" />
                                <div className="text-sm text-red-700">{lastError}</div>
                            </div>
                        </div>
                    )}

                    {showConfig && (
                        <div className="space-y-3 pt-2 border-t border-gray-200">
                            {/* Device Discovery */}
                            <div>
                                <div className="flex items-center justify-between mb-2">
                                    <label className="block text-sm font-medium text-gray-700">
                                        Device Discovery
                                    </label>
                                    <button
                                        onClick={() => setShowDeviceDiscovery(!showDeviceDiscovery)}
                                        className="text-xs px-3 py-1 bg-emerald-500 text-white rounded hover:bg-emerald-600"
                                    >
                                        {showDeviceDiscovery ? 'Hide' : 'Find Printer'}
                                    </button>
                                </div>

                                {showDeviceDiscovery && (
                                    <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                                        <DeviceDiscovery onDeviceSelected={handleDeviceSelected} />
                                    </div>
                                )}
                            </div>
                            {/* Connection Type */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Connection Type
                                </label>
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => setPrinterConfig({ ...printerConfig, type: 'usb' })}
                                        className={`flex-1 py-2 px-3 rounded text-sm font-medium transition-all ${printerConfig.type === 'usb'
                                            ? 'bg-emerald-100 text-emerald-700 border-2 border-emerald-500'
                                            : 'bg-gray-100 text-gray-600 border-2 border-gray-200'
                                            }`}
                                    >
                                        <Usb className="w-4 h-4 inline mr-1" />
                                        USB
                                    </button>
                                    <button
                                        onClick={() => setPrinterConfig({ ...printerConfig, type: 'network' })}
                                        className={`flex-1 py-2 px-3 rounded text-sm font-medium transition-all ${printerConfig.type === 'network'
                                            ? 'bg-emerald-100 text-emerald-700 border-2 border-emerald-500'
                                            : 'bg-gray-100 text-gray-600 border-2 border-gray-200'
                                            }`}
                                    >
                                        <Wifi className="w-4 h-4 inline mr-1" />
                                        Network
                                    </button>
                                </div>
                            </div>

                            {/* Current Device Info */}
                            {printerConfig.vendorId && printerConfig.productId && (
                                <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-3">
                                    <div className="flex items-center gap-2 mb-2">
                                        <CheckCircle className="w-4 h-4 text-emerald-600" />
                                        <span className="text-sm font-medium text-emerald-800">Printer Configured</span>
                                    </div>
                                    <div className="text-xs text-emerald-700 space-y-1">
                                        <p><strong>Device:</strong> {printerConfig.deviceName || 'Unknown'}</p>
                                        <p className="font-mono">Vendor: 0x{printerConfig.vendorId.toString(16).toUpperCase().padStart(4, '0')} | Product: 0x{printerConfig.productId.toString(16).toUpperCase().padStart(4, '0')}</p>
                                    </div>
                                </div>
                            )}

                            {/* Manual ID Entry */}
                            <div className="space-y-2">
                                <label className="block text-sm font-medium text-gray-700">
                                    Manual Configuration (Optional)
                                </label>
                                <div className="grid grid-cols-2 gap-2">
                                    <div>
                                        <label className="block text-xs text-gray-600 mb-1">Vendor ID (hex)</label>
                                        <input
                                            type="text"
                                            placeholder="04b8"
                                            className="w-full px-2 py-1 border border-gray-300 rounded text-xs font-mono"
                                            value={printerConfig.vendorId ? printerConfig.vendorId.toString(16) : ''}
                                            onChange={(e) => {
                                                const hex = e.target.value.replace(/^0x/, '');
                                                const vendorId = hex ? parseInt(hex, 16) : undefined;
                                                setPrinterConfig({ ...printerConfig, vendorId });
                                            }}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs text-gray-600 mb-1">Product ID (hex)</label>
                                        <input
                                            type="text"
                                            placeholder="0202"
                                            className="w-full px-2 py-1 border border-gray-300 rounded text-xs font-mono"
                                            value={printerConfig.productId ? printerConfig.productId.toString(16) : ''}
                                            onChange={(e) => {
                                                const hex = e.target.value.replace(/^0x/, '');
                                                const productId = hex ? parseInt(hex, 16) : undefined;
                                                setPrinterConfig({ ...printerConfig, productId });
                                            }}
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Network Config */}
                            {printerConfig.type === 'network' && (
                                <div className="space-y-2">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            IP Address
                                        </label>
                                        <input
                                            type="text"
                                            placeholder="192.168.1.100"
                                            className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg text-sm"
                                            onChange={(e) => setPrinterConfig({ ...printerConfig, ipAddress: e.target.value })}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Port
                                        </label>
                                        <input
                                            type="number"
                                            placeholder="9100"
                                            defaultValue="9100"
                                            className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg text-sm"
                                            onChange={(e) => setPrinterConfig({ ...printerConfig, port: parseInt(e.target.value) })}
                                        />
                                    </div>
                                </div>
                            )}

                            <div className="text-xs text-gray-500 bg-blue-50 p-2 rounded border border-blue-200">
                                <strong>Troubleshooting:</strong>
                                <ul className="mt-1 space-y-1">
                                    <li>• Use Chrome/Edge browser for USB printing</li>
                                    <li>• Ensure HTTPS or localhost for Web USB</li>
                                    <li>• Grant USB permissions when prompted</li>
                                    <li>• Check printer power and USB connection</li>
                                </ul>
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* Print Button */}
            <button
                onClick={printerType === 'browser' ? handleBrowserPrint : handleThermalPrint}
                disabled={isPrinting}
                className="w-full bg-emerald-500 hover:bg-emerald-600 disabled:bg-gray-400 text-white py-4 px-6 rounded-lg font-bold text-lg transition-all shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
            >
                {isPrinting ? (
                    <>
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        Printing...
                    </>
                ) : (
                    <>
                        <Printer className="w-6 h-6" />
                        {printerType === 'browser' ? 'Print Receipt' : 'Print to Thermal Printer'}
                    </>
                )}
            </button>
        </div>
    );
}
