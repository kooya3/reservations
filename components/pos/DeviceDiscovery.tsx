"use client";

import { useState } from "react";
import { Search, Usb, AlertCircle, CheckCircle, RefreshCw } from "lucide-react";
import { ThermalPrinterClient, DetectedDevice } from "@/lib/thermal-printer";

interface DeviceDiscoveryProps {
    onDeviceSelected?: (device: DetectedDevice) => void;
}

export function DeviceDiscovery({ onDeviceSelected }: DeviceDiscoveryProps) {
    const [isScanning, setIsScanning] = useState(false);
    const [devices, setDevices] = useState<DetectedDevice[]>([]);
    const [selectedDevice, setSelectedDevice] = useState<DetectedDevice | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [webUSBSupported, setWebUSBSupported] = useState<boolean | null>(null);

    const checkWebUSBSupport = () => {
        const support = ThermalPrinterClient.checkWebUSBSupport();
        setWebUSBSupported(support.supported);
        if (!support.supported) {
            setError(support.reason || 'Web USB not supported');
        }
        return support.supported;
    };

    const scanDevices = async () => {
        if (!checkWebUSBSupport()) return;

        setIsScanning(true);
        setError(null);
        setDevices([]);

        try {
            // First try to enumerate already connected devices
            const connectedDevices = await ThermalPrinterClient.enumerateUSBDevices();
            setDevices(connectedDevices);

            if (connectedDevices.length === 0) {
                // If no devices found, prompt user to select one
                const selected = await ThermalPrinterClient.requestUSBDevice();
                if (selected) {
                    setDevices([selected]);
                    setSelectedDevice(selected);
                    onDeviceSelected?.(selected);
                }
            }
        } catch (err) {
            console.error('Device scan failed:', err);
            setError(err instanceof Error ? err.message : 'Failed to scan devices');
        } finally {
            setIsScanning(false);
        }
    };

    const formatHex = (num: number): string => {
        return `0x${num.toString(16).toUpperCase().padStart(4, '0')}`;
    };

    return (
        <div className="space-y-4">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5" />
                    <div className="text-sm">
                        <p className="font-semibold text-blue-800 mb-1">USB Device Discovery</p>
                        <p className="text-blue-700">
                            This tool will help you identify your E-POS TEP-220MC printer's USB Vendor and Product IDs.
                            These IDs are needed for automatic printer detection.
                        </p>
                    </div>
                </div>
            </div>

            {/* Web USB Support Check */}
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <span className="text-sm font-medium">Web USB Support:</span>
                <div className="flex items-center gap-2">
                    {webUSBSupported === null ? (
                        <button
                            onClick={checkWebUSBSupport}
                            className="text-xs px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
                        >
                            Check
                        </button>
                    ) : webUSBSupported ? (
                        <>
                            <CheckCircle className="w-4 h-4 text-green-600" />
                            <span className="text-xs text-green-700">Supported</span>
                        </>
                    ) : (
                        <>
                            <AlertCircle className="w-4 h-4 text-red-600" />
                            <span className="text-xs text-red-700">Not Supported</span>
                        </>
                    )}
                </div>
            </div>

            {/* Scan Button */}
            <button
                onClick={scanDevices}
                disabled={isScanning || webUSBSupported === false}
                className="w-full bg-emerald-500 hover:bg-emerald-600 disabled:bg-gray-400 text-white py-3 px-4 rounded-lg font-semibold transition-all flex items-center justify-center gap-2"
            >
                {isScanning ? (
                    <>
                        <RefreshCw className="w-5 h-5 animate-spin" />
                        Scanning...
                    </>
                ) : (
                    <>
                        <Search className="w-5 h-5" />
                        {devices.length > 0 ? 'Scan Again' : 'Scan for USB Devices'}
                    </>
                )}
            </button>

            {/* Error Display */}
            {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                    <div className="flex items-start gap-2">
                        <AlertCircle className="w-4 h-4 text-red-600 mt-0.5" />
                        <div className="text-sm text-red-700">{error}</div>
                    </div>
                </div>
            )}

            {/* Device List */}
            {devices.length > 0 && (
                <div className="space-y-2">
                    <h3 className="font-semibold text-gray-700">Detected USB Devices:</h3>
                    <div className="space-y-2 max-h-60 overflow-y-auto">
                        {devices.map((device, index) => (
                            <div
                                key={index}
                                className={`border rounded-lg p-3 cursor-pointer transition-all ${selectedDevice?.vendorId === device.vendorId &&
                                        selectedDevice?.productId === device.productId
                                        ? 'border-emerald-500 bg-emerald-50'
                                        : 'border-gray-200 hover:border-emerald-300'
                                    }`}
                                onClick={() => {
                                    setSelectedDevice(device);
                                    onDeviceSelected?.(device);
                                }}
                            >
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <Usb className="w-4 h-4 text-gray-600" />
                                        <div>
                                            <p className="font-medium text-sm">
                                                {device.productName || 'Unknown Device'}
                                            </p>
                                            <p className="text-xs text-gray-600">
                                                {device.manufacturerName || 'Unknown Manufacturer'}
                                            </p>
                                        </div>
                                    </div>
                                    {selectedDevice?.vendorId === device.vendorId &&
                                        selectedDevice?.productId === device.productId && (
                                            <CheckCircle className="w-5 h-5 text-emerald-600" />
                                        )}
                                </div>
                                <div className="mt-2 text-xs text-gray-500 font-mono">
                                    Vendor ID: {formatHex(device.vendorId)} | Product ID: {formatHex(device.productId)}
                                    {device.serialNumber && ` | Serial: ${device.serialNumber}`}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Instructions */}
            {devices.length === 0 && !isScanning && !error && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                    <h4 className="font-semibold text-yellow-800 mb-2">Instructions:</h4>
                    <ol className="text-sm text-yellow-700 space-y-1 list-decimal list-inside">
                        <li>Make sure your E-POS TEP-220MC printer is connected via USB</li>
                        <li>Click "Scan for USB Devices" above</li>
                        <li>When prompted, select your printer from the device list</li>
                        <li>Note down the Vendor ID and Product ID shown</li>
                        <li>Use these IDs to configure your printer in the main setup</li>
                    </ol>
                </div>
            )}

            {/* Selected Device Info */}
            {selectedDevice && (
                <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4">
                    <h4 className="font-semibold text-emerald-800 mb-2">Selected Printer:</h4>
                    <div className="text-sm space-y-1">
                        <p><strong>Name:</strong> {selectedDevice.productName || 'Unknown'}</p>
                        <p><strong>Manufacturer:</strong> {selectedDevice.manufacturerName || 'Unknown'}</p>
                        <p className="font-mono text-xs bg-white px-2 py-1 rounded border">
                            Vendor ID: {formatHex(selectedDevice.vendorId)}<br />
                            Product ID: {formatHex(selectedDevice.productId)}
                        </p>
                        <p className="text-xs text-emerald-700 mt-2">
                            Copy these IDs to configure your printer permanently.
                        </p>
                    </div>
                </div>
            )}
        </div>
    );
}