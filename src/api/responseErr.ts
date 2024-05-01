interface errors {
  field: string
  message: string
}

export interface ResponseErr {
  causes: errors[]
  code: number
  error: string
  message: string
}