import { CargoType } from './CargoType'
import { Rute } from './Rute'
import { Truck } from './Truck'
import { User } from './index'

export interface AlertInfo {
    IDAlert: number
    type: string
    description: string
    dateTime: string
    temperature?: number
    humidity?: number
}

export interface Trip {
    _id: number
    scheduledDepartureDate: string
    scheduledArrivalDate: string
    actualDepartureDate?: string
    actualArrivalDate?: string
    estimatedDistance: number
    status: 'Completed' | 'In Transit' | 'Canceled' | 'Scheduled'
    IDDriver: number | User
    IDAdmin: number
    IDBox: number
    IDRute: number | Rute
    IDTruck: number | Truck
    IDCargoType: number | CargoType
    alerts?: AlertInfo[]
}

export interface TripsForCargoType {
    _id: string
    totalTrips: number
}

export interface TripsForRute {
    NombreDeLaRuta: string
    totalDeViajes: number
}

export interface TripsForStatus {
    _id: string
    total: number
}
