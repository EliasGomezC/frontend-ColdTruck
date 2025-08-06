export interface Alert2 {
    IDAlert: number
    dateTime: string
    IDTrip: number
    IDTruck: number
    IDBox: number
    IDDriver: {
        name: string
        lastName: string
        secondLastName: string
    }
    humidity?: number
    temperature?: number
}
