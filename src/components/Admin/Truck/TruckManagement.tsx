"use client"

import type React from "react"

import { TruckIcon } from 'lucide-react'
import { useEffect, useMemo, useState } from "react"
import { getBrands } from "../../../services/brandService"
import { getModels } from "../../../services/modelService"
import { getTrucks } from "../../../services/truckService"
import type { Brand } from "../../../types/Brand"
import type { Model } from "../../../types/Model"
import type { Truck } from "../../../types/Truck"
import ModelBrandList from "./ModelBrandList"
import RegisterTruck from "./RegisterTruck"
import TruckList from "./TruckList"

const TruckManagement: React.FC = () => {
  const [activeView, setActiveView] = useState<'trucks' | 'brandsModels'>('trucks')
  const [brands, setBrands] = useState<Brand[]>([])
  const [models, setModels] = useState<Model[]>([])
  const [trucks, setTrucks] = useState<Truck[]>([])
  const [showTruckRegisterForm, setShowTruckRegisterForm] = useState(false)
  const [editingTruck, setEditingTruck] = useState<Truck | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")

  useEffect(() => {
    getBrands().then(setBrands).catch(console.error)
    loadTrucks()
  }, [])

  useEffect(() => {
    getModels().then(setModels).catch(console.error)
    loadTrucks()
  }, [])

  const loadTrucks = async () => {
    try {
      setIsLoading(true)
      const data = await getTrucks()
      const sorted = data.sort((a, b) => b._id - a._id)
      setTrucks(sorted)
    } finally {
      setIsLoading(false)
    }
  }

  const handleTruckRegistered = () => {
    setShowTruckRegisterForm(false)
    loadTrucks()
  }

  const handleUpdated = () => {
    setEditingTruck(null)
    loadTrucks()
  }

  const getBrandName = (truck: Truck): string => {
    if (typeof truck.IDBrand === "number") {
      return brands.find((b) => b._id === truck.IDBrand)?.name || String(truck.IDBrand)
    } else if (truck.IDBrand && typeof truck.IDBrand === "object") {
      return truck.IDBrand.name || "Sin marca"
    }
    return "Sin marca"
  }

  const getModelName = (truck: Truck): string => {
    if (typeof truck.IDModel === "number") {
      return String(truck.IDModel)
    } else if (truck.IDModel && typeof truck.IDModel === "object") {
      return truck.IDModel.name || "Sin modelo"
    }
    return "Sin modelo"
  }

  // Filter trucks based on search term
  const filteredTrucks = useMemo(() => {
    if (!searchTerm.trim()) return trucks
    const searchLower = searchTerm.toLowerCase().trim()

    return trucks.filter((truck) => {
      const plates = (truck.plates || "").toLowerCase()
      const brandName = getBrandName(truck).toLowerCase()
      const modelName = getModelName(truck).toLowerCase()
      const capacity = truck.loadCapacity ? truck.loadCapacity.toString() : ""

      return (
        plates.includes(searchLower) ||
        brandName.includes(searchLower) ||
        modelName.includes(searchLower) ||
        capacity.includes(searchLower)
      )
    })
  }, [trucks, searchTerm, brands])

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setSearchTerm(value)
  }

  const statusStyles = {
    Available: 'bg-green-100  text-green-800',
    'On Trip': 'bg-blue-100   text-blue-800',
    'Under Maintenance': 'bg-yellow-100 text-yellow-800',
    Inactive: 'bg-red-100   text-red-800',
  };

  const tabClasses = (tab: string) =>
    `cursor-pointer p-4 rounded-xl duration-500 ${activeView === tab
      ? 'bg-blue-600 text-white shadow-xl scale-105'
      : 'bg-blue-50 hover:bg-blue-200 text-slate-900'
    }`

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header Section */}
        <div className="mb-4">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-2">
            {/* BOTÓN TRUCK */}
            <div onClick={() => setActiveView('trucks')} className={tabClasses('trucks')}>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-white rounded-xl">
                  <TruckIcon className={`h-6 w-6 ${activeView === 'trucks' ? 'text-blue-600' : 'text-blue-500'}`} />
                </div>
                <h1 className="text-3xl font-bold ">Truck Management</h1>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <span>Total trucks:</span>
                <span className="inline-flex items-center px-3 py-1 rounded-full font-semibold bg-blue-100 text-blue-800">
                  {trucks.length}
                </span>
              </div>
            </div>

            {/* BOTÓN BRAND & MODEL */}
            <div
              onClick={() => setActiveView('brandsModels')}
              className={tabClasses('brandsModels')}>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-white rounded-xl">
                  <TruckIcon className={`h-6 w-6 ${activeView === 'brandsModels' ? 'text-blue-600' : 'text-blue-500'}`}/>
                </div>
                <h1 className="text-3xl font-bold ">Brand & Model Management</h1>
              </div>
              <div className="flex gap-4 items-center">
                <div className="flex items-center gap-2 text-sm">
                  <span >Total Brands:</span>
                  <span className="inline-flex items-center px-3 py-1 rounded-full font-semibold bg-blue-100 text-blue-800">
                    {brands.length}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <span >Total Models:</span>
                  <span className="inline-flex items-center px-3 py-1 rounded-full font-semibold bg-blue-100 text-blue-800">
                    {models.length}
                  </span>
                </div>
              </div>
            </div>

          </div>
        </div>

        {/* Registration Form */}
        <RegisterTruck
          isOpen={showTruckRegisterForm}
          onClose={() => {
            setShowTruckRegisterForm(false)
            loadTrucks()
          }}
        />


        {activeView === 'trucks' && <TruckList />}
        {activeView === 'brandsModels' && <ModelBrandList />}

      </div>
    </div>
  )
}

export default TruckManagement
