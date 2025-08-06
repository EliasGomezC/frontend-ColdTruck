import { Brand } from './Brand'
import { Model } from './Model'

export interface BrandWithModels extends Brand {
    models: Model[]
}