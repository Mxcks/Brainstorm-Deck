export interface ComponentState {
  [key: string]: any
}

export interface EventData {
  [key: string]: any
}

export interface ActionResult {
  success: boolean
  message?: string
  data?: any
  error?: string
}

export interface BackendContext {
  eventBus: EventBus
  stateManager: StateManager
  dataStore: DataStore
  componentRegistry: ComponentRegistry
}

export interface ComponentHandler {
  componentId: string
  actions: {
    [actionName: string]: (
      componentId: string, 
      data: any, 
      context: BackendContext
    ) => Promise<ActionResult>
  }
  initialize?: (componentId: string, initialData: any) => ComponentState
  cleanup?: (componentId: string) => void
}

export interface EventBus {
  emit: (event: string, data: EventData) => void
  on: (event: string, handler: (data: EventData) => void) => void
  off: (event: string, handler: (data: EventData) => void) => void
  once: (event: string, handler: (data: EventData) => void) => void
}

export interface StateManager {
  getState: (componentId: string) => ComponentState
  updateComponent: (componentId: string, updates: Partial<ComponentState>) => void
  setGlobal: (key: string, value: any) => void
  getGlobal: (key: string) => any
  reset: () => void
  removeComponent: (componentId: string) => void
}

export interface DataStore {
  set: (key: string, value: any) => void
  get: (key: string) => any
  delete: (key: string) => void
  clear: () => void
  has: (key: string) => boolean
}

export interface ComponentRegistry {
  getHandler: (componentId: string) => ComponentHandler | undefined
  registerHandler: (handler: ComponentHandler) => void
  getHandlers: () => ComponentHandler[]
}

export interface BackendEngine {
  handleAction: (
    componentId: string, 
    componentType: string, 
    action: string, 
    data: any
  ) => Promise<ActionResult>
  initializeComponent: (componentId: string, componentType: string, initialData: any) => void
  cleanupComponent: (componentId: string, componentType: string) => void
  getContext: () => BackendContext
}
