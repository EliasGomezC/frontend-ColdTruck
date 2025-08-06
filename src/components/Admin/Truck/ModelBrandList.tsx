"use client"

import { Building2, Car, Check, Pencil, PlusIcon, SearchIcon, X } from "lucide-react"
import type React from "react"
import { useEffect, useState } from "react"
import { getBrandsWithModels, updateBrand } from "../../../services/brandService"
import { updateModel } from "../../../services/modelService"
import type { Brand as BaseBrand } from "../../../types/Brand"
import ModalBrandRegister from "./ModalRegisterBrand"
import ModalModelRegister from "./ModalRegisterModel"

type Model = {
  _id: number
  name: string
  IDBrand: number
}

type BrandWithModels = BaseBrand & {
  models: Model[]
}

const ModelBrandList: React.FC = () => {
  const [showBrandRegisterForm, setShowBrandRegisterForm] = useState(false)
  const [showModelRegisterForm, setShowModelRegisterForm] = useState<{ show: boolean; brandId: number } | null>(null)
  const [brands, setBrands] = useState<BrandWithModels[]>([])
  const [filteredBrands, setFilteredBrands] = useState<BrandWithModels[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [editingBrand, setEditingBrand] = useState<{ brandId: number; name: string } | null>(null)
  const [editingModel, setEditingModel] = useState<{ modelId: number; name: string; IDBrand: number } | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  const handleBrandCreated = async () => {
    setShowBrandRegisterForm(false)
    await refreshBrands()
  }

  const handleModelCreated = async () => {
    setShowModelRegisterForm(null)
    await refreshBrands()
  }

  const handleOpenModelRegister = (brandId: number) => {
    setShowModelRegisterForm({ show: true, brandId })
  }

  const handleCloseModelRegister = () => {
    setShowModelRegisterForm(null)
  }

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true)
      try {
        const data = await getBrandsWithModels()
        setBrands(data)
        setFilteredBrands(data)
      } catch (error) {
        console.error("Error fetching brands:", error)
      } finally {
        setIsLoading(false)
      }
    }
    fetchData()
  }, [])

  useEffect(() => {
    const filtered = brands.filter(
      (brand) =>
        brand.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        brand.models.some((model) => model.name.toLowerCase().includes(searchTerm.toLowerCase())),
    )
    setFilteredBrands(filtered)
  }, [searchTerm, brands])

  const refreshBrands = async () => {
    const data = await getBrandsWithModels()
    setBrands(data)
    setFilteredBrands(data)
  }

  // BRAND HANDLERS
  const handleEditBrand = (brandId: number, name: string) => {
    setEditingBrand({ brandId, name })
  }

  const handleChangeBrand = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (editingBrand) {
      setEditingBrand({ ...editingBrand, name: e.target.value })
    }
  }

  const saveBrand = async () => {
    if (editingBrand) {
      const trimmed = editingBrand.name.trim()
      if (!trimmed) return // evita guardar vacío
      await updateBrand(editingBrand.brandId, trimmed)
      setEditingBrand(null)
      await refreshBrands()
    }
  }

  const cancelBrandEdit = () => setEditingBrand(null)

  // MODEL HANDLERS
  const handleEditModel = (modelId: number, name: string, IDBrand: number) => {
    setEditingModel({ modelId, name, IDBrand })
  }

  const handleChangeModel = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (editingModel) {
      setEditingModel({ ...editingModel, name: e.target.value })
    }
  }

  const saveModel = async () => {
    if (editingModel) {
      const trimmed = editingModel.name.trim()
      if (!trimmed) return // evita guardar vacío
      await updateModel(editingModel.modelId, trimmed, editingModel.IDBrand)
      setEditingModel(null)
      await refreshBrands()
    }
  }

  const cancelModelEdit = () => setEditingModel(null)

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white p-6">
        <div className="max-w-6xl mx-auto">
          <div className="animate-pulse space-y-6">
            <div className="h-12 bg-blue-100 rounded-lg w-full max-w-md"></div>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="bg-blue-50 rounded-lg p-6">
                  <div className="space-y-4">
                    <div className="h-6 bg-blue-200 rounded w-2/3"></div>
                    <div className="space-y-2">
                      {[...Array(3)].map((_, j) => (
                        <div key={j} className="h-4 bg-blue-100 rounded w-full"></div>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen p-6">
      <div className="flex justify-end flex-shrink-0 p-2">
        <button
          onClick={() => setShowBrandRegisterForm(!showBrandRegisterForm)}
          className={`group inline-flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 transform hover:-translate-y-0.5`}
        >
          <PlusIcon
            className={`h-5 w-5 transition-transform duration-200 ${showBrandRegisterForm ? "rotate-45" : "group-hover:scale-110"}`}
          />
          {showBrandRegisterForm ? "Cancel" : "Add New Brand"}
        </button>
      </div>

      <div className="mx-auto space-y-6">
        {/* Search Input */}
        <div className="relative mb-8 bg-white rounded-2xl shadow-xl border border-slate-200 p-6">
          <div className="absolute inset-y-0 left-0 pl-10 flex items-center pointer-events-none">
            <SearchIcon className="h-5 w-5 text-slate-400" />
          </div>
          <input
            type="text"
            placeholder="Search brands or models..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="block w-full pl-12 pr-4 py-3 border border-slate-300 rounded-xl leading-5 bg-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
          />
          {searchTerm && (
            <div className="mt-3 flex items-center justify-between text-sm">
              <span>Showing {filteredBrands.length} Brands</span>
              <button
                onClick={() => setSearchTerm("")}
                className="text-blue-600 hover:text-blue-800 font-medium transition-colors"
              >
                Clear search
              </button>
            </div>
          )}
        </div>

        {/* Grid de Marcas */}
        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {filteredBrands.map((brand) => (
            <div
              key={brand._id}
              className="group bg-white border border-blue-100 rounded-xl p-5 shadow-md hover:shadow-lg transition"
            >
              {/* Header Marca */}
              <div className="mb-4">
                {editingBrand?.brandId === brand._id ? (
                  <div className="flex items-center gap-2 justify-between">
                    <input
                      type="text"
                      value={editingBrand.name}
                      onChange={handleChangeBrand}
                      className="flex-1 px-3 py-2 border border-blue-300 rounded-md text-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                      autoFocus
                    />
                    <button
                      onClick={saveBrand}
                      className="p-2 bg-blue-500 hover:bg-blue-600 text-white rounded transition-colors"
                    >
                      <Check className="h-6 w-6" />
                    </button>
                    <button
                      onClick={cancelBrandEdit}
                      className="p-2 bg-white border border-blue-300 text-blue-600 rounded hover:bg-blue-50 transition-colors"
                    >
                      <X className="h-6 w-6" />
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-blue-500 rounded">
                        <Building2 className="h-4 w-4 text-white" />
                      </div>
                      <h3 className="text-xl font-semibold text-blue-900">{brand.name}</h3>
                    </div>
                    <button
                      onClick={() => handleEditBrand(brand._id, brand.name)}
                      className="opacity-0 group-hover:opacity-100 text-blue-500 hover:text-blue-600 transition"
                    >
                      <Pencil className="h-6 w-6" />
                    </button>
                  </div>
                )}
              </div>

              {/* Lista de Modelos */}
              <div className="space-y-2 mb-4">
                {brand.models.length === 0 ? (
                  <div className="text-center py-4 text-blue-400 text-sm">
                    <Car className="h-5 w-5 mx-auto mb-1" />
                    No models
                  </div>
                ) : (
                  brand.models.map((model) => (
                    <div
                      key={model._id}
                      className="group/model flex items-center gap-3 text-sm p-2 rounded hover:bg-blue-50 transition"
                    >
                      {editingModel?.modelId === model._id ? (
                        <>
                          <Car className="h-4 w-4 text-blue-400 flex-shrink-0" />
                          <input
                            type="text"
                            value={editingModel.name}
                            onChange={handleChangeModel}
                            className="flex-1 px-2 py-1 border border-blue-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                            autoFocus
                          />
                          <button
                            onClick={saveModel}
                            className="p-1 bg-blue-500 hover:bg-blue-600 text-white rounded transition-colors"
                          >
                            <Check className="h-5 w-5" />
                          </button>
                          <button
                            onClick={cancelModelEdit}
                            className="p-1 bg-white border border-blue-300 text-blue-600 rounded hover:bg-blue-50 transition-colors"
                          >
                            <X className="h-5 w-5" />
                          </button>
                        </>
                      ) : (
                        <>
                          <Car className="h-5 w-5 text-blue-400 flex-shrink-0" />
                          <span className="flex-1 text-blue-800">{model.name}</span>
                          <button
                            onClick={() => handleEditModel(model._id, model.name, model.IDBrand)}
                            className="opacity-0 group-hover/model:opacity-100 text-blue-500 hover:text-blue-600 transition"
                          >
                            <Pencil className="h-5 w-5" />
                          </button>
                        </>
                      )}
                    </div>
                  ))
                )}
              </div>

              {/* Botón Agregar Modelo */}
              <div className="border-t border-blue-100 pt-3">
                <button
                  onClick={() => handleOpenModelRegister(brand._id)}
                  className="w-full flex items-center justify-center gap-2 py-2 px-4 bg-blue-50 hover:bg-blue-100 text-blue-600 rounded-lg transition-colors duration-200 group/add"
                >
                  <PlusIcon className="h-4 w-4 group-hover/add:scale-110 transition-transform" />
                  <span className="text-sm font-medium">Add Model</span>
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Modales */}
        {showBrandRegisterForm && (
          <ModalBrandRegister onClose={() => setShowBrandRegisterForm(false)} onCreated={handleBrandCreated} />
        )}

        {showModelRegisterForm && (
          <ModalModelRegister
            brands={brands}
            defaultBrandId={showModelRegisterForm.brandId}
            onClose={handleCloseModelRegister}
            onCreated={handleModelCreated}
          />
        )}
      </div>
    </div>
  )
}

export default ModelBrandList
