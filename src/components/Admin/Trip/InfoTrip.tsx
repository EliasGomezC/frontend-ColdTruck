import { Dialog } from "@headlessui/react";
import { Route, X } from "lucide-react";
import React, { useEffect, useRef, useState } from "react";
import { getTripsForCargoType, getTripsForRute, getTripsForStatus } from "../../../services/tripService";
import type { TripsForCargoType, TripsForRute, TripsForStatus } from "../../../types";

type InfoTripsProps = {
    isOpen: boolean;
    onClose: () => void;
};

type TabKey = "cargo" | "route" | "status";

export default function InfoTrip({ isOpen, onClose }: InfoTripsProps) {
    const [active, setActive] = useState<TabKey>("cargo");

    // Estado separado por sección
    const [cargoLoaded, setCargoLoaded] = useState(false);
    const [routeLoaded, setRouteLoaded] = useState(false);
    const [statusLoaded, setStatusLoaded] = useState(false);

    const abortRef = useRef<AbortController | null>(null);


    // FETCHs
    const [forCargoType, setForCargoType] = useState<TripsForCargoType[]>([])
    const fetchForCargoType = async () => {
        try {
            const data = await getTripsForCargoType()
            setForCargoType(data)
        } catch (error) {
            console.error("Error fetching For Cargo Type:", error)
        }
    }

    useEffect(() => {
        fetchForCargoType()
    }, [])

    const [ForRute, setForRute] = useState<TripsForRute[]>([])
    const fetchForRute = async () => {
        try {
            const data = await getTripsForRute()
            setForRute(data)
        } catch (error) {
            console.error("Error fetching For Rute:", error)
        }
    }

    useEffect(() => {
        fetchForRute()
    }, [])

    const [ForStatus, setForStatus] = useState<TripsForStatus[]>([])
    const fetchForStatus = async () => {
        try {
            const data = await getTripsForStatus()
            setForStatus(data)
        } catch (error) {
            console.error("Error fetching For Status:", error)
        }
    }

    useEffect(() => {
        fetchForStatus()
    }, [])

    useEffect(() => {
        if (!isOpen) return;
        if (active === "cargo" && !cargoLoaded) fetchForCargoType();
        if (active === "route" && !routeLoaded) fetchForRute();
        if (active === "status" && !statusLoaded) fetchForStatus();
        return () => {
            if (abortRef.current) abortRef.current.abort();
        };
    }, [isOpen, active]);

    const TabButton = ({
            tab,
            children,
        }: {
            tab: TabKey;
            children: React.ReactNode;
        }) => {
            const isActive = active === tab;
            return (
                <button
                    onClick={() => setActive(tab)}
                    className={[
                        "w-[33%] rounded-md px-4 py-2 font-medium transition-all",
                        isActive
                            ? "bg-white text-blue-700 shadow"
                            : "bg-blue-100/80 text-blue-900 hover:bg-white/90",
                    ].join(" ")}
                >
                    {children}
                </button>
            );
    };

    return (
        <Dialog
            open={isOpen}
            onClose={() => {
                if (abortRef.current) abortRef.current.abort();
                onClose();
            }}
            className="fixed z-50 inset-0 overflow-y-auto"
        >
            <div className="fixed inset-0 bg-black/60 transition-opacity" aria-hidden="true" />
            <div className="flex items-center justify-center min-h-screen px-4 py-8">
                <Dialog.Panel className="relative bg-white rounded-3xl shadow-2xl w-full max-w-6xl max-h-[90vh] overflow-hidden">
                    {/* HEADER */}
                    <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-8 py-6 text-white">
                        <button
                            onClick={onClose}
                            className="absolute top-6 right-6 text-white/80 hover:text-white transition-colors"
                        >
                            <X className="h-6 w-6" />
                        </button>
                        <div className="flex items-center gap-3 mb-2">
                            <div className="p-2 bg-white/20 rounded-lg">
                                <Route className="w-6 h-6" />
                            </div>
                            <div>
                                <h2 className="text-2xl font-bold">Total of Trips</h2>
                                <p className="text-blue-100 text-sm">
                                    Total number of trips with different search criteria.
                                </p>
                            </div>
                        </div>

                        <div className="flex justify-around mt-5 text-black gap-3">
                            <TabButton tab="cargo">For Cargo Type</TabButton>
                            <TabButton tab="route">For Route</TabButton>
                            <TabButton tab="status">For Status</TabButton>
                        </div>
                    </div>

                    {/* BODY*/}
                    <div className="p-8 overflow-y-auto max-h-[calc(90vh-176px)]">
                        {/* --- CARGO --- */}
                        {active === "cargo" && (
                            <div  className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                                {forCargoType.map((cargo) => (
                                    <div className="p-5 border rounded-2xl hover:bg-gray-50 shadow-sm shadow-blue-300 hover:shadow-md transition-shadow bg-white">
                                        <div className="flex items-center justify-between">
                                            <h3 className="font-semibold">{cargo._id}</h3>
                                            <div className="text-2xl font-bold bg-blue-100 p-1 rounded-md text-blue-800">
                                                {cargo.totalTrips}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* --- ROUTE --- */}
                        {active === "route" && (
                            <div  className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                                {ForRute.map((rute) => (
                                    <div className="p-5 border rounded-2xl hover:bg-gray-50 shadow-sm shadow-blue-300 hover:shadow-md transition-shadow bg-white">
                                        <div className="flex items-center justify-between">
                                            <h3 className="font-semibold">{rute.NombreDeLaRuta}</h3>
                                            <div className="text-2xl font-bold bg-blue-100 p-1 rounded-md text-blue-800">
                                                {rute.totalDeViajes}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* --- STATUS --- */}
                        {active === "status" && (
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                                {ForStatus.map((status) => (
                                    <div className="p-5 border rounded-2xl hover:bg-gray-50 shadow-sm shadow-blue-300 hover:shadow-md transition-shadow bg-white">
                                        <div className="flex items-center justify-between">
                                            <h3 className="font-semibold">
                                                {status._id}
                                            </h3>
                                            <div className="text-2xl font-bold bg-blue-100 p-1 rounded-md text-blue-800">
                                                {status.total}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </Dialog.Panel>
            </div>
        </Dialog>
    );
}
