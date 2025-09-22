// API client for CRUD operations
// This simulates API calls that would normally go to Supabase

export interface ApiResponse<T> {
  data: T | null
  error: string | null
  loading?: boolean
}

export interface CreateResponse {
  id: string
  success: boolean
}

export interface UpdateResponse {
  success: boolean
}

export interface DeleteResponse {
  success: boolean
}

class ApiClient {
  private baseDelay = 800 // Simulate network delay

  private async simulateApiCall<T>(data: T, shouldFail = false): Promise<ApiResponse<T>> {
    await new Promise((resolve) => setTimeout(resolve, this.baseDelay))

    if (shouldFail) {
      return {
        data: null,
        error: "Error de conexión. Inténtalo de nuevo.",
      }
    }

    return {
      data,
      error: null,
    }
  }

  // Beaches CRUD
  async createBeach(beach: Omit<any, "id">): Promise<ApiResponse<CreateResponse>> {
    console.log("[API] Creating beach:", beach)
    return this.simulateApiCall({
      id: `beach_${Date.now()}`,
      success: true,
    })
  }

  async updateBeach(id: string, beach: Partial<any>): Promise<ApiResponse<UpdateResponse>> {
    console.log("[API] Updating beach:", id, beach)
    return this.simulateApiCall({ success: true })
  }

  async deleteBeach(id: string): Promise<ApiResponse<DeleteResponse>> {
    console.log("[API] Deleting beach:", id)
    return this.simulateApiCall({ success: true })
  }

  // Restaurants CRUD
  async createRestaurant(restaurant: Omit<any, "id">): Promise<ApiResponse<CreateResponse>> {
    console.log("[API] Creating restaurant:", restaurant)
    return this.simulateApiCall({
      id: `restaurant_${Date.now()}`,
      success: true,
    })
  }

  async updateRestaurant(id: string, restaurant: Partial<any>): Promise<ApiResponse<UpdateResponse>> {
    console.log("[API] Updating restaurant:", id, restaurant)
    return this.simulateApiCall({ success: true })
  }

  async deleteRestaurant(id: string): Promise<ApiResponse<DeleteResponse>> {
    console.log("[API] Deleting restaurant:", id)
    return this.simulateApiCall({ success: true })
  }

  // Activities CRUD
  async createActivity(activity: Omit<any, "id">): Promise<ApiResponse<CreateResponse>> {
    console.log("[API] Creating activity:", activity)
    return this.simulateApiCall({
      id: `activity_${Date.now()}`,
      success: true,
    })
  }

  async updateActivity(id: string, activity: Partial<any>): Promise<ApiResponse<UpdateResponse>> {
    console.log("[API] Updating activity:", id, activity)
    return this.simulateApiCall({ success: true })
  }

  async deleteActivity(id: string): Promise<ApiResponse<DeleteResponse>> {
    console.log("[API] Deleting activity:", id)
    return this.simulateApiCall({ success: true })
  }

  // House Rules CRUD
  async createHouseRule(rule: Omit<any, "id">): Promise<ApiResponse<CreateResponse>> {
    console.log("[API] Creating house rule:", rule)
    return this.simulateApiCall({
      id: `rule_${Date.now()}`,
      success: true,
    })
  }

  async updateHouseRule(id: string, rule: Partial<any>): Promise<ApiResponse<UpdateResponse>> {
    console.log("[API] Updating house rule:", id, rule)
    return this.simulateApiCall({ success: true })
  }

  async deleteHouseRule(id: string): Promise<ApiResponse<DeleteResponse>> {
    console.log("[API] Deleting house rule:", id)
    return this.simulateApiCall({ success: true })
  }

  // House Guide Items CRUD
  async createHouseGuideItem(item: Omit<any, "id">): Promise<ApiResponse<CreateResponse>> {
    console.log("[API] Creating house guide item:", item)
    return this.simulateApiCall({
      id: `guide_item_${Date.now()}`,
      success: true,
    })
  }

  async updateHouseGuideItem(id: string, item: Partial<any>): Promise<ApiResponse<UpdateResponse>> {
    console.log("[API] Updating house guide item:", id, item)
    return this.simulateApiCall({ success: true })
  }

  async deleteHouseGuideItem(id: string): Promise<ApiResponse<DeleteResponse>> {
    console.log("[API] Deleting house guide item:", id)
    return this.simulateApiCall({ success: true })
  }

  // Sections CRUD
  async createSection(section: Omit<any, "id">): Promise<ApiResponse<CreateResponse>> {
    console.log("[API] Creating section:", section)
    return this.simulateApiCall({
      id: `section_${Date.now()}`,
      success: true,
    })
  }

  async updateSection(id: string, section: Partial<any>): Promise<ApiResponse<UpdateResponse>> {
    console.log("[API] Updating section:", id, section)
    return this.simulateApiCall({ success: true })
  }

  async deleteSection(id: string): Promise<ApiResponse<DeleteResponse>> {
    console.log("[API] Deleting section:", id)
    return this.simulateApiCall({ success: true })
  }

  // Property and Guide CRUD
  async updateProperty(id: string, property: Partial<any>): Promise<ApiResponse<UpdateResponse>> {
    console.log("[API] Updating property:", id, property)
    return this.simulateApiCall({ success: true })
  }

  async updateGuide(id: string, guide: Partial<any>): Promise<ApiResponse<UpdateResponse>> {
    console.log("[API] Updating guide:", id, guide)
    return this.simulateApiCall({ success: true })
  }

  async updateContactInfo(id: string, contactInfo: Partial<any>): Promise<ApiResponse<UpdateResponse>> {
    console.log("[API] Updating contact info:", id, contactInfo)
    return this.simulateApiCall({ success: true })
  }

  async updatePracticalInfo(id: string, practicalInfo: Partial<any>): Promise<ApiResponse<UpdateResponse>> {
    console.log("[API] Updating practical info:", id, practicalInfo)
    return this.simulateApiCall({ success: true })
  }
}

export const apiClient = new ApiClient()
